// ─── Circuit Breaker ────────────────────────────────────────────────────────
// Provider-level circuit breaker to prevent cascading timeout storms.
// States: CLOSED (normal) → OPEN (blocking) → HALF_OPEN (testing)

export type CircuitState = 'closed' | 'open' | 'half_open'

interface CircuitBreakerState {
  state: CircuitState
  failures: number[]          // timestamps of recent failures
  successes: number[]         // timestamps of recent successes
  openedAt: number | null     // when circuit was opened
  halfOpenAt: number | null   // when circuit entered half-open
  lastStateChange: number
}

// ─── Configuration ──────────────────────────────────────────────────────────
const WINDOW_MS = 60_000            // Track failures within 60s window
const FAILURE_THRESHOLD = 0.8       // 80% failure rate opens circuit
const MIN_REQUESTS = 3              // Minimum requests before evaluating
const OPEN_DURATION_MS = 30_000     // Stay open for 30s before half-open
const HALF_OPEN_MAX_TESTS = 1       // Allow 1 test request in half-open

// ─── In-Memory Store ────────────────────────────────────────────────────────
const circuits = new Map<string, CircuitBreakerState>()

function getOrCreate(provider: string): CircuitBreakerState {
  if (!circuits.has(provider)) {
    circuits.set(provider, {
      state: 'closed',
      failures: [],
      successes: [],
      openedAt: null,
      halfOpenAt: null,
      lastStateChange: Date.now(),
    })
  }
  return circuits.get(provider)!
}

function pruneWindow(timestamps: number[], now: number): number[] {
  return timestamps.filter(t => now - t < WINDOW_MS)
}

/**
 * Check if requests should be allowed through the circuit.
 */
export function isCircuitAllowed(provider: string): boolean {
  const cb = getOrCreate(provider)
  const now = Date.now()

  if (cb.state === 'closed') return true

  if (cb.state === 'open') {
    // Check if cooldown has elapsed → transition to half-open
    if (cb.openedAt && now - cb.openedAt >= OPEN_DURATION_MS) {
      cb.state = 'half_open'
      cb.halfOpenAt = now
      cb.lastStateChange = now
      console.log(`[circuit-breaker] ⚡ ${provider}: OPEN → HALF_OPEN — allowing test request`)
      return true
    }
    return false
  }

  // half_open — allow limited test requests
  return true
}

/**
 * Record a successful request.
 */
export function recordCircuitSuccess(provider: string): void {
  const cb = getOrCreate(provider)
  const now = Date.now()

  cb.successes = [...pruneWindow(cb.successes, now), now]

  if (cb.state === 'half_open') {
    // Success in half-open → close circuit
    cb.state = 'closed'
    cb.openedAt = null
    cb.halfOpenAt = null
    cb.failures = []
    cb.lastStateChange = now
    console.log(`[circuit-breaker] ✅ ${provider}: HALF_OPEN → CLOSED — provider recovered`)
  }
}

/**
 * Record a failed request.
 */
export function recordCircuitFailure(provider: string): void {
  const cb = getOrCreate(provider)
  const now = Date.now()

  cb.failures = [...pruneWindow(cb.failures, now), now]
  cb.successes = pruneWindow(cb.successes, now)

  if (cb.state === 'half_open') {
    // Failure in half-open → reopen circuit
    cb.state = 'open'
    cb.openedAt = now
    cb.halfOpenAt = null
    cb.lastStateChange = now
    console.log(`[circuit-breaker] 🚫 ${provider}: HALF_OPEN → OPEN — test request failed, reopening`)
    return
  }

  if (cb.state === 'closed') {
    const total = cb.failures.length + cb.successes.length
    if (total >= MIN_REQUESTS) {
      const failureRate = cb.failures.length / total
      if (failureRate >= FAILURE_THRESHOLD) {
        cb.state = 'open'
        cb.openedAt = now
        cb.lastStateChange = now
        console.log(
          `[circuit-breaker] 🔴 ${provider}: CLOSED → OPEN — ` +
          `failure rate ${(failureRate * 100).toFixed(0)}% (${cb.failures.length}/${total}) exceeds threshold`
        )
      }
    }
  }
}

/**
 * Get circuit state for diagnostics.
 */
export function getCircuitState(provider: string): {
  state: CircuitState
  recentFailures: number
  recentSuccesses: number
  failureRate: number
  cooldownRemainingMs: number
} {
  const cb = getOrCreate(provider)
  const now = Date.now()
  const failures = pruneWindow(cb.failures, now)
  const successes = pruneWindow(cb.successes, now)
  const total = failures.length + successes.length

  return {
    state: cb.state,
    recentFailures: failures.length,
    recentSuccesses: successes.length,
    failureRate: total > 0 ? failures.length / total : 0,
    cooldownRemainingMs: cb.state === 'open' && cb.openedAt
      ? Math.max(0, OPEN_DURATION_MS - (now - cb.openedAt))
      : 0,
  }
}

/**
 * Get all circuit states for diagnostics.
 */
export function getAllCircuitStates(): Record<string, ReturnType<typeof getCircuitState>> {
  const result: Record<string, ReturnType<typeof getCircuitState>> = {}
  for (const [provider] of circuits) {
    result[provider] = getCircuitState(provider)
  }
  return result
}
