// ─── Provider Health Tracker ────────────────────────────────────────────────
// In-memory health tracking. Resets on cold start (fine for serverless).
// Used by provider-manager to make intelligent routing decisions.

import type { ProviderHealthSnapshot } from '@/lib/ai/types'

const health = new Map<string, {
  success: number
  failure: number
  totalLatency: number
  lastFailure?: { time: number; error: string }
  lastSuccess?: number
}>()

export function recordSuccess(provider: string, durationMs: number) {
  const h = health.get(provider) ?? { success: 0, failure: 0, totalLatency: 0 }
  h.success++
  h.totalLatency += durationMs
  h.lastSuccess = Date.now()
  health.set(provider, h)
}

export function recordFailure(provider: string, error: string) {
  const h = health.get(provider) ?? { success: 0, failure: 0, totalLatency: 0 }
  h.failure++
  h.lastFailure = { time: Date.now(), error }
  health.set(provider, h)
}

export function getHealth(provider: string): ProviderHealthSnapshot {
  const h = health.get(provider) ?? { success: 0, failure: 0, totalLatency: 0 }
  return {
    provider,
    successCount: h.success,
    failureCount: h.failure,
    totalLatencyMs: h.totalLatency,
    lastFailure: h.lastFailure,
    lastSuccess: h.lastSuccess,
  }
}

export function getAllHealth(): ProviderHealthSnapshot[] {
  const providers = ['openrouter', 'gemini', 'openai']
  return providers.map(getHealth)
}

export function getSuccessRate(provider: string): number {
  const h = health.get(provider)
  if (!h || (h.success + h.failure) === 0) return 1 // unknown = assume good
  return h.success / (h.success + h.failure)
}

export function hasRecentFailure(provider: string, windowMs = 60_000): boolean {
  const h = health.get(provider)
  if (!h?.lastFailure) return false
  return Date.now() - h.lastFailure.time < windowMs
}
