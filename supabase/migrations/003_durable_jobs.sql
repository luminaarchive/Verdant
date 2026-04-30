-- ═══════════════════════════════════════════════════════════════════
-- VerdantAI Durable Job System — Supabase Migration
-- Run this in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- 1. Research Jobs (source of truth for all async processing)
CREATE TABLE IF NOT EXISTS research_jobs (
  job_id          TEXT PRIMARY KEY,
  run_id          TEXT NOT NULL,
  query           TEXT NOT NULL,
  normalized_query TEXT,
  mode            TEXT NOT NULL CHECK (mode IN ('focus', 'deep', 'analytica')),
  preset_id       TEXT,
  status          TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
    'queued', 'source_collection', 'evidence_synthesis', 'contradiction_audit',
    'report_composition', 'quality_audit', 'generating_exports', 'finalizing',
    'ready', 'failed', 'retrying', 'cancelled', 'partial'
  )),
  progress        INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  stage           TEXT NOT NULL DEFAULT 'Queued for processing',
  provider_source TEXT,
  retry_count     INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at      TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  failed_at       TIMESTAMPTZ,
  stale_at        TIMESTAMPTZ,
  eta_seconds     INTEGER DEFAULT 30,
  error_reason    TEXT,
  partial_result_available BOOLEAN NOT NULL DEFAULT false,
  export_ready    BOOLEAN NOT NULL DEFAULT false,
  export_status   TEXT DEFAULT 'pending',
  confidence_score INTEGER,
  source_count    INTEGER,
  evidence_count  INTEGER,
  result_data     JSONB,
  worker_lock_id  TEXT,
  worker_lock_expires_at TIMESTAMPTZ,
  resume_token    TEXT,
  idempotency_key TEXT
);

CREATE INDEX IF NOT EXISTS idx_research_jobs_status ON research_jobs(status);
CREATE INDEX IF NOT EXISTS idx_research_jobs_created ON research_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_jobs_idempotency ON research_jobs(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_research_jobs_stale ON research_jobs(status, worker_lock_expires_at) WHERE status IN ('evidence_synthesis', 'report_composition', 'retrying');

-- 2. Research Job Events (full audit trail)
CREATE TABLE IF NOT EXISTS research_job_events (
  event_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          TEXT NOT NULL REFERENCES research_jobs(job_id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL,
  previous_status TEXT,
  next_status     TEXT,
  event_payload   JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_events_job ON research_job_events(job_id, created_at DESC);

-- 3. Research Job Partial Results (durable partial saves)
CREATE TABLE IF NOT EXISTS research_job_partial_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          TEXT NOT NULL REFERENCES research_jobs(job_id) ON DELETE CASCADE,
  stage           TEXT NOT NULL,
  partial_data    JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partial_results_job ON research_job_partial_results(job_id, created_at DESC);

-- 4. Auto-update updated_at on research_jobs
CREATE OR REPLACE FUNCTION update_research_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_research_jobs_updated ON research_jobs;
CREATE TRIGGER trg_research_jobs_updated
  BEFORE UPDATE ON research_jobs
  FOR EACH ROW EXECUTE FUNCTION update_research_jobs_updated_at();

-- 5. Stale job detection function
CREATE OR REPLACE FUNCTION detect_stale_jobs(stale_threshold_minutes INTEGER DEFAULT 5)
RETURNS SETOF research_jobs AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM research_jobs
  WHERE status IN ('evidence_synthesis', 'report_composition', 'contradiction_audit', 'quality_audit', 'generating_exports', 'retrying')
    AND (
      worker_lock_expires_at IS NOT NULL AND worker_lock_expires_at < now()
      OR
      updated_at < now() - (stale_threshold_minutes || ' minutes')::interval
    );
END;
$$ LANGUAGE plpgsql;
