// ─── POST /api/research/start — Create and run a research job ────────────────
// CRITICAL FIX: Pipeline is now AWAITED before returning the HTTP response.
// Previously this was fire-and-forget, which caused Vercel to terminate the
// function before the AI call completed, leaving jobs permanently stuck.
//
// Flow:
//   1. Validate env (fail fast if AI key missing)
//   2. Rate limit check
//   3. Parse + validate body
//   4. Monetization gating (GRACEFUL — never blocks on auth failure)
//   5. Idempotency check
//   6. Create job (with in-memory fallback if Supabase is down)
//   7. AWAIT pipeline (synchronous — Vercel keeps function alive)
//   8. Return result directly in response (no polling needed)

import { NextRequest, NextResponse } from 'next/server'
import { ResearchRequestSchema } from '@/schemas/research'
import { createJob, updateJob, completeJob, failJob, findByIdempotencyKey } from '@/services/research/jobs'
import { checkRateLimit } from '@/services/research/rate-limit'
import { log, generateRequestId, generateRunId } from '@/lib/logger'
import { validateEnv, checkEnv } from '@/config/env'
import { MODE_CONFIG } from '@/config/modes'
import { runResearchPipeline } from '@/services/research/pipeline'
import { makeRequestKey, dedup, getInflightCount } from '@/infrastructure/dedup'
import { cacheGet, cacheSet } from '@/infrastructure/cache'
import { checkConcurrency, registerRequest } from '@/infrastructure/concurrency'
import { metricRequestStart, metricRequestSuccess, metricRequestFailure, metricCacheHit, metricDeduplicated } from '@/infrastructure/metrics'

// Force nodejs runtime — edge runtime causes failures with AbortController,
// large JSON parsing, and OpenRouter fetch on Vercel
export const runtime = 'nodejs'
export const maxDuration = 60

// ─── In-memory job store (fallback when Supabase is unavailable) ─────────────
const memoryJobs = new Map<string, {
  status: string
  stage: string
  progress: number
  result?: unknown
  errorReason?: string
}>()

