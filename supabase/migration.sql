-- ═══════════════════════════════════════════════════════════════════════════
-- VerdantAI — Supabase Migration
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Research Runs ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS research_runs (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  run_id          TEXT UNIQUE NOT NULL,
  query           TEXT NOT NULL,
  mode            TEXT NOT NULL DEFAULT 'focus',
  status          TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'ready', 'failed')),
  pipeline_source TEXT DEFAULT 'gemini-direct',
  confidence_score INTEGER,
  duration_ms     INTEGER,
  cost_usd        NUMERIC(10, 6),
  error_message   TEXT,
  request_id      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_research_runs_created_at ON research_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_runs_run_id ON research_runs(run_id);
CREATE INDEX IF NOT EXISTS idx_research_runs_status ON research_runs(status);

-- ─── Research Results ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS research_results (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  run_id              TEXT UNIQUE NOT NULL REFERENCES research_runs(run_id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  executive_summary   TEXT,
  findings            JSONB DEFAULT '[]'::JSONB,
  outline             JSONB DEFAULT '[]'::JSONB,
  stats               JSONB DEFAULT '[]'::JSONB,
  sources             JSONB DEFAULT '[]'::JSONB,
  discussion_starters JSONB DEFAULT '[]'::JSONB,
  evidence_items      JSONB DEFAULT '[]'::JSONB,
  uncertainty_notes   JSONB DEFAULT '[]'::JSONB,
  raw_json            TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_results_run_id ON research_results(run_id);

-- ─── Generated Files ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS generated_files (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  run_id      TEXT NOT NULL REFERENCES research_runs(run_id) ON DELETE CASCADE,
  file_type   TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx', 'html')),
  file_url    TEXT NOT NULL,
  file_size   INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_generated_files_run_id ON generated_files(run_id);

-- ─── Journal Entries ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS journal_entries (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  query       TEXT NOT NULL,
  title       TEXT NOT NULL,
  summary     TEXT,
  run_id      TEXT REFERENCES research_runs(run_id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at DESC);

-- ─── Feedback Entries ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback_entries (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  run_id      TEXT NOT NULL REFERENCES research_runs(run_id) ON DELETE CASCADE,
  rating      TEXT NOT NULL CHECK (rating IN ('positive', 'negative')),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_entries_run_id ON feedback_entries(run_id);

-- ─── Share Tokens ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS share_tokens (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  run_id      TEXT NOT NULL REFERENCES research_runs(run_id) ON DELETE CASCADE,
  token       TEXT UNIQUE NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_share_tokens_token ON share_tokens(token);
CREATE INDEX IF NOT EXISTS idx_share_tokens_expires_at ON share_tokens(expires_at);

-- ─── Failure Logs ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS failure_logs (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  run_id       TEXT REFERENCES research_runs(run_id) ON DELETE SET NULL,
  request_id   TEXT,
  failed_step  TEXT NOT NULL,
  error_message TEXT NOT NULL,
  retry_count  INTEGER DEFAULT 0,
  metadata     JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_failure_logs_run_id ON failure_logs(run_id);
CREATE INDEX IF NOT EXISTS idx_failure_logs_created_at ON failure_logs(created_at DESC);

-- ─── Create Supabase Storage Bucket for Generated Files ─────────────────────
-- Run this separately in the Supabase Storage dashboard or via:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', true);

-- ═══════════════════════════════════════════════════════════════════════════
-- DONE. All tables created.
-- Next: configure RLS policies if auth is enabled, or leave open for service_role access.
-- ═══════════════════════════════════════════════════════════════════════════
