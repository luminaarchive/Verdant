// ─── Model Health Cache ─────────────────────────────────────────────────────
// Tracks unhealthy models and prevents repeated calls to dead/broken models.
// Models are marked unhealthy for a cooldown period after failures.
// This is in-memory (resets on cold start) which is fine for Vercel serverless.

export type UnhealthyReason = 
  | 'http_404'
  | 'http_429' 
  | 'http_5xx'
  | 'timeout'
  | 'empty_body'
  | 'invalid_json'
  | 'empty_content'
  | 'provider_unavailable'

interface ModelHealthEntry {
  model: string
  reason: UnhealthyReason
  markedAt: number
  failCount: number
  cooldownMs: number
}

// ─── Configuration ──────────────────────────────────────────────────────────
const BASE_COOLDOWN_MS = 10 * 60 * 1000   // 10 minutes base cooldown
const MAX_COOLDOWN_MS = 30 * 60 * 1000    // 30 minutes max cooldown
const COOLDOWN_MULTIPLIER = 1.5           // Exponential backoff per consecutive failure

// ─── In-Memory Store ────────────────────────────────────────────────────────
const unhealthyModels = new Map<string, ModelHealthEntry>()

/**
 * Check if a model is currently healthy (allowed to be called).
 */
export function isModelHealthy(model: string): boolean {
  const entry = unhealthyModels.get(model)
  if (!entry) return true

  const elapsed = Date.now() - entry.markedAt
  if (elapsed >= entry.cooldownMs) {
    // Cooldown expired — model is allowed to retry
    console.log(`[model-health] ♻️ Model ${model} cooldown expired after ${Math.round(elapsed / 1000)}s — allowing retry`)
    unhealthyModels.delete(model)
    return true
  }

  return false
}

/**
 * Get remaining cooldown time for an unhealthy model.
 */
export function getCooldownRemaining(model: string): number {
  const entry = unhealthyModels.get(model)
  if (!entry) return 0
  const remaining = entry.cooldownMs - (Date.now() - entry.markedAt)
  return Math.max(0, remaining)
}

/**
 * Mark a model as unhealthy after a failure.
 */
export function markModelUnhealthy(model: string, reason: UnhealthyReason): void {
  const existing = unhealthyModels.get(model)
  const failCount = existing ? existing.failCount + 1 : 1
  const cooldownMs = Math.min(
    BASE_COOLDOWN_MS * Math.pow(COOLDOWN_MULTIPLIER, failCount - 1),
    MAX_COOLDOWN_MS
  )

  unhealthyModels.set(model, {
    model,
    reason,
    markedAt: Date.now(),
    failCount,
    cooldownMs,
  })

  console.log(
    `[model-health] 🚫 Model ${model} marked UNHEALTHY — reason=${reason}, ` +
    `failCount=${failCount}, cooldown=${Math.round(cooldownMs / 1000)}s`
  )
}

/**
 * Mark a model as recovered (successful call).
 */
export function markModelHealthy(model: string): void {
  if (unhealthyModels.has(model)) {
    console.log(`[model-health] ✅ Model ${model} recovered — clearing unhealthy status`)
    unhealthyModels.delete(model)
  }
}

/**
 * Get a snapshot of all unhealthy models (for diagnostics).
 */
export function getUnhealthyModels(): Array<{
  model: string
  reason: UnhealthyReason
  failCount: number
  cooldownRemainingMs: number
}> {
  const now = Date.now()
  const result: Array<{
    model: string
    reason: UnhealthyReason
    failCount: number
    cooldownRemainingMs: number
  }> = []

  for (const [, entry] of unhealthyModels) {
    const remaining = entry.cooldownMs - (now - entry.markedAt)
    if (remaining > 0) {
      result.push({
        model: entry.model,
        reason: entry.reason,
        failCount: entry.failCount,
        cooldownRemainingMs: remaining,
      })
    }
  }

  return result
}

/**
 * Get total count of currently unhealthy models.
 */
export function getUnhealthyCount(): number {
  // Prune expired entries while counting
  const now = Date.now()
  let count = 0
  for (const [key, entry] of unhealthyModels) {
    if (now - entry.markedAt >= entry.cooldownMs) {
      unhealthyModels.delete(key)
    } else {
      count++
    }
  }
  return count
}
