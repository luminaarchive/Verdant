// ─── POST /api/research/start — Create and run a research job ────────────────
// Returns jobId immediately. Research runs as fire-and-forget background task.
// Uses existing durable job system (createJob/completeJob/failJob).
// Bypasses Inngest — runs pipeline directly in-process.

import { NextRequest, NextResponse } from 'next/server'
import { ResearchRequestSchema } from '@/lib/research/schema'
import { createJob, updateJob, completeJob, failJob, findByIdempotencyKey, logEvent } from '@/lib/research/jobs'
import { checkRateLimit } from '@/lib/research/rate-limit'
import { log, generateRequestId, generateRunId } from '@/lib/research/logger'
import { validateEnv } from '@/lib/env-check'
import { MODE_CONFIG } from '@/lib/research/mode-config'
import { createClient } from '@/lib/supabase/server'
import { runResearchPipeline } from '@/lib/research/pipeline'

// Validate env on module load
validateEnv()

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

    const { query, mode, idempotencyKey, presetId, context } = parsed.data
    const runId = generateRunId()

    // ─── Monetization Gating (P1) ──────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    let tier = 'guest'
    if (user) {
      const { data: profile } = await supabase.from('user_profiles').select('subscription_tier').eq('id', user.id).single()
      tier = profile?.subscription_tier || 'seeds'
    }

    if (mode === 'analytica' && (tier === 'guest' || tier === 'seeds')) {
      return NextResponse.json({ 
        ok: false, 
        message: tier === 'guest' 
          ? 'Please sign in to access Analytica mode.' 
          : 'Analytica is a premium mode. Upgrade to Sapling or Forest Keeper tier to unlock.' 
      }, { status: 403 })
    }

    if (mode === 'deep' && tier === 'guest') {
      return NextResponse.json({ 
        ok: false, 
        message: 'Please sign in to access Deep Research mode.' 
      }, { status: 403 })
    }

    // ─── Idempotency check ──────────────────────────────────────────────────
    if (idempotencyKey) {
      const existing = await findByIdempotencyKey(idempotencyKey)
      if (existing) {
        if (existing.status === 'ready' && existing.result) {
          return NextResponse.json({ ok: true, jobId: existing.jobId, status: 'ready', cached: true, result: existing.result })
        }
        return NextResponse.json({ ok: true, jobId: existing.jobId, status: existing.status, cached: true, async: true, progress: existing.progress, stage: existing.stage })
      }
    }

    // Create the durable job
    let job
    try {
      job = await createJob({ query, mode, presetId, runId, idempotencyKey: idempotencyKey ?? undefined })
    } catch (err) {
      const msg = (err as Error).message
      log.error(`Job creation failed: ${msg}`, { requestId })
      return NextResponse.json({
        ok: false,
        message: 'Research infrastructure temporarily unavailable. Please try again.',
        retryable: true,
      }, { status: 503 })
    }

    log.info(`Job created: ${job.jobId} mode=${mode}`, { requestId, runId })

    const config = MODE_CONFIG[mode as keyof typeof MODE_CONFIG]

    // ─── Run pipeline directly (bypass Inngest) ─────────────────────────────
    // Fire-and-forget: start async research, return jobId immediately
    const runDirectPipeline = async () => {
      try {
        console.log(`[direct-pipeline] Starting job ${job.jobId}, mode=${mode}, query="${query}"`)
        
        await updateJob(job.jobId, {
          status: 'source_collection',
          stage: `Initializing ${config.label}`,
          progress: 10,
          startedAt: new Date().toISOString(),
        })

        await updateJob(job.jobId, {
          status: 'evidence_synthesis',
          stage: 'Synthesizing evidence & findings',
          progress: 30,
        })

        console.log(`[direct-pipeline] Calling AI providers for job ${job.jobId}`)
        const pipelineOutput = await runResearchPipeline({
          query,
          mode: mode as 'focus' | 'deep' | 'analytica',
          requestId,
          presetId,
          runId,
          context,
        })

        console.log(`[direct-pipeline] AI returned result, confidence=${pipelineOutput.result.confidenceScore}`)

        await updateJob(job.jobId, {
          status: 'report_composition',
          stage: `Composing ${config.reportFormat}`,
          progress: 60,
        })

        await updateJob(job.jobId, {
          status: 'quality_audit',
          stage: 'Running quality audit',
          progress: 75,
        })

        await completeJob(job.jobId, pipelineOutput.result, {
          confidenceScore: pipelineOutput.result.confidenceScore,
          sourceCount: (pipelineOutput.result as Record<string, unknown>).sources ? (Array.isArray((pipelineOutput.result as Record<string, unknown>).sources) ? ((pipelineOutput.result as Record<string, unknown>).sources as unknown[]).length : 0) : 0,
          exportReady: false,
          providerSource: pipelineOutput.result.pipelineSource,
        })

        await logEvent(job.jobId, 'direct_pipeline_completed', 'quality_audit', 'ready', {
          confidenceScore: pipelineOutput.result.confidenceScore,
          durationMs: pipelineOutput.result.durationMs,
          mode,
        })

        console.log(`[direct-pipeline] Job complete: ${job.jobId}`)

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`[direct-pipeline] Fatal error for job ${job.jobId}:`, errorMessage)

        await failJob(job.jobId, errorMessage)
        await logEvent(job.jobId, 'direct_pipeline_failed', 'unknown', 'failed', {
          error: errorMessage.slice(0, 500),
          mode,
        })
      }
    }

    // Fire and forget — don't await
    runDirectPipeline().catch(err => 
      console.error(`[direct-pipeline] Uncaught error for ${job.jobId}:`, err)
    )

    // Return immediately so frontend can start polling
    return NextResponse.json({
      ok: true,
      jobId: job.jobId,
      status: 'queued',
      progress: 5,
      stage: `Queued for ${config.label}`,
      etaSeconds: (config?.timeoutMinutes ?? 1) * 60,
      async: true,
    })

  } catch (err) {
    const msg = (err as Error).message ?? 'Unknown error'
    console.error('[start] Unhandled error:', msg)
    return NextResponse.json({ ok: false, message: `Server error: ${msg}`, requestId }, { status: 500 })
  }
}
