// ─── /api/export — PDF + DOCX Export ────────────────────────────────────────
// POST: { runId, format: 'pdf' | 'docx' }
// Returns the generated file as a download, or a signed URL.

import { NextRequest, NextResponse } from 'next/server'
import { ExportRequestSchema } from '@/lib/research/schema'
import { getRunById, saveGeneratedFile, getSupabaseAdmin } from '@/lib/supabase/admin'
import { generateDocxBuffer } from '@/lib/research/docx-generator'
import { renderReportHtml } from '@/lib/research/report-template'
import type { ResearchResult } from '@/lib/research/schema'
import { log, generateRequestId, timer } from '@/lib/research/logger'

export const maxDuration = 30

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  const elapsed = timer()

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ ok: false, message: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = ExportRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: parsed.error.issues.map(i => i.message).join('; ') }, { status: 400 })
  }

  const { runId, format } = parsed.data

  log.info(`Export request: ${format}`, { requestId, runId })

  // ─── Get run data ───────────────────────────────────────────────────────
  const data = await getRunById(runId)
  if (!data?.result) {
    return NextResponse.json({ ok: false, message: 'Run not found or has no results' }, { status: 404 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = data.run as any, res = data.result as any

  // Rebuild the ResearchResult from DB data
  const result: ResearchResult = {
    runId: r.run_id,
    query: r.query,
    mode: r.mode,
    status: r.status,
    pipelineSource: r.pipeline_source ?? 'gemini-direct',
    confidenceScore: r.confidence_score ?? 0,
    durationMs: r.duration_ms,
    createdAt: r.created_at,
    title: res.title,
    executiveSummary: res.executive_summary ?? '',
    findings: res.findings ?? [],
    outline: res.outline ?? [],
    stats: res.stats ?? [],
    sources: res.sources ?? [],
    discussionStarters: res.discussion_starters ?? [],
    evidenceItems: res.evidence_items ?? [],
    uncertaintyNotes: res.uncertainty_notes ?? [],
    costBreakdown: r.cost_usd ? { model: 'gemini-2.0-flash', inputTokens: 0, outputTokens: 0, costUsd: r.cost_usd } : undefined,
  }

  try {
    if (format === 'docx') {
      // ─── DOCX Generation (server-side, pure JS) ───────────────────────
      log.step('docx', 'Generating DOCX', { requestId, runId })
      const buffer = await generateDocxBuffer(result)
      const filename = `verdant-${runId}.docx`

      // Try to upload to Supabase Storage
      const sb = getSupabaseAdmin()
      if (sb) {
        const { error } = await sb.storage
          .from('reports')
          .upload(`docx/${filename}`, buffer, {
            contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            upsert: true,
          })

        if (!error) {
          const { data: urlData } = sb.storage.from('reports').getPublicUrl(`docx/${filename}`)
          await saveGeneratedFile({
            run_id: runId,
            file_type: 'docx',
            file_url: urlData.publicUrl,
            file_size: buffer.length,
          })
          log.info('DOCX uploaded to Supabase Storage', { requestId, runId })
        } else {
          log.warn(`Supabase Storage upload failed: ${error.message}`, { requestId, runId })
        }
      }

      log.info(`DOCX generated (${buffer.length} bytes)`, { requestId, runId, durationMs: elapsed() })

      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': String(buffer.length),
          'X-Request-Id': requestId,
        },
      })

    } else if (format === 'pdf') {
      // ─── PDF Generation ─────────────────────────────────────────────
      const pdfServiceUrl = process.env.PDF_SERVICE_URL

      if (pdfServiceUrl) {
        // Railway headless Chromium service
        log.step('pdf', 'Calling Railway PDF service', { requestId, runId })
        const html = renderReportHtml(result)

        const pdfResponse = await fetch(pdfServiceUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ html, filename: `verdant-${runId}.pdf` }),
          signal: AbortSignal.timeout(25_000),
        })

        if (pdfResponse.ok) {
          const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer())
          const filename = `verdant-${runId}.pdf`

          // Upload to Supabase Storage
          const sb = getSupabaseAdmin()
          if (sb) {
            await sb.storage.from('reports').upload(`pdf/${filename}`, pdfBuffer, {
              contentType: 'application/pdf',
              upsert: true,
            }).catch(() => {})
          }

          log.info(`PDF generated via Railway (${pdfBuffer.length} bytes)`, { requestId, runId, durationMs: elapsed() })

          return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${filename}"`,
              'Content-Length': String(pdfBuffer.length),
            },
          })
        }

        log.warn('Railway PDF service failed, falling back to HTML', { requestId, runId })
      }

      // Fallback: return print-optimized HTML
      log.step('pdf', 'Generating print-optimized HTML (PDF fallback)', { requestId, runId })
      const html = renderReportHtml(result)

      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Fallback': 'html-print',
          'X-Request-Id': requestId,
        },
      })
    }

    return NextResponse.json({ ok: false, message: 'Unsupported format' }, { status: 400 })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Export generation failed'
    log.error(`Export failed: ${message}`, { requestId, runId, durationMs: elapsed() })

    return NextResponse.json({
      ok: false,
      status: 500,
      message,
      retryable: true,
      failedStep: `export-${format}`,
      runId,
    }, { status: 500 })
  }
}
