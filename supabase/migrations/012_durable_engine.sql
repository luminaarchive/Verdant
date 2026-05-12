-- ═══════════════════════════════════════════════════════════════════
-- NaLIAI Durable Research Engine — Schema Migration
-- Run in Supabase SQL Editor. Additive only, zero downtime.
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. Extend research_jobs for durable engine ─────────────────────────────

ALTER TABLE research_jobs
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS current_stage TEXT DEFAULT 'queued',
  ADD COLUMN IF NOT EXISTS checkpoint JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS token_budget INTEGER DEFAULT 10000,
  ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS enrichment_tasks JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS parent_job_id TEXT REFERENCES research_jobs(job_id),
  ADD COLUMN IF NOT EXISTS topic_tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS execution_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dead_letter BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS dead_letter_reason TEXT,
  ADD COLUMN IF NOT EXISTS dead_letter_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stage_retries JSONB DEFAULT '{}';

-- Idempotency index for active jobs (prevents double-submit)
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_idempotency_active
  ON research_jobs(idempotency_key)
  WHERE status NOT IN ('failed', 'cancelled', 'ready')
    AND idempotency_key IS NOT NULL;

-- Priority queue index
CREATE INDEX IF NOT EXISTS idx_jobs_queue
  ON research_jobs(priority DESC, created_at ASC)
  WHERE status = 'queued';

-- User's jobs index
CREATE INDEX IF NOT EXISTS idx_jobs_user
  ON research_jobs(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- Dead-letter index
CREATE INDEX IF NOT EXISTS idx_jobs_dead_letter
  ON research_jobs(dead_letter, dead_letter_at DESC)
  WHERE dead_letter = true;

-- Parent job index (for enrichment sub-jobs)
CREATE INDEX IF NOT EXISTS idx_jobs_parent
  ON research_jobs(parent_job_id)
  WHERE parent_job_id IS NOT NULL;

-- ─── 2. Research Enrichments ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS research_enrichments (
  enrichment_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          TEXT NOT NULL REFERENCES research_jobs(job_id) ON DELETE CASCADE,
  enrichment_type TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  priority        INTEGER DEFAULT 5,
  input_data      JSONB DEFAULT '{}',
  output_data     JSONB DEFAULT '{}',
  tokens_used     INTEGER DEFAULT 0,
  retry_count     INTEGER DEFAULT 0,
  max_retries     INTEGER DEFAULT 1,
  error_message   TEXT,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_enrichments_job ON research_enrichments(job_id);
CREATE INDEX IF NOT EXISTS idx_enrichments_pending ON research_enrichments(status, priority DESC)
  WHERE status = 'pending';

-- ─── 3. Research Events (unified event bus persistence) ──────────────────────

CREATE TABLE IF NOT EXISTS research_events (
  event_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      TEXT REFERENCES research_jobs(job_id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL,
  source      TEXT NOT NULL DEFAULT 'system',
  payload     JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_job ON research_events(job_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_type ON research_events(event_type, created_at DESC);

-- ─── 4. Research Memory ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS research_memory (
  memory_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES auth.users(id),
  job_id            TEXT REFERENCES research_jobs(job_id),
  topic             TEXT NOT NULL,
  related_topics    TEXT[] DEFAULT '{}',
  key_findings      JSONB DEFAULT '[]',
  confidence_trend  JSONB DEFAULT '[]',
  last_researched_at TIMESTAMPTZ DEFAULT now(),
  research_count    INTEGER DEFAULT 1,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memory_user ON research_memory(user_id, last_researched_at DESC);
CREATE INDEX IF NOT EXISTS idx_memory_topic ON research_memory(topic);

-- ─── 5. RLS Policies ────────────────────────────────────────────────────────

-- research_jobs: users see own jobs only
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'jobs_select_own' AND tablename = 'research_jobs') THEN
    ALTER TABLE research_jobs ENABLE ROW LEVEL SECURITY;
    CREATE POLICY jobs_select_own ON research_jobs
      FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
  END IF;
END $$;

-- research_enrichments
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'enrichments_select_own' AND tablename = 'research_enrichments') THEN
    ALTER TABLE research_enrichments ENABLE ROW LEVEL SECURITY;
    CREATE POLICY enrichments_select_own ON research_enrichments
      FOR SELECT USING (
        job_id IN (SELECT job_id FROM research_jobs WHERE user_id = auth.uid() OR user_id IS NULL)
      );
  END IF;
END $$;

-- research_events
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'events_select_own' AND tablename = 'research_events') THEN
    ALTER TABLE research_events ENABLE ROW LEVEL SECURITY;
    CREATE POLICY events_select_own ON research_events
      FOR SELECT USING (
        job_id IN (SELECT job_id FROM research_jobs WHERE user_id = auth.uid() OR user_id IS NULL)
      );
  END IF;
END $$;

-- research_memory
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'memory_select_own' AND tablename = 'research_memory') THEN
    ALTER TABLE research_memory ENABLE ROW LEVEL SECURITY;
    CREATE POLICY memory_select_own ON research_memory
      FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY memory_delete_own ON research_memory
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
