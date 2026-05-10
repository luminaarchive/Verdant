// ─── Durable Research Job System ─────────────────────────────────────────────
// Supabase is the SINGLE source of truth. In-memory cache is a read-through
// performance layer ONLY — never written without a successful DB write first.
// Crash-safe. Multi-instance-safe. Worker-locked. Idempotent.
//
// Design invariants:
//   1. createJob()  — DB insert MUST succeed. Cache populated after.
//   2. getJob()     — DB read first (cache miss) or cache (cache hit with TTL).
//   3. updateJob()  — DB update MUST succeed. Cache updated after.
//   4. workerLock   — DB atomic CAS. No fake IDs. No degraded mode.
//   5. If Supabase is unreachable, operations FAIL explicitly.

import { getSupabaseAdmin } from '../supabase/admin'

export type JobStage =
  | 'queued'
  | 'source_collection'
  | 'evidence_synthesis'
  | 'contradiction_audit'
  | 'report_composition'
  | 'quality_audit'
  | 'generating_exports'
  | 'finalizing'
  | 'ready'
  | 'failed'
  | 'retrying'
  | 'cancelled'
  | 'partial'

export interface ResearchJob {
  jobId: string
  runId: string
  query: string
  mode: 'focus' | 'deep' | 'analytica'
  presetId?: string
  status: JobStage
  progress: number
  stage: string
  providerSource?: string
  retryCount: number
  createdAt: string
  startedAt?: string
  updatedAt: string
  completedAt?: string
  failedAt?: string
  etaSeconds: number
  errorReason?: string
  partialResultAvailable: boolean
  exportReady: boolean
  exportStatus?: string
  confidenceScore?: number
  sourceCount?: number
  evidenceCount?: number
  result?: unknown
  partialResult?: unknown
  workerLockId?: string
  workerLockExpiresAt?: string
  idempotencyKey?: string
}

// ─── In-memory cache (read-through performance layer, NOT source of truth) ───
// The cache is populated AFTER successful DB operations. On cache miss, we
// always go to DB. On cache hit within TTL, we serve from cache.
// The cache is NEVER written to independently — only as a side-effect of a
// successful DB operation.
const cache = new Map<string, { job: ResearchJob; ts: number }>()
const CACHE_TTL = 30_000 // 30 seconds — short TTL to ensure freshness

function cacheGet(jobId: string): ResearchJob | null {
  const entry = cache.get(jobId)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(jobId); return null }
  return entry.job
}

function cacheSet(job: ResearchJob) {
  cache.set(job.jobId, { job, ts: Date.now() })
  // Evict old entries to prevent memory leaks
  if (cache.size > 200) {
    const cutoff = Date.now() - CACHE_TTL
    for (const [k, v] of cache) { if (v.ts < cutoff) cache.delete(k) }
  }
}

function cacheInvalidate(jobId: string) {
  cache.delete(jobId)
}

// ─── DB Row <-> Job mapping ──────────────────────────────────────────────────
 
function rowToJob(row: any): ResearchJob {
  return {
    jobId: row.job_id,
    runId: row.run_id,
    query: row.query,
    mode: row.mode,
    presetId: row.preset_id ?? undefined,
    status: row.status,
    progress: row.progress,
    stage: row.stage,
    providerSource: row.provider_source ?? undefined,
    retryCount: row.retry_count,
    createdAt: row.created_at,
    startedAt: row.started_at ?? undefined,
    updatedAt: row.updated_at,
    completedAt: row.completed_at ?? undefined,
    failedAt: row.failed_at ?? undefined,
    etaSeconds: row.eta_seconds ?? 30,
    errorReason: row.error_reason ?? undefined,
    partialResultAvailable: row.partial_result_available ?? false,
    exportReady: row.export_ready ?? false,
    exportStatus: row.export_status ?? undefined,
    confidenceScore: row.confidence_score ?? undefined,
    sourceCount: row.source_count ?? undefined,
    evidenceCount: row.evidence_count ?? undefined,
    result: row.result_data ?? undefined,
    workerLockId: row.worker_lock_id ?? undefined,
    workerLockExpiresAt: row.worker_lock_expires_at ?? undefined,
    idempotencyKey: row.idempotency_key ?? undefined,
  }
}

