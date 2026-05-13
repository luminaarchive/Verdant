-- NaLI Migration: Longitudinal ecological intelligence and ecosystem monitoring runtime

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
  observed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ecological_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_key TEXT NOT NULL,
  expected_species_density JSONB NOT NULL DEFAULT '{}'::jsonb,
  expected_seasonal_activity JSONB NOT NULL DEFAULT '{}'::jsonb,
  expected_migration_alignment NUMERIC(4, 3) NOT NULL DEFAULT 0.6,
  expected_habitat_consistency NUMERIC(4, 3) NOT NULL DEFAULT 0.55,
  sample_size INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.longitudinal_patterns (
  id TEXT PRIMARY KEY,
  region_key TEXT NOT NULL,
  pattern_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'moderate', 'high', 'critical')),
  confidence NUMERIC(4, 3) NOT NULL,
  observation_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  reasoning_trace_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  evidence_summary JSONB NOT NULL DEFAULT '[]'::jsonb,
  evidence_count INTEGER NOT NULL DEFAULT 0,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ecological_signal_graph_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  source_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  relationship TEXT NOT NULL,
  evidence_weight NUMERIC(4, 3) NOT NULL DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ecological_alerts (
  id TEXT PRIMARY KEY,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'moderate', 'high', 'critical')),
  region_key TEXT NOT NULL,
  evidence_pattern_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  evidence_observation_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  operational_summary TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
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
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reasoning_replay_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reasoning_trace_id TEXT NOT NULL,
  reasoning_version TEXT NOT NULL,
  provider_version TEXT NOT NULL,
  reviewer_override_count INTEGER NOT NULL DEFAULT 0,
  ecological_confidence NUMERIC(4, 3) NOT NULL,
  replay_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ecological_memory_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecological_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.longitudinal_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecological_signal_graph_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecological_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confidence_evolution_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reasoning_replay_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read ecological memory entries"
  ON public.ecological_memory_entries FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read ecological baselines"
  ON public.ecological_baselines FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read longitudinal patterns"
  ON public.longitudinal_patterns FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read ecological signal graph edges"
  ON public.ecological_signal_graph_edges FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read ecological alerts"
  ON public.ecological_alerts FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read confidence evolution events"
  ON public.confidence_evolution_events FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read reasoning replay records"
  ON public.reasoning_replay_records FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can write ecological memory entries"
  ON public.ecological_memory_entries FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can write longitudinal patterns"
  ON public.longitudinal_patterns FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can write ecological alerts"
  ON public.ecological_alerts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_ecological_memory_region_time
  ON public.ecological_memory_entries(region_key, observed_at DESC);

CREATE INDEX IF NOT EXISTS idx_ecological_memory_species
  ON public.ecological_memory_entries(scientific_name);

CREATE INDEX IF NOT EXISTS idx_longitudinal_patterns_region
  ON public.longitudinal_patterns(region_key, detected_at DESC);

CREATE INDEX IF NOT EXISTS idx_ecological_alerts_region
  ON public.ecological_alerts(region_key, generated_at DESC);
