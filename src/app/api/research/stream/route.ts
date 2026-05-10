// ─── POST /api/research/stream — Progressive SSE Research Pipeline ──────────
// Two-stage streaming pipeline:
//   Stage A (3-8s): Fast initial report (title + summary + findings)
//   Stage B (20-45s): Deep enrichment (full report)
//
// Client receives Server-Sent Events:
//   event: stage_a → initial report
//   event: stage_b → enriched full report  
//   event: done → pipeline complete
//   event: error → pipeline failed

import { NextRequest } from 'next/server'
import { ResearchRequestSchema } from '@/schemas/research'
import { validateEnv } from '@/config/env'
import { generateRequestId } from '@/lib/logger'
import { runFastPipeline } from '@/services/research/fast-pipeline'
import { runResearchPipeline } from '@/services/research/pipeline'
import { makeRequestKey } from '@/infrastructure/dedup'
import { cacheGet, cacheSet } from '@/infrastructure/cache'
import { checkConcurrency, registerRequest } from '@/infrastructure/concurrency'
import { metricRequestStart, metricRequestSuccess, metricRequestFailure, metricCacheHit } from '@/infrastructure/metrics'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = generateRequestId()

  // ─── Validate environment ─────────────────────────────────────────────────
  try {
    validateEnv()
  } catch (envErr) {
    return sseResponse([
      sseEvent('error', { message: envErr instanceof Error ? envErr.message : 'Environment not configured', retryable: false }),
    ])
  }

  // ─── Parse body ───────────────────────────────────────────────────────────
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return sseResponse([
      sseEvent('error', { message: 'Invalid request body' }),
    ])
  }

  const parsed = ResearchRequestSchema.safeParse(body)
  if (!parsed.success) {
    return sseResponse([
      sseEvent('error', { message: `Validation: ${parsed.error.issues.map(i => i.message).join('; ')}` }),
    ])
  }

  const { query, mode, presetId, context } = parsed.data
  const dedupKey = makeRequestKey(query, mode)

  metricRequestStart()

  // ─── Cache check ──────────────────────────────────────────────────────────
  const cached = cacheGet(dedupKey)
  if (cached) {
    metricCacheHit()
    metricRequestSuccess(Date.now() - startTime)
    return sseResponse([
      sseEvent('stage_a', { result: cached.result, cached: true, durationMs: 0 }),
      sseEvent('done', { cached: true, totalMs: Date.now() - startTime }),
    ])
  }

  // ─── Concurrency check ───────────────────────────────────────────────────
  const userId = request.headers.get('x-forwarded-for') || 'anonymous'
  const concurrencyCheck = checkConcurrency(userId)
  if (!concurrencyCheck.allowed) {
    metricRequestFailure()
    return sseResponse([
      sseEvent('error', { message: concurrencyCheck.reason, retryable: true }),
    ])
  }

  // ─── Streaming response ───────────────────────────────────────────────────
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const release = registerRequest(requestId, userId, mode)

      try {
        // ═══ STAGE A — Fast Initial Report (5-10s) ═══
        console.log(`[stream] Stage A starting | query="${query.slice(0, 60)}" mode=${mode}`)
        try {
          const fast = await runFastPipeline(query, requestId)
          const stageAMs = Date.now() - startTime

          controller.enqueue(encoder.encode(
            sseEvent('stage_a', {
              result: fast.result,
              model: fast.model,
              durationMs: stageAMs,
            })
          ))

          console.log(`[stream] ⚡ Stage A delivered in ${stageAMs}ms`)
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err)
          console.error(`[stream] Stage A failed: ${errMsg}`)
          controller.enqueue(encoder.encode(
            sseEvent('stage_a_error', {
              message: 'Fast analysis unavailable, proceeding to full analysis...',
              debug: errMsg.slice(0, 200),
            })
          ))
        }

        // ═══ STAGE B — Deep Enrichment (20-45s) ═══
        const budgetRemaining = 55_000 - (Date.now() - startTime)
        if (budgetRemaining > 10_000) {
          console.log(`[stream] Stage B starting | budget=${budgetRemaining}ms`)

          try {
            const full = await runResearchPipeline({
              query,
              mode: mode as 'focus' | 'deep' | 'analytica',
              requestId,
              presetId,
              runId: `run_${Date.now().toString(36)}`,
              context,
            })

            const totalMs = Date.now() - startTime
            metricRequestSuccess(totalMs)

            // Cache the full result
            cacheSet(
              dedupKey,
              full.result,
              full.rawJson,
              mode,
              full.result.pipelineSource || 'unknown',
              totalMs
            )

            controller.enqueue(encoder.encode(
              sseEvent('stage_b', {
                result: full.result,
                durationMs: totalMs,
              })
            ))

            controller.enqueue(encoder.encode(
              sseEvent('done', {
                totalMs,
                model: full.result.pipelineSource,
              })
            ))

            console.log(`[stream] ✅ Stage B complete in ${totalMs}ms`)
          } catch (err) {
            metricRequestFailure()
            const msg = err instanceof Error ? err.message : String(err)
            console.error(`[stream] Stage B failed: ${msg}`)
            controller.enqueue(encoder.encode(
              sseEvent('stage_b_error', {
                message: 'Deep analysis timed out. Showing initial results.',
                error: msg.slice(0, 200),
              })
            ))
            controller.enqueue(encoder.encode(
              sseEvent('done', { totalMs: Date.now() - startTime, partial: true })
            ))
          }
        } else {
          console.warn(`[stream] Skipping Stage B — insufficient budget (${budgetRemaining}ms)`)
          controller.enqueue(encoder.encode(
            sseEvent('done', { totalMs: Date.now() - startTime, partial: true })
          ))
        }

      } catch (err) {
        metricRequestFailure()
        controller.enqueue(encoder.encode(
          sseEvent('error', {
            message: err instanceof Error ? err.message : 'Pipeline failed',
            retryable: true,
          })
        ))
      } finally {
        release()
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Request-Id': requestId,
    },
  })
}

// ─── SSE Helpers ────────────────────────────────────────────────────────────
function sseEvent(event: string, data: any): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

function sseResponse(events: string[]): Response {
  return new Response(events.join(''), {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  })
}
