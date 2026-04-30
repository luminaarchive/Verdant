// ─── GET /api/research/status/[jobId] — Poll job status ──────────────────────
// Returns current stage from durable DB. For Analytica, triggers next stage with worker lock.

import { NextRequest, NextResponse } from 'next/server'
import { getJob, getJobStatus, updateJob, completeJob, failJob, acquireWorkerLock, releaseWorkerLock, savePartialResult, logEvent } from '@/lib/research/jobs'
import { runResearchPipeline } from '@/lib/research/pipeline'
import { log, generateRequestId } from '@/lib/research/logger'
import { saveResearchRun, saveResearchResult } from '@/lib/supabase/admin'

export const maxDuration = 60

export async function GET(request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params
  const job = await getJob(jobId)

  if (!job) {
    return NextResponse.json({ found: false, jobId, status: 'failed', errorReason: 'Job not found or expired' }, { status: 404 })
  }

  // Terminal states: just return status from DB
  if (job.status === 'ready' || job.status === 'failed' || job.status === 'cancelled') {
    return NextResponse.json(await getJobStatus(jobId))
  }

  // ─── Analytica: trigger processing with worker lock ────────────────────
  if (job.mode === 'analytica' && (job.status === 'queued' || job.status === 'source_collection')) {
    const requestId = generateRequestId()

    // Acquire worker lock (prevents double-processing across instances)
    const workerId = await acquireWorkerLock(jobId, 65)
    if (!workerId) {
      // Another worker is processing — just return current status
      return NextResponse.json(await getJobStatus(jobId))
    }

    log.info(`Analytica processing job ${jobId} (worker: ${workerId})`, { requestId })
    await updateJob(jobId, {
      status: 'evidence_synthesis',
      stage: 'Synthesizing evidence & findings',
      progress: 30,
      startedAt: job.startedAt ?? new Date().toISOString(),
    })
    await logEvent(jobId, 'processing_started', 'queued', 'evidence_synthesis', { workerId })

    try {
      const { result } = await runResearchPipeline({
        query: job.query,
        mode: 'analytica',
        requestId,
        presetId: job.presetId,
      })

      // Save partial result snapshot before completing
      await savePartialResult(jobId, 'evidence_synthesis', {
        sourceCount: (result as any).sources?.length,
        evidenceCount: (result as any).evidenceItems?.length,
        confidenceScore: result.confidenceScore,
      })

      await completeJob(jobId, result, {
        confidenceScore: result.confidenceScore,
        sourceCount: (result as any).sources?.length,
        evidenceCount: (result as any).evidenceItems?.length,
        exportReady: false,
        providerSource: result.pipelineSource,
      })

      // Persist research run (best-effort)
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

      await releaseWorkerLock(jobId, workerId)
      return NextResponse.json(await getJobStatus(jobId))
    } catch (err) {
      const errorMsg = (err as Error).message
      await releaseWorkerLock(jobId, workerId)

      if (job.retryCount < 2) {
        await updateJob(jobId, {
          status: 'retrying',
          stage: 'Retrying after provider error',
          retryCount: job.retryCount + 1,
          errorReason: errorMsg,
          progress: 10,
        })
        await logEvent(jobId, 'retry_triggered', 'evidence_synthesis', 'retrying', { attempt: job.retryCount + 1, error: errorMsg })
      } else {
        await failJob(jobId, `Exhausted retries: ${errorMsg}`)
        await logEvent(jobId, 'retries_exhausted', 'retrying', 'failed', { error: errorMsg })
      }
      return NextResponse.json(await getJobStatus(jobId))
    }
  }

  // For retrying jobs, reset to queued so next poll retries
  if (job.status === 'retrying') {
    await updateJob(jobId, { status: 'queued', stage: 'Retrying analysis', progress: 5 })
  }

  return NextResponse.json(await getJobStatus(jobId))
}
