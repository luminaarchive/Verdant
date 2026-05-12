-- EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABLE 1: users (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('ranger', 'researcher', 'student')),
  institution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 2: species_reference (canonical, no RLS needed - public read)
CREATE TABLE public.species_reference (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  gbif_taxon_key BIGINT UNIQUE,
  iucn_id TEXT,
  scientific_name TEXT NOT NULL,
  common_name_id TEXT,
  common_name_en TEXT,
  family TEXT,
  "order" TEXT,
  class TEXT,
  is_endemic_indonesia BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 3: species_cache (timestamped API results)
CREATE TABLE public.species_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  species_ref_id UUID REFERENCES public.species_reference(id),
  source TEXT NOT NULL CHECK (source IN ('gbif', 'iucn')),
  source_version TEXT NOT NULL,
  conservation_status TEXT CHECK (conservation_status IN ('EX','EW','CR','EN','VU','NT','LC','DD','NE')),
  distribution_geojson JSONB,
  threats JSONB DEFAULT '[]',
  population_trend TEXT CHECK (population_trend IN ('increasing','decreasing','stable','unknown')),
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ttl_expires_at TIMESTAMPTZ NOT NULL
);

-- TABLE 4: observations (final results only)
CREATE TABLE public.observations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  accuracy_meters DECIMAL(8,2),
  photo_storage_url TEXT,
  photo_checksum TEXT,
  audio_storage_url TEXT,
  audio_checksum TEXT,
  text_description TEXT,
  final_species_ref_id UUID REFERENCES public.species_reference(id),
  confidence_level DECIMAL(5,4) CHECK (confidence_level BETWEEN 0 AND 1),
  is_anomaly BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','identified','review_needed')),
  review_status TEXT NOT NULL DEFAULT 'unreviewed' CHECK (review_status IN ('unreviewed','verified','rejected')),
  verified_by_human BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES public.users(id),
  qa_flag BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 5: analysis_runs (inference trace per observation)
CREATE TABLE public.analysis_runs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  observation_id UUID REFERENCES public.observations(id) ON DELETE CASCADE NOT NULL,
  model_name TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  tool_used TEXT NOT NULL CHECK (tool_used IN ('vision','audio','gbif','iucn','anomaly')),
  candidate_species JSONB DEFAULT '[]',
  score_per_tool JSONB DEFAULT '{}',
  latency_ms INTEGER,
  retry_count INTEGER DEFAULT 0,
  error TEXT,
  raw_output JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 6: offline_queue
CREATE TABLE public.offline_queue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  local_temp_id TEXT NOT NULL,
  photo_storage_ref TEXT,
  audio_storage_ref TEXT,
  text_description TEXT,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  accuracy_meters DECIMAL(8,2),
  queued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','syncing','done','failed'))
);

-- TABLE 7: audit_logs
CREATE TABLE public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: Enable on all private tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES: users
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS POLICIES: observations
CREATE POLICY "observations_select_own" ON public.observations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "observations_insert_own" ON public.observations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "observations_update_own" ON public.observations
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS POLICIES: analysis_runs (via observation ownership)
CREATE POLICY "analysis_runs_select_own" ON public.analysis_runs
  FOR SELECT USING (
    observation_id IN (
      SELECT id FROM public.observations WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "analysis_runs_insert_own" ON public.analysis_runs
  FOR INSERT WITH CHECK (
    observation_id IN (
      SELECT id FROM public.observations WHERE user_id = auth.uid()
    )
  );

-- RLS POLICIES: offline_queue
CREATE POLICY "offline_queue_all_own" ON public.offline_queue
  FOR ALL USING (auth.uid() = user_id);

-- RLS POLICIES: audit_logs (insert only, no select for users)
CREATE POLICY "audit_logs_insert_own" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- INDEXES for performance
CREATE INDEX idx_observations_user_id ON public.observations(user_id);
CREATE INDEX idx_observations_status ON public.observations(status);
CREATE INDEX idx_observations_timestamp ON public.observations(timestamp DESC);
CREATE INDEX idx_analysis_runs_observation_id ON public.analysis_runs(observation_id);
CREATE INDEX idx_offline_queue_user_status ON public.offline_queue(user_id, status);
CREATE INDEX idx_species_cache_ttl ON public.species_cache(ttl_expires_at);

-- AUTO-UPDATE updated_at for species_reference
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER species_reference_updated_at
  BEFORE UPDATE ON public.species_reference
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- AUTO-CREATE user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
