// ─── Provider Manager — Production-Hardened Orchestrator ────────────────────
// Single entry point for the research pipeline.
// Handles: provider selection → execution → retry → failover → health tracking.
//
// ARCHITECTURE: OpenRouter-only (Gemini disabled by user request).
// All provider calls are SEQUENTIAL to prevent Vercel memory spikes.

import type { AIProvider, ProviderRequest, ProviderResponse, ProviderFailure } from './types'
import { classifyError } from './types'
import { OpenRouterProvider } from './openrouter'
import { recordSuccess, recordFailure, hasRecentFailure, getSuccessRate } from './health'
import { isCircuitAllowed, getCircuitState, getAllCircuitStates } from './circuit-breaker'
import { getUnhealthyModels } from './model-health'
import { log, type LogContext } from '../research/logger'

// ─── Provider Registry ──────────────────────────────────────────────────────
const providers: AIProvider[] = [
  new OpenRouterProvider(),
]

// ─── Failover Configuration ─────────────────────────────────────────────────
const MAX_RETRIES_PER_PROVIDER = 1
const RETRY_DELAY_MS = 1500
const FAILOVER_BUDGET_MS = 55_000  // Must stay under Vercel's 60s limit

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

  const ordered = getProviderOrder()

  if (ordered.length === 0) {
    throw new ProviderExhaustedError(
      'No AI providers are configured. Set OPENROUTER_API_KEY in Vercel Environment Variables.',
      []
    )
  }

  log.info(`Provider order: [${ordered.map(p => p.name).join(' → ')}]`, ctx)

  // Log circuit breaker and model health state
  const circuitStates = getAllCircuitStates()
  const unhealthyModels = getUnhealthyModels()
  if (Object.keys(circuitStates).length > 0) {
    console.log(`[provider-manager] Circuit states: ${JSON.stringify(circuitStates)}`)
  }
  if (unhealthyModels.length > 0) {
    console.log(`[provider-manager] Unhealthy models: ${unhealthyModels.map(m => `${m.model}(${m.reason})`).join(', ')}`)
  }

  for (const provider of ordered) {
    // Check overall budget
    const budgetRemaining = FAILOVER_BUDGET_MS - (Date.now() - startTime)
    if (budgetRemaining < 5_000) {
      log.warn(`Failover budget exhausted (${Date.now() - startTime}ms elapsed), aborting`, ctx)
      break
    }

    // Check circuit breaker
    if (!isCircuitAllowed(provider.name)) {
      const state = getCircuitState(provider.name)
      log.warn(
        `Circuit breaker OPEN for ${provider.name} — ` +
        `cooldown=${Math.round(state.cooldownRemainingMs / 1000)}s, skipping`,
        ctx
      )
      attempts.push({
        provider: provider.name,
        error: `Circuit breaker OPEN (${state.recentFailures} recent failures)`,
        type: 'non-retryable',
        durationMs: 0,
      })
      continue
    }

    for (let retry = 0; retry <= MAX_RETRIES_PER_PROVIDER; retry++) {
      if (FAILOVER_BUDGET_MS - (Date.now() - startTime) < 5_000) break

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

        log.info(
          `Provider ${provider.name} succeeded in ${response.durationMs}ms ` +
          `(model=${response.model}, tokens=${response.inputTokens}+${response.outputTokens})`,
          { ...ctx, pipelineSource: provider.name as any, durationMs: response.durationMs }
        )

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
          error: message.slice(0, 300),
          type: failureType,
          httpStatus,
          durationMs: Date.now() - startTime,
        }
        attempts.push(failure)
        recordFailure(provider.name, message)

        log.error(
          `Provider ${provider.name} failed (retry ${retry}): ${message.slice(0, 200)}`,
          { ...ctx, pipelineSource: provider.name as any, failureStep: 'provider-call', retryCount: retry }
        )

        if (failureType === 'non-retryable') {
          log.warn(`Non-retryable error from ${provider.name}, moving to next provider`, ctx)
          break
        }
      }
    }

    log.warn(`All retries exhausted for ${provider.name}`, ctx)
  }

  // All providers failed
  const allErrors = attempts.map((a, i) => `[${i+1}] ${a.provider}: ${a.error}`).join(' | ')
  throw new ProviderExhaustedError(
    `All providers failed (${attempts.length} attempts). Errors: ${allErrors}`,
    attempts
  )
}

// ─── Provider Ordering ──────────────────────────────────────────────────────
function getProviderOrder(): AIProvider[] {
  return [...providers]
    .filter(p => p.isConfigured())
    .sort((a, b) => {
      const aRecent = hasRecentFailure(a.name) ? 1 : 0
      const bRecent = hasRecentFailure(b.name) ? 1 : 0
      if (aRecent !== bRecent) return aRecent - bRecent
      const aRate = getSuccessRate(a.name)
      const bRate = getSuccessRate(b.name)
      return bRate - aRate
    })
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