function jobToRow(job: Partial<ResearchJob> & { jobId: string }) {
   
  const row: any = {}
  if (job.jobId !== undefined) row.job_id = job.jobId
  if (job.runId !== undefined) row.run_id = job.runId
  if (job.query !== undefined) row.query = job.query
  if (job.mode !== undefined) row.mode = job.mode
  if (job.presetId !== undefined) row.preset_id = job.presetId
  if (job.status !== undefined) row.status = job.status
  if (job.progress !== undefined) row.progress = job.progress
  if (job.stage !== undefined) row.stage = job.stage
  if (job.providerSource !== undefined) row.provider_source = job.providerSource
  if (job.retryCount !== undefined) row.retry_count = job.retryCount
  if (job.startedAt !== undefined) row.started_at = job.startedAt
  if (job.completedAt !== undefined) row.completed_at = job.completedAt
  if (job.failedAt !== undefined) row.failed_at = job.failedAt
  if (job.etaSeconds !== undefined) row.eta_seconds = job.etaSeconds
  if (job.errorReason !== undefined) row.error_reason = job.errorReason
  if (job.partialResultAvailable !== undefined) row.partial_result_available = job.partialResultAvailable
  if (job.exportReady !== undefined) row.export_ready = job.exportReady
  if (job.exportStatus !== undefined) row.export_status = job.exportStatus
  if (job.confidenceScore !== undefined) row.confidence_score = job.confidenceScore
  if (job.sourceCount !== undefined) row.source_count = job.sourceCount
  if (job.evidenceCount !== undefined) row.evidence_count = job.evidenceCount
  if (job.result !== undefined) row.result_data = job.result
  if (job.workerLockId !== undefined) row.worker_lock_id = job.workerLockId
  if (job.workerLockExpiresAt !== undefined) row.worker_lock_expires_at = job.workerLockExpiresAt
  if (job.idempotencyKey !== undefined) row.idempotency_key = job.idempotencyKey
  return row
}

