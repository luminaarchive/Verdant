// ─── Durable Research Job System ─────────────────────────────────────────────
// Supabase is the source of truth. In-memory cache is a performance helper only.
// Crash-safe. Multi-instance-safe. Worker-locked. Idempotent.

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

// ─── In-memory cache (performance helper, NOT source of truth) ───────────────
const cache = new Map<string, { job: ResearchJob; ts: number }>()
const CACHE_TTL = 120_000 // 2 min cache

function cacheGet(jobId: string): ResearchJob | null {
  const entry = cache.get(jobId)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(jobId); return null }
  return entry.job
}

function cacheSet(job: ResearchJob) {
  cache.set(job.jobId, { job, ts: Date.now() })
  // Evict old entries
  if (cache.size > 200) {
    const cutoff = Date.now() - CACHE_TTL
    for (const [k, v] of cache) { if (v.ts < cutoff) cache.delete(k) }
  }
}

// ─── DB Row <-> Job mapping ──────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// ─── CREATE ──────────────────────────────────────────────────────────────────
export async function createJob(input: {
  query: string
  mode: 'focus' | 'deep' | 'analytica'
  presetId?: string
  runId: string
  idempotencyKey?: string
}): Promise<ResearchJob> {
  const jobId = generateJobId()
  const now = new Date().toISOString()
  const etaMap = { focus: 15, deep: 45, analytica: 180 }

  const job: ResearchJob = {
    jobId,
    runId: input.runId,
    query: input.query,
    mode: input.mode,
    presetId: input.presetId,
    status: 'queued',
    progress: 0,
    stage: 'Queued for processing',
    retryCount: 0,
    createdAt: now,
    updatedAt: now,
    etaSeconds: etaMap[input.mode] ?? 30,
    partialResultAvailable: false,
    exportReady: false,
    idempotencyKey: input.idempotencyKey,
  }

  // Persist to Supabase
  const sb = getSupabaseAdmin()
  if (sb) {
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
    await sb.from('research_jobs').insert(row).catch((e: Error) => console.error('[jobs] create failed:', e.message))
    await logEvent(jobId, 'job_created', undefined, 'queued', { mode: input.mode, query: input.query })
  }

  cacheSet(job)
  return job
}

// ─── READ ────────────────────────────────────────────────────────────────────
export async function getJob(jobId: string): Promise<ResearchJob | null> {
  // Check cache first
  const cached = cacheGet(jobId)
  if (cached) return cached

  // Read from Supabase (source of truth)
  const sb = getSupabaseAdmin()
  if (!sb) return null

  const { data, error } = await sb.from('research_jobs').select('*').eq('job_id', jobId).single()
  if (error || !data) return null

  const job = rowToJob(data)
  cacheSet(job)
  return job
}

// ─── UPDATE ──────────────────────────────────────────────────────────────────
export async function updateJob(jobId: string, updates: Partial<ResearchJob>): Promise<ResearchJob | null> {
  const sb = getSupabaseAdmin()
  const row = jobToRow({ jobId, ...updates })

  if (sb) {
    const { data, error } = await sb.from('research_jobs').update(row).eq('job_id', jobId).select().single()
    if (error) { console.error('[jobs] update failed:', error.message); return null }
    if (data) {
      const job = rowToJob(data)
      cacheSet(job)
      return job
    }
  }

  // Fallback: update cache only (degraded mode)
  const cached = cacheGet(jobId)
  if (cached) {
    const updated = { ...cached, ...updates, updatedAt: new Date().toISOString() }
    cacheSet(updated)
    return updated
  }
  return null
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

// ─── IDEMPOTENCY CHECK ───────────────────────────────────────────────────────
export async function findByIdempotencyKey(key: string): Promise<ResearchJob | null> {
  const sb = getSupabaseAdmin()
  if (!sb) return null

  const { data } = await sb.from('research_jobs').select('*').eq('idempotency_key', key).order('created_at', { ascending: false }).limit(1).single()
  if (!data) return null
  return rowToJob(data)
}

// ─── WORKER LOCKING ──────────────────────────────────────────────────────────
export async function acquireWorkerLock(jobId: string, ttlSeconds = 65): Promise<string | null> {
  const sb = getSupabaseAdmin()
  if (!sb) return generateWorkerId() // Degraded mode: no locking

  const workerId = generateWorkerId()
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString()

  // Atomic lock: only succeeds if no active lock exists
  const { data, error } = await sb
    .from('research_jobs')
    .update({ worker_lock_id: workerId, worker_lock_expires_at: expiresAt })
    .eq('job_id', jobId)
    .or(`worker_lock_id.is.null,worker_lock_expires_at.lt.${new Date().toISOString()}`)
    .select('job_id')
    .single()

  if (error || !data) return null // Lock not acquired
  return workerId
}

export async function releaseWorkerLock(jobId: string, workerId: string): Promise<void> {
  const sb = getSupabaseAdmin()
  if (!sb) return

  await sb.from('research_jobs')
    .update({ worker_lock_id: null, worker_lock_expires_at: null })
    .eq('job_id', jobId)
    .eq('worker_lock_id', workerId)
}

// ─── STALE JOB DETECTION ─────────────────────────────────────────────────────
export async function detectStaleJobs(): Promise<ResearchJob[]> {
  const sb = getSupabaseAdmin()
  if (!sb) return []

  const { data } = await sb
    .from('research_jobs')
    .select('*')
    .in('status', ['evidence_synthesis', 'report_composition', 'contradiction_audit', 'retrying'])
    .lt('worker_lock_expires_at', new Date().toISOString())

  return (data ?? []).map(rowToJob)
}

// ─── PARTIAL RESULT SAVE ─────────────────────────────────────────────────────
export async function savePartialResult(jobId: string, stage: string, partialData: unknown): Promise<void> {
  const sb = getSupabaseAdmin()
  if (!sb) return

  await sb.from('research_job_partial_results').insert({
    job_id: jobId,
    stage,
    partial_data: partialData,
  }).catch((e: Error) => console.error('[jobs] partial save failed:', e.message))

  await updateJob(jobId, { partialResultAvailable: true })
}

export async function getPartialResults(jobId: string): Promise<unknown[]> {
  const sb = getSupabaseAdmin()
  if (!sb) return []

  const { data } = await sb
    .from('research_job_partial_results')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })

  return data ?? []
}

// ─── EVENT LOGGING (audit trail) ─────────────────────────────────────────────
async function logEvent(jobId: string, eventType: string, prevStatus?: string, nextStatus?: string, payload?: unknown): Promise<void> {
  const sb = getSupabaseAdmin()
  if (!sb) return

  await sb.from('research_job_events').insert({
    job_id: jobId,
    event_type: eventType,
    previous_status: prevStatus ?? null,
    next_status: nextStatus ?? null,
    event_payload: payload ?? {},
  }).catch((e: Error) => console.error('[jobs] event log failed:', e.message))
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
