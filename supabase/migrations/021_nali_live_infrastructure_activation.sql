-- NaLI live infrastructure activation
-- Additive migration for confirmed production target. Does not delete legacy data.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('ranger', 'researcher', 'student')),
  institution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.species_reference (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gbif_taxon_key BIGINT UNIQUE,
  iucn_id TEXT,
  scientific_name TEXT NOT NULL UNIQUE,
  common_name_id TEXT,
  common_name_en TEXT,
  family TEXT,
  "order" TEXT,
  order_name TEXT,
  class TEXT,
  class_name TEXT,
  iucn_status TEXT,
  is_endemic_indonesia BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.species_reference
  ADD COLUMN IF NOT EXISTS gbif_taxon_key BIGINT,
  ADD COLUMN IF NOT EXISTS iucn_id TEXT,
  ADD COLUMN IF NOT EXISTS common_name_id TEXT,
  ADD COLUMN IF NOT EXISTS common_name_en TEXT,
  ADD COLUMN IF NOT EXISTS family TEXT,
  ADD COLUMN IF NOT EXISTS "order" TEXT,
  ADD COLUMN IF NOT EXISTS order_name TEXT,
  ADD COLUMN IF NOT EXISTS class TEXT,
  ADD COLUMN IF NOT EXISTS class_name TEXT,
  ADD COLUMN IF NOT EXISTS iucn_status TEXT,
  ADD COLUMN IF NOT EXISTS is_endemic_indonesia BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.species_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  species_ref_id UUID REFERENCES public.species_reference(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  source_version TEXT NOT NULL,
  conservation_status TEXT,
  distribution_geojson JSONB,
  threats JSONB NOT NULL DEFAULT '[]'::jsonb,
  population_trend TEXT,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ttl_expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS public.observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  accuracy_meters DOUBLE PRECISION,
  photo_storage_url TEXT,
  photo_checksum TEXT,
  audio_storage_url TEXT,
  audio_checksum TEXT,
  text_description TEXT,
  final_species_ref_id UUID REFERENCES public.species_reference(id),
  species_ref_id UUID REFERENCES public.species_reference(id),
  scientific_name TEXT,
  local_name TEXT,
  confidence_level DOUBLE PRECISION CHECK (confidence_level IS NULL OR confidence_level BETWEEN 0 AND 1),
  confidence_calibration JSONB NOT NULL DEFAULT '{}'::jsonb,
  conservation_status TEXT,
  conservation_priority_score NUMERIC(4, 3),
  conservation_priority_category TEXT,
  is_anomaly BOOLEAN NOT NULL DEFAULT FALSE,
  anomaly_flag BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending',
  observation_status TEXT NOT NULL DEFAULT 'pending',
  review_status TEXT NOT NULL DEFAULT 'unreviewed',
  processing_stage TEXT NOT NULL DEFAULT 'uploaded',
  verified_by_human BOOLEAN NOT NULL DEFAULT FALSE,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewer_id UUID REFERENCES auth.users(id),
  review_notes TEXT,
  review_confidence_delta DOUBLE PRECISION,
  qa_flag BOOLEAN NOT NULL DEFAULT FALSE,
  sync_state TEXT NOT NULL DEFAULT 'synced',
  reasoning_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  signal_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  reasoning_trace_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.observations
  ADD COLUMN IF NOT EXISTS timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS accuracy_meters DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS photo_storage_url TEXT,
  ADD COLUMN IF NOT EXISTS photo_checksum TEXT,
  ADD COLUMN IF NOT EXISTS audio_storage_url TEXT,
  ADD COLUMN IF NOT EXISTS audio_checksum TEXT,
  ADD COLUMN IF NOT EXISTS final_species_ref_id UUID REFERENCES public.species_reference(id),
  ADD COLUMN IF NOT EXISTS species_ref_id UUID REFERENCES public.species_reference(id),
  ADD COLUMN IF NOT EXISTS scientific_name TEXT,
  ADD COLUMN IF NOT EXISTS local_name TEXT,
  ADD COLUMN IF NOT EXISTS confidence_level DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS confidence_calibration JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS conservation_status TEXT,
  ADD COLUMN IF NOT EXISTS conservation_priority_score NUMERIC(4, 3),
  ADD COLUMN IF NOT EXISTS conservation_priority_category TEXT,
  ADD COLUMN IF NOT EXISTS is_anomaly BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS anomaly_flag BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS observation_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'unreviewed',
  ADD COLUMN IF NOT EXISTS processing_stage TEXT NOT NULL DEFAULT 'uploaded',
  ADD COLUMN IF NOT EXISTS verified_by_human BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS review_notes TEXT,
  ADD COLUMN IF NOT EXISTS review_confidence_delta DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS qa_flag BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sync_state TEXT NOT NULL DEFAULT 'synced',
  ADD COLUMN IF NOT EXISTS reasoning_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS signal_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS reasoning_trace_id UUID,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.observation_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID NOT NULL REFERENCES public.observations(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  checksum TEXT,
  captured_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analysis_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID NOT NULL REFERENCES public.observations(id) ON DELETE CASCADE,
  model_name TEXT,
  prompt_version TEXT,
  tool_used TEXT,
  tool_name TEXT,
  tool_version TEXT,
  reasoning_trace_id UUID,
  status TEXT,
  latency_ms INTEGER,
  retry_count INTEGER NOT NULL DEFAULT 0,
  fallback_used BOOLEAN NOT NULL DEFAULT FALSE,
  execution_order INTEGER,
  candidate_species JSONB NOT NULL DEFAULT '[]'::jsonb,
  score_per_tool JSONB NOT NULL DEFAULT '{}'::jsonb,
  score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw_output JSONB,
  error TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.analysis_runs
  ADD COLUMN IF NOT EXISTS model_name TEXT,
  ADD COLUMN IF NOT EXISTS prompt_version TEXT,
  ADD COLUMN IF NOT EXISTS tool_used TEXT,
  ADD COLUMN IF NOT EXISTS tool_name TEXT,
  ADD COLUMN IF NOT EXISTS tool_version TEXT,
  ADD COLUMN IF NOT EXISTS reasoning_trace_id UUID,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS latency_ms INTEGER,
  ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fallback_used BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS execution_order INTEGER,
  ADD COLUMN IF NOT EXISTS candidate_species JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS score_per_tool JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS raw_output JSONB,
  ADD COLUMN IF NOT EXISTS error TEXT,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.observation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID NOT NULL REFERENCES public.observations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  reasoning_trace_id UUID,
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orchestrator_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID NOT NULL REFERENCES public.observations(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'running',
  reasoning_trace_id UUID,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  total_latency_ms INTEGER,
  total_tools_executed INTEGER NOT NULL DEFAULT 0,
  final_confidence DOUBLE PRECISION,
  final_result_status TEXT,
  conservation_priority_score NUMERIC(4, 3),
  review_recommendation TEXT
);

CREATE TABLE IF NOT EXISTS public.field_cases (
  id TEXT PRIMARY KEY,
  observation_id UUID REFERENCES public.observations(id) ON DELETE CASCADE,
  reasoning_trace_id UUID,
  case_type TEXT,
  status TEXT NOT NULL DEFAULT 'monitoring',
  priority_score NUMERIC(4, 3),
  linked_observation_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  linked_ecological_patterns JSONB NOT NULL DEFAULT '[]'::jsonb,
  linked_anomaly_cluster_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  migration_grouping_id TEXT,
  reviewer_assignment_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  operational_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.observation_cases (
  observation_id UUID NOT NULL REFERENCES public.observations(id) ON DELETE CASCADE,
  case_id TEXT NOT NULL REFERENCES public.field_cases(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL DEFAULT 'linked',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (observation_id, case_id)
);

CREATE TABLE IF NOT EXISTS public.reviewer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  review_accuracy_score NUMERIC(4, 3) NOT NULL DEFAULT 0.5,
  reviewer_specialization JSONB NOT NULL DEFAULT '[]'::jsonb,
  reliability_weight NUMERIC(4, 3) NOT NULL DEFAULT 0.5,
  confidence_override_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.offline_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  local_temp_id TEXT,
  photo_storage_ref TEXT,
  audio_storage_ref TEXT,
  text_description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  accuracy_meters DOUBLE PRECISION,
  queued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'queued'
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ecological_memory_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID REFERENCES public.observations(id) ON DELETE CASCADE,
  reasoning_trace_id UUID,
  region_key TEXT NOT NULL,
  scientific_name TEXT,
  ecological_confidence NUMERIC(4, 3) NOT NULL,
  anomaly_score NUMERIC(4, 3) NOT NULL,
  conservation_priority_score NUMERIC(4, 3) NOT NULL,
  iucn_status TEXT,
  habitat_boundary TEXT,
  activity_pattern TEXT,
  reviewer_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  migration_alignment_score NUMERIC(4, 3),
  habitat_match_score NUMERIC(4, 3),
  observed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ecological_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_key TEXT NOT NULL,
  expected_species_density JSONB NOT NULL DEFAULT '{}'::jsonb,
  expected_seasonal_activity JSONB NOT NULL DEFAULT '{}'::jsonb,
  expected_migration_alignment NUMERIC(4, 3) NOT NULL DEFAULT 0.6,
  expected_habitat_consistency NUMERIC(4, 3) NOT NULL DEFAULT 0.55,
  sample_size INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.longitudinal_patterns (
  id TEXT PRIMARY KEY,
  region_key TEXT NOT NULL,
  pattern_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  confidence NUMERIC(4, 3) NOT NULL,
  observation_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  reasoning_trace_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  evidence_summary JSONB NOT NULL DEFAULT '[]'::jsonb,
  evidence_count INTEGER NOT NULL DEFAULT 0,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ecological_signal_graph_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  source_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  relationship TEXT NOT NULL,
  evidence_weight NUMERIC(4, 3) NOT NULL DEFAULT 0.5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ecological_alerts (
  id TEXT PRIMARY KEY,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  region_key TEXT NOT NULL,
  evidence_pattern_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  evidence_observation_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  operational_summary TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.confidence_evolution_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reasoning_trace_id UUID,
  observation_id UUID REFERENCES public.observations(id) ON DELETE SET NULL,
  base_confidence NUMERIC(4, 3) NOT NULL,
  evolved_confidence NUMERIC(4, 3) NOT NULL,
  drift NUMERIC(4, 3) NOT NULL,
  escalation_probability NUMERIC(4, 3) NOT NULL,
  reasoning JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reasoning_replay_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reasoning_trace_id TEXT NOT NULL,
  reasoning_version TEXT NOT NULL,
  provider_version TEXT NOT NULL,
  reviewer_override_count INTEGER NOT NULL DEFAULT 0,
  ecological_confidence NUMERIC(4, 3) NOT NULL,
  replay_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.species_reference ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.species_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observation_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orchestrator_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observation_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviewer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecological_memory_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecological_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.longitudinal_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecological_signal_graph_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecological_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confidence_evolution_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reasoning_replay_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Observations are viewable by everyone" ON public.observations;
DROP POLICY IF EXISTS "Observation media viewable by everyone" ON public.observation_media;
DROP POLICY IF EXISTS "Analysis runs viewable by everyone" ON public.analysis_runs;
DROP POLICY IF EXISTS "Observation events viewable by everyone" ON public.observation_events;
DROP POLICY IF EXISTS "Orchestrator runs viewable by everyone" ON public.orchestrator_runs;
DROP POLICY IF EXISTS "species_reference_public_read" ON public.species_reference;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "observations_select_own" ON public.observations;
DROP POLICY IF EXISTS "observations_insert_own" ON public.observations;
DROP POLICY IF EXISTS "observations_update_own" ON public.observations;
DROP POLICY IF EXISTS "observations_delete_own" ON public.observations;
DROP POLICY IF EXISTS "observation_media_select_own" ON public.observation_media;
DROP POLICY IF EXISTS "observation_media_insert_own" ON public.observation_media;
DROP POLICY IF EXISTS "analysis_runs_select_own" ON public.analysis_runs;
DROP POLICY IF EXISTS "observation_events_select_own" ON public.observation_events;
DROP POLICY IF EXISTS "offline_queue_own" ON public.offline_queue;
DROP POLICY IF EXISTS "reviewer_profiles_select_authenticated" ON public.reviewer_profiles;
DROP POLICY IF EXISTS "field_cases_select_authenticated" ON public.field_cases;
DROP POLICY IF EXISTS "observation_cases_select_authenticated" ON public.observation_cases;
DROP POLICY IF EXISTS "longitudinal_read_authenticated" ON public.longitudinal_patterns;
DROP POLICY IF EXISTS "ecological_alerts_read_authenticated" ON public.ecological_alerts;
DROP POLICY IF EXISTS "ecological_memory_read_authenticated" ON public.ecological_memory_entries;
DROP POLICY IF EXISTS "ecological_baselines_read_authenticated" ON public.ecological_baselines;
DROP POLICY IF EXISTS "signal_graph_read_authenticated" ON public.ecological_signal_graph_edges;
DROP POLICY IF EXISTS "confidence_evolution_read_authenticated" ON public.confidence_evolution_events;
DROP POLICY IF EXISTS "reasoning_replay_read_authenticated" ON public.reasoning_replay_records;

CREATE POLICY "species_reference_public_read" ON public.species_reference FOR SELECT USING (true);
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "observations_select_own" ON public.observations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "observations_insert_own" ON public.observations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "observations_update_own" ON public.observations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "observations_delete_own" ON public.observations FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "observation_media_select_own" ON public.observation_media FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.observations o WHERE o.id = observation_id AND o.user_id = auth.uid())
);
CREATE POLICY "observation_media_insert_own" ON public.observation_media FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.observations o WHERE o.id = observation_id AND o.user_id = auth.uid())
);
CREATE POLICY "analysis_runs_select_own" ON public.analysis_runs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.observations o WHERE o.id = observation_id AND o.user_id = auth.uid())
);
CREATE POLICY "observation_events_select_own" ON public.observation_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.observations o WHERE o.id = observation_id AND o.user_id = auth.uid())
);
CREATE POLICY "offline_queue_own" ON public.offline_queue FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviewer_profiles_select_authenticated" ON public.reviewer_profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "field_cases_select_authenticated" ON public.field_cases FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "observation_cases_select_authenticated" ON public.observation_cases FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "longitudinal_read_authenticated" ON public.longitudinal_patterns FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "ecological_alerts_read_authenticated" ON public.ecological_alerts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "ecological_memory_read_authenticated" ON public.ecological_memory_entries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "ecological_baselines_read_authenticated" ON public.ecological_baselines FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "signal_graph_read_authenticated" ON public.ecological_signal_graph_edges FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "confidence_evolution_read_authenticated" ON public.confidence_evolution_events FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "reasoning_replay_read_authenticated" ON public.reasoning_replay_records FOR SELECT USING (auth.role() = 'authenticated');

