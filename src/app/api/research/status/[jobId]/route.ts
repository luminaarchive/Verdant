// ─── GET /api/research/status/[jobId] — Poll job status ──────────────────────
// Returns current stage, progress, ETA. For Analytica, triggers next processing stage.

import { NextRequest, NextResponse } from 'next/server'
import { getJob, getJobStatus, updateJob, completeJob, failJob } from '@/lib/research/jobs'
import { runResearchPipeline } from '@/lib/research/pipeline'
import { log, generateRequestId } from '@/lib/research/logger'
import { saveResearchRun, saveResearchResult } from '@/lib/supabase/admin'

export const maxDuration = 60

export async function GET(request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params
  const job = getJob(jobId)

  if (!job) {
    return NextResponse.json({ found: false, jobId, status: 'failed', errorReason: 'Job not found or expired' }, { status: 404 })
  }

  // If job is ready or failed, just return status
  if (job.status === 'ready' || job.status === 'failed' || job.status === 'cancelled') {
    return NextResponse.json(getJobStatus(jobId))
  }

  // ─── Analytica: trigger processing on poll ─────────────────────────────
  if (job.mode === 'analytica' && (job.status === 'queued' || job.status === 'source_collection')) {
    const requestId = generateRequestId()
    log.info(`Analytica poll-triggered processing for job ${jobId}`, { requestId })

    updateJob(jobId, {
      status: 'evidence_synthesis',
      stage: 'Synthesizing evidence & findings',
      progress: 30,
      startedAt: job.startedAt ?? new Date().toISOString(),
    })

    try {
      const { result } = await runResearchPipeline({
        query: job.query,
        mode: 'analytica',
        requestId,
        presetId: job.presetId,
      })

      completeJob(jobId, result, {
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

      return NextResponse.json(getJobStatus(jobId))
    } catch (err) {
      const errorMsg = (err as Error).message
      if (job.retryCount < 2) {
        updateJob(jobId, {
          status: 'retrying',
          stage: 'Retrying after provider error',
          retryCount: job.retryCount + 1,
          errorReason: errorMsg,
          progress: 10,
        })
      } else {
        failJob(jobId, `Exhausted retries: ${errorMsg}`)
      }
      return NextResponse.json(getJobStatus(jobId))
    }
  }

  // For retrying jobs, reset to queued so next poll retries
  if (job.status === 'retrying') {
    updateJob(jobId, { status: 'queued', stage: 'Retrying analysis', progress: 5 })
  }

  return NextResponse.json(getJobStatus(jobId))
}
