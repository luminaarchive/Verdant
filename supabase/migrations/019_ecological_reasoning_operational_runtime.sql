-- NaLI Migration: Ecological reasoning operational runtime persistence

ALTER TABLE public.observations
  ADD COLUMN IF NOT EXISTS reasoning_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS signal_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS reasoning_trace_id UUID,
  ADD COLUMN IF NOT EXISTS conservation_priority_score NUMERIC(4, 3),
  ADD COLUMN IF NOT EXISTS conservation_priority_category TEXT CHECK (
    conservation_priority_category IS NULL OR conservation_priority_category IN (
      'High Conservation Attention',
      'Elevated Ecological Significance',
      'Routine Observation'
    )
  );

ALTER TABLE public.orchestrator_runs
  ADD COLUMN IF NOT EXISTS reasoning_trace_id UUID,
  ADD COLUMN IF NOT EXISTS conservation_priority_score NUMERIC(4, 3),
  ADD COLUMN IF NOT EXISTS review_recommendation TEXT CHECK (
    review_recommendation IS NULL OR review_recommendation IN (
      'automatic_review_required',
      'expert_validation_recommended',
      'routine_archive_safe'
    )
  );

ALTER TABLE public.analysis_runs
  ADD COLUMN IF NOT EXISTS reasoning_trace_id UUID;

ALTER TABLE public.observation_events
  ADD COLUMN IF NOT EXISTS reasoning_trace_id UUID;

CREATE TABLE IF NOT EXISTS public.field_cases (
  id TEXT PRIMARY KEY,
  observation_id UUID NOT NULL REFERENCES public.observations(id) ON DELETE CASCADE,
  reasoning_trace_id UUID NOT NULL,
  case_type TEXT NOT NULL CHECK (
    case_type IN (
      'possible_poaching_indicator',
      'migration_anomaly',
      'habitat_degradation_signal',
      'endangered_species_escalation',
      'repeated_anomaly_cluster'
    )
  ),
  status TEXT NOT NULL CHECK (
    status IN ('open', 'triage', 'assigned', 'escalated', 'resolved', 'archived')
  ),
  priority_score NUMERIC(4, 3) NOT NULL,
  linked_observation_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  linked_ecological_patterns JSONB NOT NULL DEFAULT '[]'::jsonb,
  linked_anomaly_cluster_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  migration_grouping_id TEXT,
  reviewer_assignment_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  operational_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.field_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Field cases viewable by authenticated users"
  ON public.field_cases FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create field cases"
  ON public.field_cases FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update field cases"
  ON public.field_cases FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_observations_reasoning_trace_id
  ON public.observations(reasoning_trace_id);

CREATE INDEX IF NOT EXISTS idx_observation_events_reasoning_trace_id
  ON public.observation_events(reasoning_trace_id);

CREATE INDEX IF NOT EXISTS idx_field_cases_observation_id
  ON public.field_cases(observation_id);

CREATE INDEX IF NOT EXISTS idx_field_cases_reasoning_trace_id
  ON public.field_cases(reasoning_trace_id);
