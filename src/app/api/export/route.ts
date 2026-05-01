// ─── /api/export — PDF + DOCX Export ────────────────────────────────────────
// POST: { runId, format: 'pdf' | 'docx' }
// Returns the generated file as a download, or a signed URL.
// Export state is durably tracked in the research_jobs table.

import { NextRequest, NextResponse } from 'next/server'
import { ExportRequestSchema } from '@/lib/research/schema'
import { getRunById, saveGeneratedFile, getSupabaseAdmin } from '@/lib/supabase/admin'
import { generateDocxBuffer } from '@/lib/research/docx-generator'
import { renderReportHtml } from '@/lib/research/report-template'
import type { ResearchResult } from '@/lib/research/schema'
import { log, generateRequestId, timer } from '@/lib/research/logger'
import { logEvent } from '@/lib/research/jobs'

// ─── Durable export state tracking ──────────────────────────────────────────
// Updates the research_jobs row (if it exists) to track export lifecycle.
async function trackExportState(runId: string, state: {
  exportStatus?: string
  exportReady?: boolean
  exportGenerationAttempts?: number
  exportFailureReason?: string
  exportFilePath?: string
  exportFileSize?: number
}) {
  const sb = getSupabaseAdmin()
  if (!sb) return
  try {
    // Find the job by run_id to update export state
    const updateData: Record<string, unknown> = {}
    if (state.exportStatus !== undefined) updateData.export_status = state.exportStatus
    if (state.exportReady !== undefined) updateData.export_ready = state.exportReady
    if (state.exportFilePath !== undefined) updateData.export_file_path = state.exportFilePath
    if (state.exportFileSize !== undefined) updateData.export_file_size = state.exportFileSize
    if (state.exportFailureReason !== undefined) updateData.export_failure_reason = state.exportFailureReason

    // Increment generation attempts
    if (state.exportGenerationAttempts !== undefined) {
      updateData.export_generation_attempts = state.exportGenerationAttempts
    }

    await sb.from('research_jobs').update(updateData).eq('run_id', runId)
  } catch {
    // Non-critical — export still works even if tracking fails
  }
}

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
    decisionRecommendations: res.decision_recommendations ?? [],
    outline: res.outline ?? [],
    stats: res.stats ?? [],
    sources: res.sources ?? [],
    evidenceItems: res.evidence_items ?? [],
    contradictions: res.contradictions ?? [],
    uncertaintyNotes: res.uncertainty_notes ?? [],
    strategicFollowUps: res.strategic_follow_ups ?? [],
    costBreakdown: r.cost_usd ? { model: 'gemini-2.0-flash', inputTokens: 0, outputTokens: 0, costUsd: r.cost_usd } : undefined,
  }

  try {
    if (format === 'docx') {
      // ─── DOCX Generation (server-side, pure JS) ───────────────────────
      log.step('docx', 'Generating DOCX', { requestId, runId })

      // Track export state: generating
      await trackExportState(runId, { exportStatus: 'generating' })

      const buffer = await generateDocxBuffer(result)
      const filename = `verdant-${runId}.docx`

      // Try to upload to Supabase Storage
      const sb = getSupabaseAdmin()
      let uploadedUrl: string | undefined
      if (sb) {
        const { error } = await sb.storage
          .from('reports')
          .upload(`docx/${filename}`, buffer, {
            contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            upsert: true,
          })

        if (!error) {
          const { data: urlData } = sb.storage.from('reports').getPublicUrl(`docx/${filename}`)
          uploadedUrl = urlData.publicUrl
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

      // Track export state: ready (durable)
      await trackExportState(runId, {
        exportStatus: 'ready',
        exportReady: true,
        exportFilePath: uploadedUrl ?? `docx/${filename}`,
        exportFileSize: buffer.length,
      })
      await logEvent(`export_${runId}`, 'export_completed', 'generating', 'ready', { format: 'docx', fileSize: buffer.length })

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

    // Track export failure state (durable)
    await trackExportState(runId, {
      exportStatus: 'failed',
      exportFailureReason: message,
    })
    await logEvent(`export_${runId}`, 'export_failed', 'generating', 'failed', { format, error: message })

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
