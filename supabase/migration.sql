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
-- AUTH & USER PROFILES
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Auto-create profile on signup ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── User Profiles ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name        TEXT,
  subscription_tier   TEXT DEFAULT 'seeds',
  research_count      INTEGER DEFAULT 0,
  streak_days         INTEGER DEFAULT 0,
  streak_last_date    DATE,
  tree_stage          TEXT DEFAULT 'seedling',
  email_notifications BOOLEAN DEFAULT false,
  joined_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Add user_id to existing tables ─────────────────────────────────────────
ALTER TABLE research_runs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- ─── Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_research_runs_user_id ON research_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);

-- ─── RLS Policies ───────────────────────────────────────────────────────────
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for idempotent reruns
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own runs" ON research_runs;
DROP POLICY IF EXISTS "Users can insert own runs" ON research_runs;
DROP POLICY IF EXISTS "Service role full access runs" ON research_runs;
DROP POLICY IF EXISTS "Users can view own journal" ON journal_entries;
DROP POLICY IF EXISTS "Users can insert own journal" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete own journal" ON journal_entries;
DROP POLICY IF EXISTS "Service role full access journal" ON journal_entries;

-- user_profiles: users can read/write their own row
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- research_runs: users can read/write their own rows, service_role bypasses
CREATE POLICY "Users can view own runs"
  ON research_runs FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can insert own runs"
  ON research_runs FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- journal_entries: users can read/write their own rows
CREATE POLICY "Users can view own journal"
  ON journal_entries FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can insert own journal"
  ON journal_entries FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can delete own journal"
  ON journal_entries FOR DELETE
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Allow service_role full access (for API routes)
CREATE POLICY "Service role full access profiles"
  ON user_profiles FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access runs"
  ON research_runs FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access journal"
  ON journal_entries FOR ALL
  USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════
-- DONE. All tables and policies created.
-- ═══════════════════════════════════════════════════════════════════════════
