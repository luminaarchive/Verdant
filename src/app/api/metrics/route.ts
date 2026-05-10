// ─── /api/metrics — Production Metrics Dashboard ────────────────────────────
// Exposes all internal metrics for monitoring and diagnostics.
// Includes: request stats, model performance, cache stats, circuit breaker,
// concurrency state, and in-flight requests.

import { NextResponse } from 'next/server'
import { getMetrics } from '@/infrastructure/metrics'
import { getCacheStats } from '@/infrastructure/cache'
import { getUnhealthyModels, getUnhealthyCount } from '@/infrastructure/model-health'
import { getAllCircuitStates } from '@/infrastructure/circuit-breaker'
import { getConcurrencyState } from '@/infrastructure/concurrency'
import { getInflightState } from '@/infrastructure/dedup'

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
