-- ═══════════════════════════════════════════════════════════════════════════
-- Phase 8 & 8.5 — Reputation & Institutional Verification System
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Public Profiles ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public_profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT UNIQUE NOT NULL,
  domain_focus    TEXT,
  bio             TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. User Reputation Scores ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_reputation_scores (
  user_id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_score     INTEGER DEFAULT 0,
  tier            TEXT DEFAULT 'Emerging Researcher',
  source_integrity_score INTEGER DEFAULT 0,
  contradiction_handling_score INTEGER DEFAULT 0,
  evidence_strength_score INTEGER DEFAULT 0,
  consistency_score INTEGER DEFAULT 0,
  domain_expertise_score INTEGER DEFAULT 0,
  report_usefulness_score INTEGER DEFAULT 0,
  strongest_domain TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. Verification Requests ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS verification_requests (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution     TEXT NOT NULL,
  role            TEXT NOT NULL,
  evidence_url    TEXT,
  website_url     TEXT,
  linkedin_url    TEXT,
  domain_expertise TEXT,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under review', 'verified', 'rejected')),
  reviewer_id     UUID REFERENCES auth.users(id),
  admin_notes     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. Report Reputation Events ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS report_reputation_events (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  run_id          TEXT NOT NULL REFERENCES research_runs(run_id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL,
  score_delta     INTEGER NOT NULL,
  reason          TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. Authority Signal Events ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS authority_signal_events (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_message  TEXT NOT NULL,
  is_read         BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 6. Public Reports ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public_reports (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  run_id          TEXT NOT NULL REFERENCES research_runs(run_id) ON DELETE CASCADE,
  slug            TEXT UNIQUE NOT NULL,
  is_published    BOOLEAN DEFAULT true,
  published_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 7. Report Versions ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS report_versions (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  run_id          TEXT NOT NULL REFERENCES research_runs(run_id) ON DELETE CASCADE,
  version_number  INTEGER NOT NULL,
  content_snapshot JSONB NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RLS Policies ───────────────────────────────────────────────────────────

-- Enable RLS
ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reputation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_reputation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE authority_signal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_versions ENABLE ROW LEVEL SECURITY;

-- Public Profiles (Viewable by everyone, editable by owner)
CREATE POLICY "Public profiles are viewable by everyone" ON public_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own public profile" ON public_profiles FOR ALL USING (auth.uid() = id);

-- Reputation Scores (Viewable by everyone, only updated by server/service role)
CREATE POLICY "Reputation scores are viewable by everyone" ON user_reputation_scores FOR SELECT USING (true);
CREATE POLICY "Service role full access reputation" ON user_reputation_scores FOR ALL USING (auth.role() = 'service_role');

-- Verification Requests (Viewable/insertable by owner, fully accessible by admins/service)
CREATE POLICY "Users can view own verification requests" ON verification_requests FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own verification requests" ON verification_requests FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Service role full access verifications" ON verification_requests FOR ALL USING (auth.role() = 'service_role');

-- Report Reputation Events (Service role only usually, maybe user view)
CREATE POLICY "Users can view own reputation events" ON report_reputation_events FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Service role full access events" ON report_reputation_events FOR ALL USING (auth.role() = 'service_role');

-- Authority Signal Events
CREATE POLICY "Users can view own authority signals" ON authority_signal_events FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Service role full access signals" ON authority_signal_events FOR ALL USING (auth.role() = 'service_role');

-- Public Reports (Viewable by everyone if published)
CREATE POLICY "Public reports are viewable by everyone" ON public_reports FOR SELECT USING (is_published = true);
CREATE POLICY "Users can manage own public reports" ON public_reports FOR ALL USING (user_id = auth.uid());

-- Report Versions (Owner only)
CREATE POLICY "Users can view own report versions" ON report_versions FOR SELECT USING (EXISTS (SELECT 1 FROM research_runs rr WHERE rr.run_id = report_versions.run_id AND rr.user_id = auth.uid()));
CREATE POLICY "Service role full access versions" ON report_versions FOR ALL USING (auth.role() = 'service_role');
