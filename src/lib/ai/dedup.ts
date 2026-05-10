// ─── Request Deduplication ──────────────────────────────────────────────────
// Prevents duplicate expensive AI calls by coalescing identical in-flight requests.
// If the same query+mode is already being processed, callers attach to the
// existing promise instead of firing a new OpenRouter call.

import { createHash } from 'crypto'

interface InFlightEntry<T> {
  promise: Promise<T>
  createdAt: number
  refCount: number
}

// Max time an in-flight entry can live before forced expiry (safety valve)
const MAX_INFLIGHT_MS = 90_000

const inflight = new Map<string, InFlightEntry<any>>()

/**
 * Create a stable hash key from query + mode.
 */
export function makeRequestKey(query: string, mode: string): string {
  const normalized = query.toLowerCase().trim().replace(/\s+/g, ' ')
  return createHash('sha256').update(`${mode}:${normalized}`).digest('hex').slice(0, 16)
}

/**
 * Execute a function with deduplication.
 * If the same key is already in-flight, returns the existing promise.
 */
export async function dedup<T>(
  key: string,
  fn: () => Promise<T>
): Promise<{ result: T; deduplicated: boolean }> {
  // Prune expired entries
  const now = Date.now()
  for (const [k, entry] of inflight) {
    if (now - entry.createdAt > MAX_INFLIGHT_MS) {
      console.log(`[dedup] 🧹 Pruning expired in-flight entry: ${k}`)
      inflight.delete(k)
    }
  }

  // Check for existing in-flight request
  const existing = inflight.get(key)
  if (existing && now - existing.createdAt < MAX_INFLIGHT_MS) {
    existing.refCount++
    console.log(`[dedup] ♻️ Attaching to existing request key=${key} refCount=${existing.refCount}`)
    try {
      const result = await existing.promise
      return { result, deduplicated: true }
    } finally {
      existing.refCount--
      if (existing.refCount <= 0) {
        inflight.delete(key)
      }
    }
  }

  // New request — create entry
  const promise = fn()
  const entry: InFlightEntry<T> = {
    promise,
    createdAt: now,
    refCount: 1,
  }
  inflight.set(key, entry)

  console.log(`[dedup] 🆕 New request key=${key} (${inflight.size} in-flight total)`)

  try {
    const result = await promise
    return { result, deduplicated: false }
  } finally {
    entry.refCount--
    if (entry.refCount <= 0) {
      inflight.delete(key)
    }
  }
}

/**
 * Get current in-flight count (for diagnostics).
 */
export function getInflightCount(): number {
  return inflight.size
}

/**
 * Get detailed in-flight state (for health endpoint).
 */
export function getInflightState(): Array<{ key: string; ageMs: number; refCount: number }> {
  const now = Date.now()
  return Array.from(inflight.entries()).map(([key, entry]) => ({
    key,
    ageMs: now - entry.createdAt,
    refCount: entry.refCount,
  }))
}
