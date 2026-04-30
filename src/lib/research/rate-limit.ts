// ─── Rate Limiter ───────────────────────────────────────────────────────────
// Simple in-memory rate limiter per IP.
// Resets on cold start (acceptable for Vercel serverless).
// For production at scale, replace with Redis/Upstash.

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

const WINDOW_MS = 60_000         // 1 minute window
const MAX_REQUESTS = 10          // max 10 research requests per minute per IP
const CLEANUP_INTERVAL = 300_000 // clean stale entries every 5 minutes

// Periodic cleanup to prevent memory leaks
let lastCleanup = Date.now()
function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key)
  }
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function checkRateLimit(ip: string): RateLimitResult {
  cleanup()
  const now = Date.now()
  const entry = store.get(ip)

  if (!entry || entry.resetAt < now) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: now + WINDOW_MS }
  }

  entry.count++
  if (entry.count > MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetAt: entry.resetAt }
}

// ─── Idempotency ────────────────────────────────────────────────────────────
// Deduplicates requests within a 30-second window based on idempotencyKey.

const idempotencyStore = new Map<string, { runId: string; timestamp: number }>()
const IDEMPOTENCY_WINDOW_MS = 30_000

export function checkIdempotency(key: string): string | null {
  const entry = idempotencyStore.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > IDEMPOTENCY_WINDOW_MS) {
    idempotencyStore.delete(key)
    return null
  }
  return entry.runId
}

export function setIdempotency(key: string, runId: string): void {
  idempotencyStore.set(key, { runId, timestamp: Date.now() })
  // Cleanup old entries
  for (const [k, v] of idempotencyStore) {
    if (Date.now() - v.timestamp > IDEMPOTENCY_WINDOW_MS * 2) {
      idempotencyStore.delete(k)
    }
  }
}
