// ─── Concurrency Protection ─────────────────────────────────────────────────
// Guards against overload during traffic spikes.
// Implements per-user limits, global caps, and graceful rejection.

interface ActiveRequest {
  userId: string
  startedAt: number
  mode: string
}

// ─── Configuration ──────────────────────────────────────────────────────────
const MAX_GLOBAL_CONCURRENT = 8        // Max simultaneous AI requests across all users
const MAX_PER_USER_CONCURRENT = 2      // Max per user (by IP or auth)
const REQUEST_EXPIRY_MS = 120_000      // Auto-expire stuck requests after 2 min

// ─── In-Memory Store ────────────────────────────────────────────────────────
const activeRequests = new Map<string, ActiveRequest>()

function pruneExpired(): void {
  const now = Date.now()
  for (const [id, req] of activeRequests) {
    if (now - req.startedAt > REQUEST_EXPIRY_MS) {
      console.log(`[concurrency] 🧹 Pruning expired request: ${id} (age=${Math.round((now - req.startedAt) / 1000)}s)`)
      activeRequests.delete(id)
    }
  }
}

/**
 * Check if a new request is allowed.
 * Returns { allowed, reason } — reason is only set when blocked.
 */
export function checkConcurrency(userId: string): {
  allowed: boolean
  reason?: string
  globalActive: number
  userActive: number
} {
  pruneExpired()

  const globalActive = activeRequests.size
  let userActive = 0
  for (const [, req] of activeRequests) {
    if (req.userId === userId) userActive++
  }

  if (globalActive >= MAX_GLOBAL_CONCURRENT) {
    console.warn(`[concurrency] 🚫 Global limit reached (${globalActive}/${MAX_GLOBAL_CONCURRENT})`)
    return {
      allowed: false,
      reason: `Server is processing ${globalActive} requests. Please try again in a moment.`,
      globalActive,
      userActive,
    }
  }

  if (userActive >= MAX_PER_USER_CONCURRENT) {
    console.warn(`[concurrency] 🚫 Per-user limit reached for ${userId} (${userActive}/${MAX_PER_USER_CONCURRENT})`)
    return {
      allowed: false,
      reason: `You already have ${userActive} research requests in progress. Please wait for them to complete.`,
      globalActive,
      userActive,
    }
  }

  return { allowed: true, globalActive, userActive }
}

/**
 * Register an active request. Returns a release function.
 */
export function registerRequest(requestId: string, userId: string, mode: string): () => void {
  activeRequests.set(requestId, {
    userId,
    startedAt: Date.now(),
    mode,
  })

  console.log(`[concurrency] ➕ Registered ${requestId} (global=${activeRequests.size}, user=${userId})`)

  return () => {
    activeRequests.delete(requestId)
    console.log(`[concurrency] ➖ Released ${requestId} (global=${activeRequests.size})`)
  }
}

/**
 * Get concurrency state for diagnostics.
 */
export function getConcurrencyState(): {
  globalActive: number
  maxGlobal: number
  maxPerUser: number
  requests: Array<{ id: string; userId: string; mode: string; ageMs: number }>
} {
  pruneExpired()
  const now = Date.now()
  return {
    globalActive: activeRequests.size,
    maxGlobal: MAX_GLOBAL_CONCURRENT,
    maxPerUser: MAX_PER_USER_CONCURRENT,
    requests: Array.from(activeRequests.entries()).map(([id, r]) => ({
      id,
      userId: r.userId.slice(0, 8) + '...', // Truncate for privacy
      mode: r.mode,
      ageMs: now - r.startedAt,
    })),
  }
}