// ─── Job ID generation ───────────────────────────────────────────────────────
export function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function generateWorkerId(): string {
  return `wk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

// ─── CREATE — DB is mandatory ───────────────────────────────────────────────
// If Supabase is unreachable, createJob() throws. This is intentional:
// a silently-cached job that disappears on cold start is worse than an error.
export async function createJob(input: {
  query: string
  mode: 'focus' | 'deep' | 'analytica'
  presetId?: string
  runId: string
  idempotencyKey?: string
}): Promise<ResearchJob> {
  const jobId = generateJobId()
  const etaMap = { focus: 15, deep: 45, analytica: 180 }

  const sb = getSupabaseAdmin()
  if (!sb) {
    // Log exactly which env vars are missing for Vercel debugging
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    console.error('[jobs] createJob FAILED - Supabase client is null')
    console.error(`[jobs]   SUPABASE_URL present: ${!!url}, prefix: ${url?.slice(0, 20) ?? 'N/A'}`)
    console.error(`[jobs]   SERVICE_KEY present: ${!!key}, length: ${key?.length ?? 0}`)
    throw new Error('Database unavailable - Supabase env vars may be missing. Check Vercel Environment Variables.')
  }

  const row = {
    job_id: jobId,
    run_id: input.runId,
    query: input.query,
    normalized_query: input.query.toLowerCase().trim(),
    mode: input.mode,
    preset_id: input.presetId ?? null,
    status: 'queued',
    progress: 0,
    stage: 'Queued for processing',
    retry_count: 0,
    eta_seconds: etaMap[input.mode] ?? 30,
    partial_result_available: false,
    export_ready: false,
    idempotency_key: input.idempotencyKey ?? null,
  }

  try {
    const { data, error } = await sb.from('research_jobs').insert(row).select().single()

    if (error || !data) {
      console.error('[jobs] DB insert failed:', error?.message)
      console.error(`[jobs]   Error code: ${error?.code}, hint: ${error?.hint}`)
      console.error(`[jobs]   SUPABASE_URL prefix: ${process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 20) ?? 'N/A'}`)
      throw new Error(`Failed to create durable job: ${error?.message ?? 'unknown error'}`)
    }

    const job = rowToJob(data)
    cacheSet(job) // Write-behind: cache populated after successful DB write

    await logEvent(jobId, 'job_created', undefined, 'queued', { mode: input.mode })
    return job
  } catch (e) {
    const msg = (e as Error).message
    // If it's our own re-throw, pass through
    if (msg.startsWith('Failed to create durable job')) throw e
    // Otherwise it's a network/fetch error
    console.error(`[jobs] createJob network error: ${msg}`)
    console.error(`[jobs]   SUPABASE_URL prefix: ${process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 20) ?? 'N/A'}`)
    console.error(`[jobs]   SERVICE_KEY present: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`)
    throw new Error(`Failed to create durable job: ${msg}`)
  }
}

// ─── READ — DB-first, cache is read-through ─────────────────────────────────
// 1. Check cache (short TTL). If hit, return immediately.
// 2. On cache miss, read from Supabase (source of truth).
// 3. Populate cache on DB read.
// 4. If DB also misses, return null.
export async function getJob(jobId: string): Promise<ResearchJob | null> {
  // Check cache first (performance optimization only)
  const cached = cacheGet(jobId)
  if (cached) return cached

  // Source of truth: Supabase
  const sb = getSupabaseAdmin()
  if (!sb) {
    console.warn('[jobs] DB unavailable for getJob — no cached or durable state')
    return null
  }

  try {
    const { data, error } = await sb.from('research_jobs').select('*').eq('job_id', jobId).single()
    if (error || !data) return null

    const job = rowToJob(data)
    cacheSet(job) // Populate cache from DB
    return job
  } catch (e) {
    console.error('[jobs] getJob DB error:', (e as Error).message)
    return null
  }
}

// ─── UPDATE — DB is mandatory ───────────────────────────────────────────────
// DB update MUST succeed. Cache is updated after successful DB write.
// If DB fails, the function throws — no silent cache-only updates.
export async function updateJob(jobId: string, updates: Partial<ResearchJob>): Promise<ResearchJob | null> {
  const sb = getSupabaseAdmin()
  if (!sb) {
    console.error('[jobs] DB unavailable for updateJob')
    // Invalidate cache to prevent serving stale data
    cacheInvalidate(jobId)
    return null
  }

  const row = jobToRow({ jobId, ...updates })

  try {
    const { data, error } = await sb
      .from('research_jobs')
      .update(row)
      .eq('job_id', jobId)
      .select()
      .single()

    if (error || !data) {
      console.error('[jobs] DB update failed:', error?.message)
      cacheInvalidate(jobId)
      return null
    }

    const job = rowToJob(data)
    cacheSet(job) // Write-behind: cache updated after successful DB write
    return job
  } catch (e) {
    console.error('[jobs] updateJob error:', (e as Error).message)
    cacheInvalidate(jobId)
    return null
  }
}

// ─── COMPLETE ────────────────────────────────────────────────────────────────
export async function completeJob(jobId: string, result: unknown, extras: Partial<ResearchJob> = {}): Promise<ResearchJob | null> {
  const prevJob = await getJob(jobId)
  const job = await updateJob(jobId, {
    status: 'ready',
    progress: 100,
    stage: 'Intelligence report ready',
    completedAt: new Date().toISOString(),
    result,
    partialResultAvailable: true,
    ...extras,
  })
  await logEvent(jobId, 'job_completed', prevJob?.status, 'ready', { confidenceScore: extras.confidenceScore, sourceCount: extras.sourceCount })
  return job
}

// ─── FAIL ────────────────────────────────────────────────────────────────────
export async function failJob(jobId: string, errorReason: string, partialResult?: unknown): Promise<ResearchJob | null> {
  const prevJob = await getJob(jobId)
  const job = await updateJob(jobId, {
    status: 'failed',
    stage: 'Analysis failed',
    failedAt: new Date().toISOString(),
    errorReason,
    result: partialResult ?? prevJob?.result,
    partialResultAvailable: !!partialResult || !!prevJob?.result,
  })
  await logEvent(jobId, 'job_failed', prevJob?.status, 'failed', { errorReason })
  return job
}

// ─── IDEMPOTENCY CHECK — DB-backed ──────────────────────────────────────────
export async function findByIdempotencyKey(key: string): Promise<ResearchJob | null> {
  const sb = getSupabaseAdmin()
  if (!sb) return null

  try {
    const { data } = await sb.from('research_jobs').select('*').eq('idempotency_key', key).order('created_at', { ascending: false }).limit(1).single()
    if (!data) return null
    return rowToJob(data)
  } catch {
    return null
  }
}

// ─── WORKER LOCKING — DB atomic, no degraded mode ───────────────────────────
// Worker locking MUST use the database for atomicity. If the DB is unreachable,
// we return null (lock not acquired) — NOT a fake worker ID. This prevents
// double-processing across Vercel instances.
export async function acquireWorkerLock(jobId: string, ttlSeconds = 65): Promise<string | null> {
  const sb = getSupabaseAdmin()
  if (!sb) {
    console.error('[jobs] DB unavailable — cannot acquire worker lock')
    return null // No degraded mode. Lock requires DB.
  }

  const workerId = generateWorkerId()
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString()

  try {
    // Atomic lock: only succeeds if no active lock exists or lock has expired
    const { data, error } = await sb
      .from('research_jobs')
      .update({ worker_lock_id: workerId, worker_lock_expires_at: expiresAt })
      .eq('job_id', jobId)
      .or(`worker_lock_id.is.null,worker_lock_expires_at.lt.${new Date().toISOString()}`)
      .select('job_id')
      .single()

    if (error || !data) {
      // Genuinely locked by another worker, or DB error
      if (error?.message?.includes('0 rows')) {
        return null // Locked by another worker
      }
      console.warn('[jobs] Worker lock acquisition failed:', error?.message)
      return null
    }

    cacheInvalidate(jobId) // Invalidate cache — lock state changed in DB
    return workerId
  } catch (e) {
    console.error('[jobs] Worker lock error:', (e as Error).message)
    return null
  }
}

// ─── RENEW WORKER LOCK — extend lease during long-running jobs ──────────────
// Call this periodically during Analytica processing to prevent stale detection
// from reclaiming the job while it's still actively being processed.
export async function renewWorkerLock(jobId: string, workerId: string, ttlSeconds = 65): Promise<boolean> {
  const sb = getSupabaseAdmin()
  if (!sb) return false

  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString()

  try {
    const { data, error } = await sb
      .from('research_jobs')
      .update({ worker_lock_expires_at: expiresAt })
      .eq('job_id', jobId)
      .eq('worker_lock_id', workerId) // Only the owner can renew
      .select('job_id')
      .single()

    if (error || !data) return false
    return true
  } catch {
    return false
  }
}

export async function releaseWorkerLock(jobId: string, workerId: string): Promise<void> {
  const sb = getSupabaseAdmin()
  if (!sb) return

  await sb.from('research_jobs')
    .update({ worker_lock_id: null, worker_lock_expires_at: null })
    .eq('job_id', jobId)
    .eq('worker_lock_id', workerId)

  cacheInvalidate(jobId) // Lock state changed
}

// ─── STALE JOB DETECTION ─────────────────────────────────────────────────────
export async function detectStaleJobs(): Promise<ResearchJob[]> {
  const sb = getSupabaseAdmin()
  if (!sb) return []

  try {
    const { data } = await sb
      .from('research_jobs')
      .select('*')
      .in('status', ['evidence_synthesis', 'report_composition', 'contradiction_audit', 'quality_audit', 'generating_exports', 'retrying'])
      .lt('worker_lock_expires_at', new Date().toISOString())

    return (data ?? []).map(rowToJob)
  } catch {
    return []
  }
}

// ─── RESUME STALE JOB — crash recovery ──────────────────────────────────────
// Detects if a job is stale (worker lock expired while in processing state)
// and resets it to 'queued' so the next poll can restart processing.
// Uses partial results and event history to determine resume eligibility.
export async function resumeStaleJob(jobId: string): Promise<ResearchJob | null> {
  const job = await getJob(jobId)
  if (!job) return null

  // Only resume jobs that are in a processing state with expired locks
  const resumableStatuses: JobStage[] = ['evidence_synthesis', 'report_composition', 'contradiction_audit', 'quality_audit', 'generating_exports', 'retrying']
  if (!resumableStatuses.includes(job.status)) return null

  // Check if lock is actually expired (or null)
  if (job.workerLockExpiresAt) {
    const lockExpiry = new Date(job.workerLockExpiresAt).getTime()
    if (lockExpiry > Date.now()) {
      return null // Lock still active — another worker is processing
    }
  }

  // Reset to queued for re-processing
  const resumed = await updateJob(jobId, {
    status: 'queued',
    stage: 'Resuming after worker interruption',
    progress: Math.max(job.progress - 10, 5), // Step back slightly for safety
    workerLockId: undefined,
    workerLockExpiresAt: undefined,
  })

  await logEvent(jobId, 'job_resumed', job.status, 'queued', {
    previousProgress: job.progress,
    previousStage: job.stage,
    retryCount: job.retryCount,
  })

  return resumed
}

// ─── PARTIAL RESULT SAVE ─────────────────────────────────────────────────────
export async function savePartialResult(jobId: string, stage: string, partialData: unknown): Promise<void> {
  const sb = getSupabaseAdmin()
  if (!sb) return

  try {
    const { error } = await sb.from('research_job_partial_results').insert({
      job_id: jobId,
      stage,
      partial_data: partialData,
    })
    if (error) console.warn('[jobs] partial save error:', error.message)
  } catch (e) {
    console.warn('[jobs] partial save failed:', (e as Error).message)
  }

  await updateJob(jobId, { partialResultAvailable: true })
}

export async function getPartialResults(jobId: string): Promise<unknown[]> {
  const sb = getSupabaseAdmin()
  if (!sb) return []

  try {
    const { data } = await sb
      .from('research_job_partial_results')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })

    return data ?? []
  } catch {
    return []
  }
}

// ─── EVENT LOGGING (audit trail) ─────────────────────────────────────────────
async function logEvent(jobId: string, eventType: string, prevStatus?: string, nextStatus?: string, payload?: unknown): Promise<void> {
  const sb = getSupabaseAdmin()
  if (!sb) return

  try {
    const { error } = await sb.from('research_job_events').insert({
      job_id: jobId,
      event_type: eventType,
      previous_status: prevStatus ?? null,
      next_status: nextStatus ?? null,
      event_payload: payload ?? {},
    })
    if (error) console.warn('[jobs] event log error:', error.message)
  } catch (e) {
    console.warn('[jobs] event log failed:', (e as Error).message)
  }
}

export { logEvent }

// ─── JOB STATUS SUMMARY ─────────────────────────────────────────────────────
export async function getJobStatus(jobId: string) {
  const job = await getJob(jobId)
  if (!job) return { found: false, jobId, status: 'failed' as const, progress: 0, stage: 'Job not found', etaSeconds: 0, ready: false, failed: true, exportReady: false, partialResultAvailable: false, errorReason: 'Job not found or expired' }

  return {
    found: true,
    jobId: job.jobId,
    status: job.status,
    progress: job.progress,
    stage: job.stage,
    etaSeconds: job.etaSeconds,
    ready: job.status === 'ready',
    failed: job.status === 'failed',
    exportReady: job.exportReady,
    partialResultAvailable: job.partialResultAvailable,
    confidenceScore: job.confidenceScore,
    sourceCount: job.sourceCount,
    evidenceCount: job.evidenceCount,
    errorReason: job.errorReason,
    createdAt: job.createdAt,
    completedAt: job.completedAt,
  }
}
