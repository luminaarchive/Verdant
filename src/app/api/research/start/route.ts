// ─── POST /api/research/start — Create a research job ────────────────────────
// Returns jobId immediately. Focus/Deep run inline. Analytica queues for async.
// All job state persisted to Supabase (durable source of truth).
// Idempotency is DB-backed via research_jobs.idempotency_key.

import { NextRequest, NextResponse } from 'next/server'
import { ResearchRequestSchema } from '@/lib/research/schema'
import { createJob, updateJob, findByIdempotencyKey, logEvent } from '@/lib/research/jobs'
import { checkRateLimit } from '@/lib/research/rate-limit'
import { log, generateRequestId, generateRunId } from '@/lib/research/logger'
import { validateEnv } from '@/lib/env-check'
import { inngest } from '@/inngest/client'
import { MODE_CONFIG } from '@/lib/research/mode-config'
import { createClient } from '@/lib/supabase/server'

// Validate env on module load — logs clear errors to Vercel logs immediately
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

  const { query, mode, idempotencyKey, presetId } = parsed.data
  const runId = generateRunId()

  // ─── Monetization Gating (P1) ──────────────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let tier = 'guest'
  if (user) {
    const { data: profile } = await supabase.from('user_profiles').select('subscription_tier').eq('id', user.id).single()
    tier = profile?.subscription_tier || 'seeds'
  }

  // Gating Logic
  if (mode === 'analytica' && (tier === 'guest' || tier === 'seeds')) {
    return NextResponse.json({ 
      ok: false, 
      message: tier === 'guest' 
        ? 'Please sign in to access Analytica mode.' 
        : 'Analytica is a premium mode. Upgrade to Sapling or Forest Keeper tier to unlock international-grade intelligence.' 
    }, { status: 403 })
  }

  if (mode === 'deep' && tier === 'guest') {
    return NextResponse.json({ 
      ok: false, 
      message: 'Please sign in to access Deep Research mode.' 
    }, { status: 403 })
  }

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

  // ─── Dispatch to Inngest for all modes, return jobId instantly ─────────
  const config = MODE_CONFIG[mode as keyof typeof MODE_CONFIG]
  const stageLabel = mode === 'analytica'
    ? 'Queued for Analytica processing'
    : mode === 'deep'
      ? 'Queued for Deep analysis'
      : 'Queued for Focus analysis'
  await updateJob(job.jobId, { status: 'queued', stage: stageLabel, progress: 5 })

  // Dispatch to Inngest durable pipeline (runs outside Vercel 60s timeout)
  try {
    await inngest.send({
      name: 'research/job.created',
      data: {
        jobId: job.jobId,
        runId: job.runId,
        query,
        mode,
        presetId: presetId ?? undefined,
      },
    })
    log.info(`Inngest event dispatched for job ${job.jobId}`, { requestId, runId })
    await logEvent(job.jobId, 'inngest_dispatched', 'queued', 'queued', { mode })
  } catch (inngestErr) {
    // If Inngest dispatch fails, log but don't fail the request.
    // The status polling route still has fallback in-process execution.
    log.warn(`Inngest dispatch failed, falling back to poll-triggered execution: ${(inngestErr as Error).message}`, { requestId })
    await logEvent(job.jobId, 'inngest_dispatch_failed', 'queued', 'queued', { error: (inngestErr as Error).message })
  }

  return NextResponse.json({
    ok: true,
    jobId: job.jobId,
    status: 'queued',
    progress: 5,
    stage: stageLabel,
    etaSeconds: (config?.timeoutMinutes ?? 1) * 60,
    async: true,
  })
  } catch (err) {
    const msg = (err as Error).message ?? 'Unknown error'
    const stack = (err as Error).stack ?? ''
    console.error('[start] Unhandled error:', msg, stack)
    return NextResponse.json({ ok: false, message: `Server error: ${msg}`, requestId }, { status: 500 })
  }
}
