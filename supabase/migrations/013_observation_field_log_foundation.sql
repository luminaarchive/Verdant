-- Denormalized field-log columns for fast operational archive/detail screens.
-- These complement the normalized species_reference/species_cache relationship.
ALTER TABLE public.observations
  ADD COLUMN IF NOT EXISTS scientific_name TEXT,
  ADD COLUMN IF NOT EXISTS local_name TEXT,
  ADD COLUMN IF NOT EXISTS conservation_status TEXT CHECK (
    conservation_status IS NULL OR conservation_status IN ('EX','EW','CR','EN','VU','NT','LC','DD','NE')
  ),
  ADD COLUMN IF NOT EXISTS anomaly_flag BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sync_state TEXT NOT NULL DEFAULT 'synced' CHECK (
    sync_state IN ('pending_sync','synced','failed_sync')
  );

CREATE INDEX IF NOT EXISTS idx_observations_user_timestamp
  ON public.observations(user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_observations_user_review_status
  ON public.observations(user_id, review_status);

CREATE INDEX IF NOT EXISTS idx_observations_user_conservation_status
  ON public.observations(user_id, conservation_status);