function memJobSet(jobId: string, data: typeof memoryJobs extends Map<string, infer V> ? V : never) {
  memoryJobs.set(jobId, data)
  if (memoryJobs.size > 50) {
    const oldest = memoryJobs.keys().next().value
    if (oldest) memoryJobs.delete(oldest)
  }
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  const startTime = Date.now()

  // ─── Step 1: Validate environment ─────────────────────────────────────────
  try {
    validateEnv()
  } catch (envErr) {
    const msg = (envErr as Error).message
    console.error(`[start] Env validation failed: ${msg}`)
    return NextResponse.json({
      ok: false,
      message: 'Research service is temporarily unavailable. Please try again later.',
      retryable: true,
      requestId,
    }, { status: 503 })
  }

  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

    // ─── Step 2: Rate limit ──────────────────────────────────────────────────
    const rateLimit = checkRateLimit(ip)
    if (!rateLimit.allowed) {
      return NextResponse.json({ ok: false, message: 'Too many requests. Please wait a moment.' }, { status: 429 })
    }

    // ─── Step 3: Parse + validate body ──────────────────────────────────────
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ ok: false, message: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = ResearchRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({
        ok: false,
        message: `Validation error: ${parsed.error.issues.map(i => i.message).join('; ')}`,
      }, { status: 400 })
    }

    const { query, mode, idempotencyKey, presetId, context } = parsed.data
    const runId = generateRunId()
    const dedupKey = makeRequestKey(query, mode)

    metricRequestStart()
    console.log(`[start] Request: mode=${mode}, query="${query.slice(0, 80)}", requestId=${requestId}, dedupKey=${dedupKey}, inflight=${getInflightCount()}, elapsed=${Date.now() - startTime}ms`)

    // ─── Step 3.5: Cache check ────────────────────────────────────────────────
    const cached = cacheGet(dedupKey)
    if (cached) {
      metricCacheHit()
      const latency = Date.now() - startTime
      metricRequestSuccess(latency)
      console.log(`[start] ⚡ Cache HIT for dedupKey=${dedupKey}, returning cached result, elapsed=${latency}ms`)
      return NextResponse.json({
        ok: true,
        jobId: `cache_${dedupKey}`,
        status: 'ready',
        cached: true,
        result: cached.result,
      })
    }

    // ─── Step 3.6: Concurrency check ──────────────────────────────────────────
    const userId = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous'
    const concurrencyCheck = checkConcurrency(userId)
    if (!concurrencyCheck.allowed) {
      console.warn(`[start] 🚫 Concurrency blocked: ${concurrencyCheck.reason}`)
      metricRequestFailure()
      return NextResponse.json({
        ok: false,
        message: concurrencyCheck.reason,
        retryable: true,
        requestId,
      }, { status: 429 })
    }

    // ─── Step 4: Monetization gating (GRACEFUL) ──────────────────────────────
    // CRITICAL: Auth failures must NEVER block the pipeline.
    // If Supabase is misconfigured or auth fails, default to 'guest' tier
    // and allow Focus mode to proceed. This prevents auth crashes from
    // killing ALL AI generation.
    let tier = 'guest'
    try {
      const envStatus = checkEnv()
      // Only attempt auth if Supabase is actually configured
      if (envStatus.supabase === 'configured') {
        const { createClient } = await import('@/services/supabase/server')
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('subscription_tier')
            .eq('id', user.id)
            .single()
          tier = profile?.subscription_tier || 'seeds'
        }
      } else {
        console.warn(`[start] Supabase not configured (status: ${envStatus.supabase}), skipping auth — defaulting to guest tier`)
      }
    } catch (authErr) {
      // Auth check failure is ALWAYS non-fatal
      console.warn(`[start] Auth check failed (non-fatal, defaulting to guest): ${(authErr as Error).message}`)
      tier = 'guest'
    }

    // Gate premium modes (but ONLY if auth succeeded)
    if (mode === 'analytica' && (tier === 'guest' || tier === 'seeds')) {
      return NextResponse.json({
        ok: false,
        message: tier === 'guest'
          ? 'Please sign in to access Analytica mode.'
          : 'Analytica is a premium mode. Upgrade to Sapling or Forest Keeper tier to unlock.',
      }, { status: 403 })
    }

    // NOTE: Deep mode is now allowed for guests when auth is unavailable.
    // This prevents Supabase outages from blocking all Deep mode requests.
    if (mode === 'deep' && tier === 'guest') {
      // Allow through — Focus-like behavior for unauthenticated users
      console.log(`[start] Deep mode requested by guest — allowing through (auth may be unavailable)`)
    }

    console.log(`[start] Auth complete: tier=${tier}, elapsed=${Date.now() - startTime}ms`)

    // ─── Step 5: Idempotency check ───────────────────────────────────────────
    if (idempotencyKey) {
      try {
        const existing = await findByIdempotencyKey(idempotencyKey)
        if (existing) {
          if (existing.status === 'ready' && existing.result) {
            console.log(`[start] Idempotency hit — returning cached result`)
            return NextResponse.json({
              ok: true,
              jobId: existing.jobId,
              status: 'ready',
              cached: true,
              result: existing.result,
            })
          }
          return NextResponse.json({
            ok: true,
            jobId: existing.jobId,
            status: existing.status,
            cached: true,
            async: true,
            progress: existing.progress,
            stage: existing.stage,
          })
        }
      } catch (idempErr) {
        // Non-fatal — proceed with fresh request
        console.warn(`[start] Idempotency check failed (non-fatal): ${(idempErr as Error).message}`)
      }
    }

    // ─── Step 6: Create job (with in-memory fallback) ────────────────────────
    const envStatus = checkEnv()
    const supabaseAvailable = envStatus.supabase === 'configured'

    let jobId: string
    let useMemoryFallback = false

    if (supabaseAvailable) {
      try {
        const job = await createJob({ query, mode, presetId, runId, idempotencyKey: idempotencyKey ?? undefined })
        jobId = job.jobId
        console.log(`[start] DB job created: ${jobId}, elapsed=${Date.now() - startTime}ms`)
      } catch (dbErr) {
        console.warn(`[start] DB job creation failed, using in-memory fallback: ${(dbErr as Error).message}`)
        useMemoryFallback = true
        jobId = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      }
    } else {
      console.warn('[start] Supabase not configured — using in-memory job tracking')
      useMemoryFallback = true
      jobId = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    }

    if (useMemoryFallback) {
      memJobSet(jobId, { status: 'queued', stage: 'Queued', progress: 5 })
    }

    const config = MODE_CONFIG[mode as keyof typeof MODE_CONFIG]
    log.info(`Job ${jobId} created (${useMemoryFallback ? 'memory' : 'db'}), mode=${mode}`, { requestId, runId })

    // ─── Step 7: AWAIT the pipeline ──────────────────────────────────────────
    // All job status updates are wrapped in try/catch to prevent DB failures
    // from blocking pipeline completion. This is critical — if updateJob()
    // fails, the request must NOT hang.

    console.log(`[start] Awaiting pipeline for job ${jobId}...`)

    // Update job to in-progress (non-blocking)
    if (!useMemoryFallback) {
      try {
        await updateJob(jobId, {
          status: 'source_collection',
          stage: `Initializing ${config.label}`,
          progress: 10,
          startedAt: new Date().toISOString(),
        })
      } catch (e) {
        console.warn(`[start] updateJob to source_collection failed (non-fatal): ${(e as Error).message}`)
      }
    } else {
      memJobSet(jobId, { status: 'source_collection', stage: 'Initializing...', progress: 10 })
    }

    let pipelineResult: Awaited<ReturnType<typeof runResearchPipeline>> | null = null
    let pipelineError: string | null = null

    try {
      // Update to evidence_synthesis (non-blocking)
      if (!useMemoryFallback) {
        try {
          await updateJob(jobId, {
            status: 'evidence_synthesis',
            stage: 'Synthesizing evidence & findings',
            progress: 30,
          })
        } catch {
          // Non-fatal — don't block pipeline
        }
      } else {
        memJobSet(jobId, { status: 'evidence_synthesis', stage: 'Synthesizing evidence...', progress: 30 })
      }

      console.log(`[start] Calling AI pipeline for job ${jobId}, mode=${mode}, elapsed=${Date.now() - startTime}ms`)

      // Register concurrency slot + wrap with dedup
      const releaseConcurrency = registerRequest(requestId, userId, mode)
      try {
        const { result: dedupResult, deduplicated } = await dedup(dedupKey, () =>
          runResearchPipeline({
            query,
            mode: mode as 'focus' | 'deep' | 'analytica',
            requestId,
            presetId,
            runId,
            context,
          })
        )
        pipelineResult = dedupResult

        if (deduplicated) {
          metricDeduplicated()
          console.log(`[start] ♻️ Deduplicated — reused in-flight result for dedupKey=${dedupKey}`)
        }
      } finally {
        releaseConcurrency()
      }

      const pipelineDuration = Date.now() - startTime
      metricRequestSuccess(pipelineDuration)
      console.log(`[start] Pipeline complete for job ${jobId}, confidence=${pipelineResult.result.confidenceScore}, elapsed=${pipelineDuration}ms`)

      // Cache the successful result
      cacheSet(
        dedupKey,
        pipelineResult.result,
        pipelineResult.rawJson,
        mode,
        pipelineResult.result.pipelineSource || 'unknown',
        pipelineDuration
      )

      // Update job to complete (non-blocking)
      if (!useMemoryFallback) {
        try {
          await completeJob(jobId, pipelineResult.result, {
            confidenceScore: pipelineResult.result.confidenceScore,
            sourceCount: Array.isArray((pipelineResult.result as any).sources)
              ? (pipelineResult.result as any).sources.length
              : 0,
            exportReady: false,
            providerSource: pipelineResult.result.pipelineSource,
          })
        } catch (e) {
          console.warn(`[start] completeJob failed (non-fatal): ${(e as Error).message}`)
        }
      } else {
        memJobSet(jobId, {
          status: 'ready',
          stage: 'Complete',
          progress: 100,
          result: pipelineResult.result,
        })
      }

    } catch (err) {
      pipelineError = err instanceof Error ? err.message : String(err)
      metricRequestFailure()
      console.error(`[start] Pipeline failed for job ${jobId}: ${pipelineError}, elapsed=${Date.now() - startTime}ms`)

      // Update job to failed (non-blocking — MUST NOT hang the request)
      if (!useMemoryFallback) {
        try {
          await failJob(jobId, pipelineError)
        } catch (e) {
          console.error(`[start] failJob also failed (non-fatal): ${(e as Error).message}`)
          memJobSet(jobId, {
            status: 'failed',
            stage: 'Analysis failed',
            progress: 0,
            errorReason: pipelineError ?? 'Unknown error',
          })
        }
      } else {
        memJobSet(jobId, {
          status: 'failed',
          stage: 'Analysis failed',
          progress: 0,
          errorReason: pipelineError,
        })
      }
    }

    // ─── Step 8: Return result ───────────────────────────────────────────────
    if (pipelineResult) {
      console.log(`[start] Returning success for job ${jobId}, total_elapsed=${Date.now() - startTime}ms`)
      return NextResponse.json({
        ok: true,
        jobId,
        status: 'ready',
        result: pipelineResult.result,
      })
    }

    // Pipeline failed — return structured error (NEVER blank)
    const userMessage = buildUserErrorMessage(pipelineError ?? 'Unknown error')
    console.log(`[start] Returning error for job ${jobId}: ${userMessage}, total_elapsed=${Date.now() - startTime}ms`)
    return NextResponse.json({
      ok: false,
      jobId,
      status: 'failed',
      message: userMessage,
      retryable: true,
      requestId,
    }, { status: 502 })

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[start] Unhandled error: ${msg}, elapsed=${Date.now() - startTime}ms`)
    return NextResponse.json({
      ok: false,
      message: 'An unexpected error occurred. Please try again.',
      retryable: true,
      requestId,
    }, { status: 500 })
  }
}

// ─── Helper: translate internal errors to user-friendly messages ─────────────
function buildUserErrorMessage(rawError: string): string {
  const e = rawError.toLowerCase()

  if (e.includes('openrouter_api_key') || e.includes('not configured') || e.includes('empty')) {
    return 'AI service is not configured. Please contact support.'
  }
  if (e.includes('401') || e.includes('unauthorized') || e.includes('invalid api key')) {
    return 'AI service authentication failed. Please contact support.'
  }
  if (e.includes('402') || e.includes('payment') || e.includes('credits')) {
    return 'AI service quota exceeded. Please try again later.'
  }
  if (e.includes('429') || e.includes('rate limit')) {
    return 'AI service is busy. Please wait a moment and try again.'
  }
  if (e.includes('timeout') || e.includes('abort') || e.includes('timed out')) {
    return 'Analysis timed out. Please try a shorter query or use Focus mode.'
  }
  if (e.includes('json') || e.includes('parse')) {
    return 'AI returned an unexpected response format. Please retry.'
  }
  if (e.includes('all openrouter') || e.includes('all providers')) {
    return 'All AI models are temporarily unavailable. Please try again in a few minutes.'
  }
  if (e.includes('database') || e.includes('supabase')) {
    return 'Database temporarily unavailable. Your analysis may still work — please retry.'
  }
  if (e.includes('schema') || e.includes('validation')) {
    return 'AI response did not pass quality checks. Please retry.'
  }

  return 'AI provider sedang sibuk. Silakan coba lagi beberapa saat.'
}

// ─── Export memory jobs for status polling ───────────────────────────────────
export { memoryJobs }
