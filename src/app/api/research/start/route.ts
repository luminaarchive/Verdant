// ─── POST /api/research/start — Create a research job ────────────────────────
// Returns jobId immediately. Focus/Deep run inline. Analytica queues for async.

import { NextRequest, NextResponse } from 'next/server'
import { ResearchRequestSchema } from '@/lib/research/schema'
import { runResearchPipeline } from '@/lib/research/pipeline'
import { createJob, completeJob, failJob, updateJob } from '@/lib/research/jobs'
import { checkRateLimit, checkIdempotency, setIdempotency } from '@/lib/research/rate-limit'
import { log, generateRequestId, timer } from '@/lib/research/logger'
import { generateRunId } from '@/lib/research/logger'
import { saveResearchRun, saveResearchResult } from '@/lib/supabase/admin'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
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

  // Idempotency
  if (idempotencyKey) {
    const existing = checkIdempotency(idempotencyKey)
    if (existing) {
      return NextResponse.json({ ok: true, jobId: existing, status: 'ready', cached: true })
    }
  }

  // Create the job
  const job = createJob({ query, mode, presetId, runId })
  log.info(`Job created: ${job.jobId} mode=${mode}`, { requestId, runId })

  if (idempotencyKey) setIdempotency(idempotencyKey, job.jobId)

  // ─── Focus & Deep: run inline (fits within 60s) ───────────────────────
  if (mode === 'focus' || mode === 'deep') {
    const elapsed = timer()
    updateJob(job.jobId, { status: 'evidence_synthesis', stage: 'Synthesizing evidence & findings', progress: 30, startedAt: new Date().toISOString() })

    try {
      const { result } = await runResearchPipeline({ query, mode, requestId, presetId })
      completeJob(job.jobId, result, {
        confidenceScore: result.confidenceScore,
        sourceCount: (result as any).sources?.length,
        evidenceCount: (result as any).evidenceItems?.length,
        exportReady: false,
      })

      // Persist (best-effort)
      await saveResearchRun({
        run_id: result.runId, query: result.query, mode: result.mode,
        status: 'ready', pipeline_source: result.pipelineSource,
        confidence_score: result.confidenceScore, duration_ms: result.durationMs,
        request_id: requestId,
      }).catch(() => {})
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
      }).catch(() => {})

      return NextResponse.json({
        ok: true,
        jobId: job.jobId,
        status: 'ready',
        progress: 100,
        result,
      })
    } catch (err) {
      failJob(job.jobId, (err as Error).message)
      return NextResponse.json({
        ok: true,
        jobId: job.jobId,
        status: 'failed',
        errorReason: (err as Error).message,
      })
    }
  }

  // ─── Analytica: return job ID immediately, process async via polling ───
  updateJob(job.jobId, { status: 'queued', stage: 'Queued for Analytica processing', progress: 5 })

  return NextResponse.json({
    ok: true,
    jobId: job.jobId,
    status: 'queued',
    progress: 5,
    stage: 'Queued for Analytica processing',
    etaSeconds: 180,
    async: true,
  })
}
