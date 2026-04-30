// ─── Async Research Job System ───────────────────────────────────────────────
// Stage-based polling architecture for serverless async processing.
// Each poll advances the job one stage, so each stage fits within 60s.
// Focus/Deep: sync (single stage). Analytica: multi-stage async.

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

export interface ResearchJob {
  jobId: string
  runId: string
  query: string
  mode: 'focus' | 'deep' | 'analytica'
  presetId?: string
  status: JobStage
  progress: number          // 0-100
  stage: string             // human-readable label
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
  confidenceScore?: number
  sourceCount?: number
  evidenceCount?: number
  // Result data (stored when complete)
  result?: unknown
  partialResult?: unknown
}

// ─── In-memory job store with TTL ────────────────────────────────────────────
// Works across warm Vercel instances. Jobs expire after 2 hours.
const JOB_TTL_MS = 2 * 60 * 60 * 1000
const jobs = new Map<string, { job: ResearchJob; expiresAt: number }>()

function cleanup() {
  const now = Date.now()
  for (const [id, entry] of jobs) {
    if (now > entry.expiresAt) jobs.delete(id)
  }
}

export function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function createJob(input: {
  query: string
  mode: 'focus' | 'deep' | 'analytica'
  presetId?: string
  runId: string
}): ResearchJob {
  cleanup()
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
  }

  jobs.set(jobId, { job, expiresAt: Date.now() + JOB_TTL_MS })
  return job
}

export function getJob(jobId: string): ResearchJob | null {
  cleanup()
  const entry = jobs.get(jobId)
  return entry?.job ?? null
}

export function updateJob(jobId: string, updates: Partial<ResearchJob>): ResearchJob | null {
  const entry = jobs.get(jobId)
  if (!entry) return null
  entry.job = { ...entry.job, ...updates, updatedAt: new Date().toISOString() }
  entry.expiresAt = Date.now() + JOB_TTL_MS
  return entry.job
}

export function completeJob(jobId: string, result: unknown, extras: Partial<ResearchJob> = {}): ResearchJob | null {
  return updateJob(jobId, {
    status: 'ready',
    progress: 100,
    stage: 'Intelligence report ready',
    completedAt: new Date().toISOString(),
    result,
    partialResultAvailable: true,
    ...extras,
  })
}

export function failJob(jobId: string, errorReason: string, partialResult?: unknown): ResearchJob | null {
  return updateJob(jobId, {
    status: 'failed',
    stage: 'Analysis failed',
    failedAt: new Date().toISOString(),
    errorReason,
    partialResult,
    partialResultAvailable: !!partialResult,
  })
}

// ─── Stage progression for Analytica ─────────────────────────────────────────
const ANALYTICA_STAGES: { stage: JobStage; label: string; progress: number }[] = [
  { stage: 'queued',               label: 'Queued for processing',              progress: 0 },
  { stage: 'source_collection',    label: 'Collecting environmental sources',   progress: 10 },
  { stage: 'evidence_synthesis',   label: 'Synthesizing evidence & findings',   progress: 30 },
  { stage: 'contradiction_audit',  label: 'Auditing contradictions',            progress: 55 },
  { stage: 'report_composition',   label: 'Composing intelligence report',      progress: 70 },
  { stage: 'quality_audit',        label: 'Running quality audit',              progress: 85 },
  { stage: 'finalizing',           label: 'Finalizing report',                  progress: 95 },
  { stage: 'ready',                label: 'Intelligence report ready',          progress: 100 },
]

export function getNextStage(currentStage: JobStage): { stage: JobStage; label: string; progress: number } | null {
  const idx = ANALYTICA_STAGES.findIndex(s => s.stage === currentStage)
  if (idx === -1 || idx >= ANALYTICA_STAGES.length - 1) return null
  return ANALYTICA_STAGES[idx + 1]
}

export function getStageInfo(stage: JobStage): { label: string; progress: number } {
  return ANALYTICA_STAGES.find(s => s.stage === stage) ?? { label: stage, progress: 0 }
}

// ─── Job status summary for API responses ────────────────────────────────────
export function getJobStatus(jobId: string): {
  found: boolean
  jobId: string
  status: JobStage
  progress: number
  stage: string
  etaSeconds: number
  ready: boolean
  failed: boolean
  exportReady: boolean
  partialResultAvailable: boolean
  confidenceScore?: number
  sourceCount?: number
  evidenceCount?: number
  errorReason?: string
  createdAt?: string
  completedAt?: string
} {
  const job = getJob(jobId)
  if (!job) return { found: false, jobId, status: 'failed', progress: 0, stage: 'Job not found', etaSeconds: 0, ready: false, failed: true, exportReady: false, partialResultAvailable: false, errorReason: 'Job not found or expired' }

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
