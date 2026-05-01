// ─── POST /api/research/start — Create a research job ────────────────────────
// Returns jobId immediately. Focus/Deep run inline. Analytica queues for async.
// All job state persisted to Supabase (durable source of truth).
// Idempotency is DB-backed via research_jobs.idempotency_key.

import { NextRequest, NextResponse } from 'next/server'
import { ResearchRequestSchema } from '@/lib/research/schema'
import { runResearchPipeline } from '@/lib/research/pipeline'
import { createJob, completeJob, failJob, updateJob, findByIdempotencyKey, logEvent } from '@/lib/research/jobs'
import { checkRateLimit } from '@/lib/research/rate-limit'
import { log, generateRequestId, generateRunId } from '@/lib/research/logger'
import { saveResearchRun, saveResearchResult } from '@/lib/supabase/admin'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  try {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  // Rate limit
  const rateLimit = checkRateLimit(ip)
  if (!rateLimit.allowed) {
    return NextResponse.json({ ok: false, message: 'Too many requests. Please wait.' }, { status: 429 })
  }

  // Parse body
  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ ok: false, message: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = ResearchRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: `Validation: ${parsed.error.issues.map(i => i.message).join('; ')}` }, { status: 400 })
  }

  const { query, mode, idempotencyKey, presetId } = parsed.data
  const runId = generateRunId()

  // ─── Idempotency: check DB for existing job (durable, survives restarts) ──
  if (idempotencyKey) {
    const existing = await findByIdempotencyKey(idempotencyKey)
    if (existing) {
      if (existing.status === 'ready' && existing.result) {
        return NextResponse.json({ ok: true, jobId: existing.jobId, status: 'ready', cached: true, result: existing.result })
      }
      return NextResponse.json({ ok: true, jobId: existing.jobId, status: existing.status, cached: true, async: existing.mode === 'analytica' || existing.mode === 'deep', progress: existing.progress, stage: existing.stage })
    }
  }

  // Create the durable job — DB insert is mandatory
  let job
  try {
    job = await createJob({ query, mode, presetId, runId, idempotencyKey: idempotencyKey ?? undefined })
  } catch (err) {
    const msg = (err as Error).message
    log.error(`Job creation failed (DB unavailable): ${msg}`, { requestId })
    return NextResponse.json({
      ok: false,
      message: 'Research infrastructure temporarily unavailable. Please try again in a moment.',
      retryable: true,
    }, { status: 503 })
  }

  log.info(`Job created: ${job.jobId} mode=${mode}`, { requestId, runId })

  // ─── Focus: run inline (fits within 60s easily) ────────────────────────
  if (mode === 'focus') {
    await updateJob(job.jobId, { status: 'evidence_synthesis', stage: 'Synthesizing evidence & findings', progress: 30, startedAt: new Date().toISOString() })

    try {
      const { result } = await runResearchPipeline({ query, mode, requestId, presetId })
      await completeJob(job.jobId, result, {
        confidenceScore: result.confidenceScore,
        sourceCount: (result as any).sources?.length,
        evidenceCount: (result as any).evidenceItems?.length,
        exportReady: false,
      })

      // Persist research run (best-effort)
      try {
        await saveResearchRun({
          run_id: result.runId, query: result.query, mode: result.mode,
          status: 'ready', pipeline_source: result.pipelineSource,
          confidence_score: result.confidenceScore, duration_ms: result.durationMs,
          request_id: requestId,
        })
      } catch { /* non-critical */ }
      try {
        await saveResearchResult({
          run_id: result.runId,
          title: result.title ?? '',
          executive_summary: result.executiveSummary,
          findings: result.findings ?? [],
          outline: result.outline ?? [],
          stats: result.stats ?? [],
          sources: result.sources ?? [],
          evidence_items: result.evidenceItems ?? [],
          uncertainty_notes: result.uncertaintyNotes ?? [],
          decision_recommendations: result.decisionRecommendations,
          contradictions: result.contradictions,
          strategic_follow_ups: result.strategicFollowUps,
        })
      } catch { /* non-critical */ }

      return NextResponse.json({
        ok: true,
        jobId: job.jobId,
        status: 'ready',
        progress: 100,
        result,
      })
    } catch (err) {
      await failJob(job.jobId, (err as Error).message)
      return NextResponse.json({
        ok: true,
        jobId: job.jobId,
        status: 'failed',
        errorReason: (err as Error).message,
      })
    }
  }

  // ─── Deep & Analytica: return job ID immediately, process async ────────
  const etaMap: Record<string, number> = { deep: 60, analytica: 180 }
  const stageLabel = mode === 'analytica' ? 'Queued for Analytica processing' : 'Queued for Deep analysis'
  await updateJob(job.jobId, { status: 'queued', stage: stageLabel, progress: 5 })

  return NextResponse.json({
    ok: true,
    jobId: job.jobId,
    status: 'queued',
    progress: 5,
    stage: stageLabel,
    etaSeconds: etaMap[mode] ?? 60,
    async: true,
  })
  } catch (err) {
    const msg = (err as Error).message ?? 'Unknown error'
    const stack = (err as Error).stack ?? ''
    console.error('[start] Unhandled error:', msg, stack)
    return NextResponse.json({ ok: false, message: `Server error: ${msg}`, requestId }, { status: 500 })
  }
}