INSERT INTO storage.buckets (id, name, public)
VALUES ('observation_media', 'observation_media', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "nali_observation_media_upload_own_folder" ON storage.objects;
DROP POLICY IF EXISTS "nali_observation_media_read_own_folder" ON storage.objects;

CREATE POLICY "nali_observation_media_upload_own_folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'observation_media'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "nali_observation_media_read_own_folder" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'observation_media'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE INDEX IF NOT EXISTS idx_observations_user_created_at ON public.observations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_observations_reasoning_trace_id ON public.observations(reasoning_trace_id);
CREATE INDEX IF NOT EXISTS idx_observation_media_observation_id ON public.observation_media(observation_id);
CREATE INDEX IF NOT EXISTS idx_analysis_runs_observation_id ON public.analysis_runs(observation_id);
CREATE INDEX IF NOT EXISTS idx_observation_events_observation_id ON public.observation_events(observation_id);
CREATE INDEX IF NOT EXISTS idx_orchestrator_runs_observation_id ON public.orchestrator_runs(observation_id);
CREATE INDEX IF NOT EXISTS idx_field_cases_observation_id ON public.field_cases(observation_id);
CREATE INDEX IF NOT EXISTS idx_ecological_memory_region_time ON public.ecological_memory_entries(region_key, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_longitudinal_patterns_region ON public.longitudinal_patterns(region_key, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_ecological_alerts_region ON public.ecological_alerts(region_key, generated_at DESC);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, institution, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'student'),
    NULLIF(NEW.raw_user_meta_data->>'institution', ''),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
        role = COALESCE(EXCLUDED.role, public.users.role),
        institution = COALESCE(EXCLUDED.institution, public.users.institution),
        updated_at = NOW();

  IF to_regclass('public.user_profiles') IS NOT NULL THEN
    INSERT INTO public.user_profiles (id, display_name, organization, updated_at)
    VALUES (
      NEW.id,
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'display_name', ''), NULLIF(NEW.raw_user_meta_data->>'full_name', ''), split_part(NEW.email, '@', 1)),
      NULLIF(NEW.raw_user_meta_data->>'organization', ''),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
      SET display_name = COALESCE(EXCLUDED.display_name, public.user_profiles.display_name),
          organization = COALESCE(EXCLUDED.organization, public.user_profiles.organization),
          updated_at = NOW();
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.species_reference (scientific_name, common_name_en, common_name_id, is_endemic_indonesia)
VALUES
  ('Panthera tigris sumatrae', 'Sumatran Tiger', 'Harimau Sumatera', true),
  ('Pongo tapanuliensis', 'Tapanuli Orangutan', 'Orangutan Tapanuli', true),
  ('Pongo pygmaeus', 'Bornean Orangutan', 'Orangutan Kalimantan', true),
  ('Dicerorhinus sumatrensis', 'Sumatran Rhinoceros', 'Badak Sumatera', true),
  ('Nisaetus bartelsi', 'Javan Hawk-Eagle', 'Elang Jawa', true),
  ('Spizaetus bartelsi', 'Javan Hawk-Eagle', 'Elang Jawa', true),
  ('Varanus komodoensis', 'Komodo Dragon', 'Komodo', true),
  ('Leucopsar rothschildi', 'Bali Starling', 'Jalak Bali', true)
ON CONFLICT (scientific_name) DO UPDATE
SET common_name_en = EXCLUDED.common_name_en,
    common_name_id = EXCLUDED.common_name_id,
    is_endemic_indonesia = EXCLUDED.is_endemic_indonesia,
    updated_at = NOW();
