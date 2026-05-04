// ─── Inngest Research Pipeline Function ──────────────────────────────────────
// Durable, step-based research execution that runs OUTSIDE Vercel's 60s timeout.
// Uses Inngest's step.run() for crash-safe checkpointing at each stage.
//
// This function does NOT rebuild the research pipeline — it wraps the existing
// runResearchPipeline() with durable state tracking and progress updates.

import { inngest } from '../client'
import { updateJob, completeJob, failJob, savePartialResult, logEvent } from '@/lib/research/jobs'
import { runResearchPipeline } from '@/lib/research/pipeline'
import { saveResearchRun, saveResearchResult } from '@/lib/supabase/admin'
import { generateRequestId } from '@/lib/research/logger'
import { MODE_CONFIG } from '@/lib/research/mode-config'

export const researchPipeline = inngest.createFunction(
  {
    id: 'research-pipeline',
    retries: 3,
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
    }
    const runId = (event.data as { runId?: string }).runId
    const presetId = (event.data as { presetId?: string }).presetId
    const requestId = generateRequestId()
    const config = MODE_CONFIG[mode]

    // Step 1: Validate and mark job as processing
    await step.run('validate-and-start', async () => {
      await updateJob(jobId, {
        status: 'source_collection',
        stage: `Initializing ${config.label}`,
        progress: 10,
        startedAt: new Date().toISOString(),
      })
      await logEvent(jobId, 'inngest_processing_started', 'queued', 'source_collection', {
        mode,
        targetWords: config.targetWords,
        targetPages: config.targetPages,
        inngestTimeout: config.inngestTimeout,
      })
    })

    // Step 2: Update to evidence synthesis stage
    await step.run('begin-synthesis', async () => {
      await updateJob(jobId, {
        status: 'evidence_synthesis',
        stage: 'Synthesizing evidence & findings',
        progress: 30,
      })
    })

    // Step 3: Run the actual research pipeline
    // This is the heavy lift — calls AI providers, parses response, validates schema
    const pipelineResult = await step.run('run-pipeline', async () => {
      const { result } = await runResearchPipeline({
        query,
        mode,
        requestId,
        presetId,
        runId,
      })

      // Save partial result checkpoint (crash-safe)
      await savePartialResult(jobId, 'evidence_synthesis', {
        sourceCount: (result as any).sources?.length,
        evidenceCount: (result as any).evidenceItems?.length,
        confidenceScore: result.confidenceScore,
        findingCount: (result as any).findings?.length,
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
      await updateJob(jobId, {
        status: 'report_composition',
        stage: `Composing ${config.reportFormat}`,
        progress: 60,
      })
    })

    // Step 5: Quality audit stage
    await step.run('quality-audit', async () => {
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
      } catch { /* non-critical */ }

      try {
        const r = pipelineResult.result as any
        await saveResearchResult({
          run_id: pipelineResult.runId,
          title: r.title ?? '',
          executive_summary: r.executiveSummary,
          findings: r.findings ?? [],
          outline: r.outline ?? [],
          stats: r.stats ?? [],
          sources: r.sources ?? [],
          evidence_items: r.evidenceItems ?? [],
          uncertainty_notes: r.uncertaintyNotes ?? [],
          decision_recommendations: r.decisionRecommendations,
          contradictions: r.contradictions,
          strategic_follow_ups: r.strategicFollowUps,
        })
      } catch { /* non-critical */ }
    })

    // Step 6: Finalize — mark job complete
    await step.run('finalize', async () => {
      const r = pipelineResult.result as any
      await completeJob(jobId, pipelineResult.result, {
        confidenceScore: pipelineResult.confidenceScore,
        sourceCount: r.sources?.length,
        evidenceCount: r.evidenceItems?.length,
        exportReady: false,
        providerSource: pipelineResult.pipelineSource,
      })

      await logEvent(jobId, 'inngest_job_completed', 'quality_audit', 'ready', {
        confidenceScore: pipelineResult.confidenceScore,
        sourceCount: r.sources?.length,
        durationMs: pipelineResult.durationMs,
        mode,
      })
    })

    return { success: true, jobId, mode }
  }
)
