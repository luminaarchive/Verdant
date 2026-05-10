// ─── Inngest Research Pipeline Function ──────────────────────────────────────
// Durable, step-based research execution that runs OUTSIDE Vercel's 60s timeout.
// Uses Inngest's step.run() for crash-safe checkpointing at each stage.

import { inngest } from '../client'
import { updateJob, completeJob, failJob, savePartialResult, logEvent } from '@/lib/research/jobs'
import { runResearchPipeline } from '@/lib/research/pipeline'
import { saveResearchRun, saveResearchResult } from '@/lib/supabase/admin'
import { generateRequestId } from '@/lib/research/logger'
import { MODE_CONFIG } from '@/lib/research/mode-config'

export const researchPipeline = inngest.createFunction(
  {
    id: 'research-pipeline',
    retries: 2,
    concurrency: { limit: 5 },
    timeouts: { finish: '15m' },
    triggers: [{ event: 'research/job.created' }],
  },
  async ({ event, step }) => {
    const { jobId, query, mode } = event.data as {
      jobId: string
      runId: string
      query: string
      mode: 'focus' | 'deep' | 'analytica'
      presetId?: string
      context?: string
    }
    const runId = (event.data as { runId?: string }).runId
    const presetId = (event.data as { presetId?: string }).presetId
    const context = (event.data as { context?: string }).context
    const requestId = generateRequestId()
    const config = MODE_CONFIG[mode]

    console.log('[pipeline] Starting research job:', { jobId, query, mode })

    try {
      // Step 1: Validate and mark job as processing
      await step.run('validate-and-start', async () => {
        console.log('[pipeline] Step 1: validate-and-start')
        await updateJob(jobId, {
          status: 'source_collection',
          stage: `Initializing ${config.label}`,
          progress: 10,
          startedAt: new Date().toISOString(),
        })
        await logEvent(jobId, 'inngest_processing_started', 'queued', 'source_collection', {
          mode,
          targetWords: config.targetWords,
        })
      })

      // Step 2: Update to evidence synthesis stage
      await step.run('begin-synthesis', async () => {
        console.log('[pipeline] Step 2: begin-synthesis')
        await updateJob(jobId, {
          status: 'evidence_synthesis',
          stage: 'Synthesizing evidence & findings',
          progress: 30,
        })
      })

      // Step 3: Run the actual research pipeline
      console.log('[pipeline] Step 3: run-pipeline — calling AI providers')
      const pipelineResult = await step.run('run-pipeline', async () => {
        const { result } = await runResearchPipeline({
          query,
          mode,
          requestId,
          presetId,
          runId,
          context,
        })

        console.log('[pipeline] AI provider returned result, confidence:', result.confidenceScore)

        // Save partial result checkpoint (crash-safe)
        await savePartialResult(jobId, 'evidence_synthesis', {
          sourceCount: (result as Record<string, unknown>).sources ? (Array.isArray((result as Record<string, unknown>).sources) ? ((result as Record<string, unknown>).sources as unknown[]).length : 0) : 0,
          confidenceScore: result.confidenceScore,
        })

        return {
          result,
          runId: result.runId,
          pipelineSource: result.pipelineSource,
          confidenceScore: result.confidenceScore,
          durationMs: result.durationMs,
        }
      })

      // Step 4: Update to report composition stage
      await step.run('report-composition', async () => {
        console.log('[pipeline] Step 4: report-composition')
        await updateJob(jobId, {
          status: 'report_composition',
          stage: `Composing ${config.reportFormat}`,
          progress: 60,
        })
      })

      // Step 5: Quality audit stage
      await step.run('quality-audit', async () => {
        console.log('[pipeline] Step 5: quality-audit')
        await updateJob(jobId, {
          status: 'quality_audit',
          stage: 'Running quality audit & consistency check',
          progress: 75,
        })

        // Save the research run and result to Supabase (best-effort)
        try {
          await saveResearchRun({
            run_id: pipelineResult.runId,
            query,
            mode,
            status: 'ready',
            pipeline_source: pipelineResult.pipelineSource,
            confidence_score: pipelineResult.confidenceScore,
            duration_ms: pipelineResult.durationMs,
            request_id: requestId,
          })
        } catch (e) { console.warn('[pipeline] saveResearchRun failed (non-critical):', e) }

        try {
          const r = pipelineResult.result as Record<string, unknown>
          await saveResearchResult({
            run_id: pipelineResult.runId,
            title: (r.title as string) ?? '',
            executive_summary: r.executiveSummary,
            findings: (r.findings as string[]) ?? [],
            outline: (r.outline as Record<string, unknown>[]) ?? [],
            stats: (r.stats as Record<string, unknown>[]) ?? [],
            sources: (r.sources as Record<string, unknown>[]) ?? [],
            evidence_items: (r.evidenceItems as Record<string, unknown>[]) ?? [],
            uncertainty_notes: (r.uncertaintyNotes as Record<string, unknown>[]) ?? [],
            decision_recommendations: r.decisionRecommendations as Record<string, unknown>[] | undefined,
            contradictions: r.contradictions as Record<string, unknown>[] | undefined,
            strategic_follow_ups: r.strategicFollowUps as string[] | undefined,
          })
        } catch (e) { console.warn('[pipeline] saveResearchResult failed (non-critical):', e) }
      })

      // Step 6: Finalize — mark job complete
      await step.run('finalize', async () => {
        console.log('[pipeline] Step 6: finalize — marking job complete')
        const r = pipelineResult.result as Record<string, unknown>
        await completeJob(jobId, pipelineResult.result, {
          confidenceScore: pipelineResult.confidenceScore,
          sourceCount: Array.isArray(r.sources) ? r.sources.length : 0,
          evidenceCount: Array.isArray(r.evidenceItems) ? r.evidenceItems.length : 0,
          exportReady: false,
          providerSource: pipelineResult.pipelineSource,
        })

        await logEvent(jobId, 'inngest_job_completed', 'quality_audit', 'ready', {
          confidenceScore: pipelineResult.confidenceScore,
          durationMs: pipelineResult.durationMs,
          mode,
        })
      })

      console.log('[pipeline] Job complete:', jobId)
      return { success: true, jobId, mode }

    } catch (error) {
      // CRITICAL: Update job status to error so UI shows error instead of infinite loading
      console.error('[pipeline] Fatal error for job:', jobId, error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

      try {
        await failJob(jobId, errorMessage)
        await logEvent(jobId, 'inngest_job_failed', 'unknown', 'failed', {
          error: errorMessage.slice(0, 500),
          mode,
        })
      } catch (dbErr) {
        console.error('[pipeline] Failed to update job status to error:', dbErr)
      }

      throw error // re-throw so Inngest marks the run as failed
    }
  }
)
