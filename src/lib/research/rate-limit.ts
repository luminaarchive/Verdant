// ─── Rate Limiter ───────────────────────────────────────────────────────────
// Simple in-memory rate limiter per IP.
// Resets on cold start — this is INTENTIONALLY ephemeral.
//
// Design decision: Rate limiting is acceptable as in-memory because:
//   1. A cold-start reset only briefly lifts the rate limit — not a security risk.
//   2. Each Vercel instance gets its own rate limit window — acceptable at our scale.
//   3. For true distributed rate limiting, upgrade to Redis/Upstash.
//
// NOTE: Idempotency deduplication is NOT handled here. It is DB-backed via
// findByIdempotencyKey() in src/lib/research/jobs.ts using the research_jobs
// table's idempotency_key column. This ensures idempotency survives crashes,
// cold starts, and multi-instance deployment.

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
