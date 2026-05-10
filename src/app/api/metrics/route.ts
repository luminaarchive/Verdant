// ─── /api/metrics — Production Metrics Dashboard ────────────────────────────
// Exposes all internal metrics for monitoring and diagnostics.
// Includes: request stats, model performance, cache stats, circuit breaker,
// concurrency state, and in-flight requests.

import { NextResponse } from 'next/server'
import { getMetrics } from '@/lib/ai/metrics'
import { getCacheStats } from '@/lib/ai/cache'
import { getUnhealthyModels, getUnhealthyCount } from '@/lib/ai/model-health'
import { getAllCircuitStates } from '@/lib/ai/circuit-breaker'
import { getConcurrencyState } from '@/lib/ai/concurrency'
import { getInflightState } from '@/lib/ai/dedup'

export const runtime = 'nodejs'

export async function GET() {
  const metrics = getMetrics()
  const cache = getCacheStats()
  const concurrency = getConcurrencyState()
  const inflight = getInflightState()
  const unhealthy = getUnhealthyModels()
  const circuits = getAllCircuitStates()

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    metrics,
    cache: {
      size: cache.size,
      maxSize: cache.maxSize,
      totalHits: cache.totalHits,
      entries: cache.entries.length,
    },
    concurrency,
    dedup: {
      inflight: inflight.length,
      requests: inflight,
    },
    modelHealth: {
      unhealthyCount: getUnhealthyCount(),
      models: unhealthy,
    },
    circuitBreakers: circuits,
  })
}
