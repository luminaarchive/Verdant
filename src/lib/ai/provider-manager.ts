// ─── Provider Manager — Orchestrator with Intelligent Failover ──────────────
// This is the ONLY module the research pipeline calls.
// It handles: provider selection → execution → retry → failover → health tracking.
//
// Fallback chain (strict order):
//   1. OpenRouter (Claude Opus/Sonnet via OpenRouter) — PRIMARY
//   2. Gemini (last resort fallback — quota-limited)
//
// For Deep and Analytica modes, OpenRouter is ALWAYS tried first because:
//   - Claude models produce higher quality long-form output
//   - Gemini has tight quota limits that cause 429 errors under load
//   - OpenRouter provides access to premium models without Vercel timeout issues

import type { AIProvider, ProviderRequest, ProviderResponse, ProviderFailure } from './types'
import { classifyError } from './types'
import { OpenRouterProvider } from './openrouter'
import { GeminiProvider } from './gemini-provider'
import { recordSuccess, recordFailure } from './health'
import { log, type LogContext } from '../research/logger'

// ─── Provider Registry (order matters — first = highest priority) ───────────
const openRouter = new OpenRouterProvider()
const gemini = new GeminiProvider()

// ─── Failover Configuration ─────────────────────────────────────────────────
const MAX_RETRIES_PER_PROVIDER = 1
const RETRY_DELAY_MS = 1500

interface ProviderManagerResult {
  response: ProviderResponse
  attempts: ProviderFailure[]
  totalDurationMs: number
}

export async function callWithFailover(
  req: ProviderRequest,
  ctx: Partial<LogContext>
): Promise<ProviderManagerResult> {
  const attempts: ProviderFailure[] = []
  const startTime = Date.now()

  // Build ordered provider list: OpenRouter always first, Gemini last
  const ordered = getProviderOrder(req.mode)

  log.info(`Provider order for ${req.mode}: [${ordered.map(p => p.name).join(' → ')}]`, ctx)

  for (const provider of ordered) {
    if (!provider.isConfigured()) {
      log.warn(`Skipping ${provider.name}: not configured`, ctx)
      continue
    }

    for (let retry = 0; retry <= MAX_RETRIES_PER_PROVIDER; retry++) {
      try {
        if (retry > 0) {
          log.warn(`Retrying ${provider.name} (attempt ${retry + 1})`, ctx)
          await new Promise(r => setTimeout(r, RETRY_DELAY_MS * retry))
        }

        log.step('provider', `Trying ${provider.name} (retry ${retry})`, {
          ...ctx,
          pipelineSource: provider.name as any,
        })

        const response = await provider.call(req)

        // Success
        recordSuccess(provider.name, response.durationMs)

        log.info(`Provider ${provider.name} succeeded in ${response.durationMs}ms`, {
          ...ctx,
          pipelineSource: provider.name as any,
          durationMs: response.durationMs,
        })

        return {
          response,
          attempts,
          totalDurationMs: Date.now() - startTime,
        }

      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        const httpStatus = (err as any)?.httpStatus
        const failureType = classifyError(message, httpStatus)

        const failure: ProviderFailure = {
          provider: provider.name,
          error: message.slice(0, 200),
          type: failureType,
          httpStatus,
          durationMs: Date.now() - startTime,
        }
        attempts.push(failure)
        recordFailure(provider.name, message)

        log.error(`Provider ${provider.name} failed: ${message.slice(0, 150)}`, {
          ...ctx,
          pipelineSource: provider.name as any,
          failureStep: 'provider-call',
          retryCount: retry,
        })

        // Non-retryable errors: skip to next provider immediately
        if (failureType === 'non-retryable') {
          log.warn(`Non-retryable error from ${provider.name}, moving to next provider`, ctx)
          break
        }
      }
    }

    log.warn(`All retries exhausted for ${provider.name}, falling back`, ctx)
  }

  // All providers failed
  const lastAttempt = attempts[attempts.length - 1]
  throw new ProviderExhaustedError(
    `All providers failed. Last error: ${lastAttempt?.error ?? 'unknown'}`,
    attempts
  )
}

// ─── Provider Ordering (mode-aware) ─────────────────────────────────────────
// OpenRouter is ALWAYS first for Deep and Analytica (Claude models).
// Gemini is ALWAYS last (quota-limited, acts as emergency fallback).
// This is a FIXED ordering — not health-based. Health-based sorting was
// causing Gemini to be promoted above OpenRouter after OpenRouter had a
// single transient failure, leading to Gemini quota exhaustion.

function getProviderOrder(mode: string): AIProvider[] {
  // Fixed order: OpenRouter first (Claude), Gemini last (fallback)
  // This prevents Gemini from being promoted and exhausting its quota
  const allProviders: AIProvider[] = [openRouter, gemini]
  return allProviders.filter(p => p.isConfigured())
}

// ─── Custom Error ───────────────────────────────────────────────────────────

export class ProviderExhaustedError extends Error {
  attempts: ProviderFailure[]
  constructor(message: string, attempts: ProviderFailure[]) {
    super(message)
    this.name = 'ProviderExhaustedError'
    this.attempts = attempts
  }
}
