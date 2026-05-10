// ─── Production Metrics ─────────────────────────────────────────────────────
// In-memory metrics tracking for production observability.
// Tracks request volume, success/failure rates, latency, model reliability,
// cache hits, circuit breaker activations, and more.

interface MetricCounter {
  total: number
  success: number
  failure: number
  timeout: number
  cached: number
  deduplicated: number
  latencySum: number
  latencyCount: number
  fallbackCount: number
  circuitBreakerTrips: number
}

interface ModelMetric {
  attempts: number
  successes: number
  failures: number
  timeouts: number
  totalLatencyMs: number
  avgLatencyMs: number
  lastUsed: number
  lastError?: string
}

// ─── In-Memory Stores ───────────────────────────────────────────────────────
const counters: MetricCounter = {
  total: 0,
  success: 0,
  failure: 0,
  timeout: 0,
  cached: 0,
  deduplicated: 0,
  latencySum: 0,
  latencyCount: 0,
  fallbackCount: 0,
  circuitBreakerTrips: 0,
}

const modelMetrics = new Map<string, ModelMetric>()
const startedAt = Date.now()

// ─── Recording Functions ────────────────────────────────────────────────────

export function metricRequestStart(): void {
  counters.total++
}

export function metricRequestSuccess(latencyMs: number): void {
  counters.success++
  counters.latencySum += latencyMs
  counters.latencyCount++
}

export function metricRequestFailure(): void {
  counters.failure++
}

export function metricRequestTimeout(): void {
  counters.timeout++
}

export function metricCacheHit(): void {
  counters.cached++
}

export function metricDeduplicated(): void {
  counters.deduplicated++
}

export function metricFallback(): void {
  counters.fallbackCount++
}

export function metricCircuitBreakerTrip(): void {
  counters.circuitBreakerTrips++
}

export function metricModelAttempt(model: string): void {
  const m = modelMetrics.get(model) || {
    attempts: 0, successes: 0, failures: 0, timeouts: 0,
    totalLatencyMs: 0, avgLatencyMs: 0, lastUsed: 0,
  }
  m.attempts++
  m.lastUsed = Date.now()
  modelMetrics.set(model, m)
}

export function metricModelSuccess(model: string, latencyMs: number): void {
  const m = modelMetrics.get(model) || {
    attempts: 0, successes: 0, failures: 0, timeouts: 0,
    totalLatencyMs: 0, avgLatencyMs: 0, lastUsed: 0,
  }
  m.successes++
  m.totalLatencyMs += latencyMs
  m.avgLatencyMs = m.totalLatencyMs / m.successes
  m.lastUsed = Date.now()
  modelMetrics.set(model, m)
}

export function metricModelFailure(model: string, error: string): void {
  const m = modelMetrics.get(model) || {
    attempts: 0, successes: 0, failures: 0, timeouts: 0,
    totalLatencyMs: 0, avgLatencyMs: 0, lastUsed: 0,
  }
  m.failures++
  m.lastError = error.slice(0, 100)
  m.lastUsed = Date.now()
  modelMetrics.set(model, m)
}

export function metricModelTimeout(model: string): void {
  const m = modelMetrics.get(model) || {
    attempts: 0, successes: 0, failures: 0, timeouts: 0,
    totalLatencyMs: 0, avgLatencyMs: 0, lastUsed: 0,
  }
  m.timeouts++
  m.lastUsed = Date.now()
  modelMetrics.set(model, m)
}

// ─── Retrieval ──────────────────────────────────────────────────────────────

export function getMetrics(): {
  uptime: number
  requests: MetricCounter
  avgLatencyMs: number
  successRate: number
  cacheHitRate: number
  models: Record<string, ModelMetric & { reliabilityScore: number }>
} {
  const avgLatency = counters.latencyCount > 0
    ? Math.round(counters.latencySum / counters.latencyCount)
    : 0

  const successRate = counters.total > 0
    ? Number((counters.success / counters.total).toFixed(3))
    : 0

  const cacheHitRate = counters.total > 0
    ? Number((counters.cached / counters.total).toFixed(3))
    : 0

  const models: Record<string, ModelMetric & { reliabilityScore: number }> = {}
  for (const [name, m] of modelMetrics) {
    const reliability = m.attempts > 0
      ? Number((m.successes / m.attempts).toFixed(3))
      : 0
    models[name] = { ...m, reliabilityScore: reliability }
  }

  return {
    uptime: Date.now() - startedAt,
    requests: { ...counters },
    avgLatencyMs: avgLatency,
    successRate,
    cacheHitRate,
    models,
  }
}

/**
 * Get model reliability scores for adaptive routing.
 */
export function getModelReliability(): Map<string, number> {
  const result = new Map<string, number>()
  for (const [name, m] of modelMetrics) {
    if (m.attempts > 0) {
      result.set(name, m.successes / m.attempts)
    }
  }
  return result
}

/**
 * Get model average latency for adaptive routing.
 */
export function getModelLatency(): Map<string, number> {
  const result = new Map<string, number>()
  for (const [name, m] of modelMetrics) {
    if (m.successes > 0) {
      result.set(name, m.avgLatencyMs)
    }
  }
  return result
}
