// ─── Response Cache ─────────────────────────────────────────────────────────
// In-memory LRU cache for successful AI responses.
// Reduces latency, OpenRouter load, and free-model instability impact.
// TTL varies by mode (focus=30min, deep=2h, analytica=6h).

interface CacheEntry {
  result: any
  rawJson: string
  createdAt: number
  ttlMs: number
  hits: number
  model: string
  durationMs: number
}

// ─── Configuration ──────────────────────────────────────────────────────────
const MODE_TTL_MS: Record<string, number> = {
  focus:     30 * 60 * 1000,     // 30 minutes
  deep:      2 * 60 * 60 * 1000, // 2 hours
  analytica: 6 * 60 * 60 * 1000, // 6 hours
}

const MAX_CACHE_SIZE = 50          // Max entries (LRU eviction)
const DEFAULT_TTL_MS = 30 * 60 * 1000

// ─── In-Memory Store ────────────────────────────────────────────────────────
const cache = new Map<string, CacheEntry>()

// LRU tracking — most recently accessed keys at the end
const lruOrder: string[] = []

function touchLru(key: string): void {
  const idx = lruOrder.indexOf(key)
  if (idx >= 0) lruOrder.splice(idx, 1)
  lruOrder.push(key)
}

function evictIfNeeded(): void {
  while (cache.size > MAX_CACHE_SIZE && lruOrder.length > 0) {
    const oldest = lruOrder.shift()
    if (oldest) {
      cache.delete(oldest)
      console.log(`[cache] 🧹 LRU evicted: ${oldest} (size=${cache.size})`)
    }
  }
}

/**
 * Get a cached response.
 */
export function cacheGet(key: string): { result: any; rawJson: string; model: string; cachedDurationMs: number } | null {
  const entry = cache.get(key)
  if (!entry) return null

  // Check TTL
  const age = Date.now() - entry.createdAt
  if (age > entry.ttlMs) {
    cache.delete(key)
    const idx = lruOrder.indexOf(key)
    if (idx >= 0) lruOrder.splice(idx, 1)
    console.log(`[cache] ⏰ Expired: ${key} (age=${Math.round(age / 1000)}s, ttl=${Math.round(entry.ttlMs / 1000)}s)`)
    return null
  }

  entry.hits++
  touchLru(key)

  console.log(
    `[cache] ✅ HIT: ${key} | hits=${entry.hits} age=${Math.round(age / 1000)}s ` +
    `model=${entry.model} originalDuration=${entry.durationMs}ms`
  )

  return {
    result: entry.result,
    rawJson: entry.rawJson,
    model: entry.model,
    cachedDurationMs: entry.durationMs,
  }
}

/**
 * Store a response in cache.
 */
export function cacheSet(
  key: string,
  result: any,
  rawJson: string,
  mode: string,
  model: string,
  durationMs: number
): void {
  const ttlMs = MODE_TTL_MS[mode] ?? DEFAULT_TTL_MS

  cache.set(key, {
    result,
    rawJson,
    createdAt: Date.now(),
    ttlMs,
    hits: 0,
    model,
    durationMs,
  })

  touchLru(key)
  evictIfNeeded()

  console.log(
    `[cache] 💾 SET: ${key} | mode=${mode} ttl=${Math.round(ttlMs / 60000)}min ` +
    `model=${model} size=${cache.size}`
  )
}

/**
 * Get cache statistics for diagnostics.
 */
export function getCacheStats(): {
  size: number
  maxSize: number
  entries: Array<{ key: string; mode: string; hits: number; ageMs: number; ttlMs: number }>
  totalHits: number
} {
  const now = Date.now()
  let totalHits = 0
  const entries: Array<{ key: string; mode: string; hits: number; ageMs: number; ttlMs: number }> = []

  for (const [key, entry] of cache) {
    const age = now - entry.createdAt
    if (age > entry.ttlMs) {
      cache.delete(key)
      continue
    }
    totalHits += entry.hits
    entries.push({
      key,
      mode: entry.result?.mode ?? 'unknown',
      hits: entry.hits,
      ageMs: age,
      ttlMs: entry.ttlMs,
    })
  }

  return { size: cache.size, maxSize: MAX_CACHE_SIZE, entries, totalHits }
}
