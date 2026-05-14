-- NaLI agentic field intelligence foundation
-- Additive migration only. No destructive table drops or data deletion.

CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.observations
  ADD COLUMN IF NOT EXISTS location extensions.geography(Point, 4326),
  ADD COLUMN IF NOT EXISTS h3_cell_res7 TEXT;

UPDATE public.observations
SET location = extensions.ST_SetSRID(extensions.ST_MakePoint(longitude, latitude), 4326)::extensions.geography
WHERE location IS NULL
  AND latitude IS NOT NULL
  AND longitude IS NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_observation_location()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  ELSE
    NEW.location := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS observation_location_sync ON public.observations;
CREATE TRIGGER observation_location_sync
BEFORE INSERT OR UPDATE OF latitude, longitude ON public.observations
FOR EACH ROW EXECUTE FUNCTION public.sync_observation_location();

CREATE INDEX IF NOT EXISTS idx_observations_location_gist ON public.observations USING gist(location);
CREATE INDEX IF NOT EXISTS idx_observations_h3_species_time ON public.observations(h3_cell_res7, final_species_ref_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.observation_hashes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID NOT NULL REFERENCES public.observations(id) ON DELETE CASCADE,
  hash TEXT NOT NULL UNIQUE,
  hash_algorithm TEXT NOT NULL DEFAULT 'sha256',
  canonical_payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.observation_anomaly_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID NOT NULL REFERENCES public.observations(id) ON DELETE CASCADE,
  flag_type TEXT NOT NULL CHECK (flag_type IN ('first_record_in_grid', 'unusual_activity', 'high_priority_verify')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  reason TEXT NOT NULL,
  baseline_window_months INTEGER NOT NULL DEFAULT 12,
  h3_cell TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'reviewer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role)
);

CREATE TABLE IF NOT EXISTS public.review_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id UUID NOT NULL REFERENCES public.observations(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL CHECK (action IN ('verify', 'request_clarification', 'reject')),
  reason TEXT,
  confidence_delta DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.threat_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN ('firms', 'gfw', 'nali')),
  type TEXT NOT NULL,
  location extensions.geography(Point, 4326),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  timestamp TIMESTAMPTZ NOT NULL,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.realtime_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id TEXT NOT NULL DEFAULT 'default',
  observation_id UUID REFERENCES public.observations(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('medium', 'high', 'critical')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_scores (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  verified_count INTEGER NOT NULL DEFAULT 0,
  rejected_count INTEGER NOT NULL DEFAULT 0,
  revision_count INTEGER NOT NULL DEFAULT 0,
  endangered_verified_count INTEGER NOT NULL DEFAULT 0,
  completeness_bonus_count INTEGER NOT NULL DEFAULT 0,
  consistency_bonus_count INTEGER NOT NULL DEFAULT 0,
  auto_trust_eligible BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.observation_hashes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observation_anomaly_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realtime_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "observation_hashes_select_accessible" ON public.observation_hashes;
CREATE POLICY "observation_hashes_select_accessible" ON public.observation_hashes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.observations o
    WHERE o.id = observation_id
      AND (o.user_id = auth.uid() OR o.review_status = 'verified' OR o.verified_by_human = true)
  )
);

DROP POLICY IF EXISTS "observation_hashes_service_insert" ON public.observation_hashes;
CREATE POLICY "observation_hashes_service_insert" ON public.observation_hashes
FOR INSERT WITH CHECK (auth.role() = 'service_role' OR created_by = auth.uid());

DROP POLICY IF EXISTS "observation_anomaly_flags_select_accessible" ON public.observation_anomaly_flags;
CREATE POLICY "observation_anomaly_flags_select_accessible" ON public.observation_anomaly_flags
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.observations o
    WHERE o.id = observation_id
      AND (o.user_id = auth.uid() OR o.review_status = 'verified' OR o.verified_by_human = true)
  )
);

DROP POLICY IF EXISTS "observation_anomaly_flags_service_insert" ON public.observation_anomaly_flags;
CREATE POLICY "observation_anomaly_flags_service_insert" ON public.observation_anomaly_flags
FOR INSERT WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "user_roles_select_own_or_admin" ON public.user_roles;
CREATE POLICY "user_roles_select_own_or_admin" ON public.user_roles
FOR SELECT USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin')
);

DROP POLICY IF EXISTS "review_actions_select_reviewer_or_owner" ON public.review_actions;
CREATE POLICY "review_actions_select_reviewer_or_owner" ON public.review_actions
FOR SELECT USING (
  reviewer_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.observations o WHERE o.id = observation_id AND o.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('reviewer', 'admin'))
);

DROP POLICY IF EXISTS "review_actions_insert_reviewer" ON public.review_actions;
CREATE POLICY "review_actions_insert_reviewer" ON public.review_actions
FOR INSERT WITH CHECK (
  reviewer_id = auth.uid()
  AND EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('reviewer', 'admin'))
);

DROP POLICY IF EXISTS "notifications_own" ON public.notifications;
CREATE POLICY "notifications_own" ON public.notifications
FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "threat_events_read_authenticated" ON public.threat_events;
CREATE POLICY "threat_events_read_authenticated" ON public.threat_events
FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "threat_events_service_insert" ON public.threat_events;
CREATE POLICY "threat_events_service_insert" ON public.threat_events
FOR INSERT WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "realtime_alerts_read_authenticated" ON public.realtime_alerts;
CREATE POLICY "realtime_alerts_read_authenticated" ON public.realtime_alerts
FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "realtime_alerts_service_insert" ON public.realtime_alerts;
CREATE POLICY "realtime_alerts_service_insert" ON public.realtime_alerts
FOR INSERT WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "user_scores_select_own_or_reviewer" ON public.user_scores;
CREATE POLICY "user_scores_select_own_or_reviewer" ON public.user_scores
FOR SELECT USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role IN ('reviewer', 'admin'))
);

CREATE INDEX IF NOT EXISTS idx_observation_hashes_observation ON public.observation_hashes(observation_id);
CREATE INDEX IF NOT EXISTS idx_observation_anomaly_flags_observation ON public.observation_anomaly_flags(observation_id);
CREATE INDEX IF NOT EXISTS idx_review_actions_observation ON public.review_actions(observation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_threat_events_location ON public.threat_events USING gist(location);
CREATE INDEX IF NOT EXISTS idx_threat_events_time ON public.threat_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_realtime_alerts_region_time ON public.realtime_alerts(region_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.get_observations_nearby(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_m INTEGER DEFAULT 500
)
RETURNS TABLE (
  id UUID,
  scientific_name TEXT,
  local_name TEXT,
  observed_at TIMESTAMPTZ,
  review_status TEXT,
  confidence_level DOUBLE PRECISION,
  anomaly_flag BOOLEAN,
  submitter_label TEXT,
  field_case_id TEXT,
  distance_meters DOUBLE PRECISION,
  can_access_detail BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
  SELECT
    o.id,
    o.scientific_name,
    o.local_name,
    COALESCE(o.created_at, o.timestamp) AS observed_at,
    o.review_status,
    o.confidence_level,
    COALESCE(o.anomaly_flag, o.is_anomaly, FALSE) AS anomaly_flag,
    CASE
      WHEN o.user_id = auth.uid() THEN COALESCE(u.full_name, 'Your workspace')
      ELSE 'NaLI observer'
    END AS submitter_label,
    fc.id AS field_case_id,
    ST_Distance(o.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) AS distance_meters,
    o.user_id = auth.uid() AS can_access_detail
  FROM public.observations o
  LEFT JOIN public.users u ON u.id = o.user_id
  LEFT JOIN public.field_cases fc ON fc.observation_id = o.id
  WHERE o.location IS NOT NULL
    AND ST_DWithin(o.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, radius_m)
    AND (o.user_id = auth.uid() OR o.review_status = 'verified' OR o.verified_by_human = true)
  ORDER BY COALESCE(o.created_at, o.timestamp) DESC
  LIMIT 25;
$$;

GRANT EXECUTE ON FUNCTION public.get_observations_nearby(DOUBLE PRECISION, DOUBLE PRECISION, INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION public.verify_observation_hash(lookup_hash TEXT)
RETURNS TABLE (
  hash TEXT,
  hash_algorithm TEXT,
  observation_id UUID,
  scientific_name TEXT,
  local_name TEXT,
  created_at TIMESTAMPTZ,
  review_status TEXT,
  coordinates_protected BOOLEAN,
  accessible BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT
    oh.hash,
    oh.hash_algorithm,
    CASE WHEN o.user_id = auth.uid() OR o.review_status = 'verified' OR o.verified_by_human = true THEN o.id ELSE NULL END AS observation_id,
    CASE WHEN o.user_id = auth.uid() OR o.review_status = 'verified' OR o.verified_by_human = true THEN o.scientific_name ELSE NULL END AS scientific_name,
    CASE WHEN o.user_id = auth.uid() OR o.review_status = 'verified' OR o.verified_by_human = true THEN o.local_name ELSE NULL END AS local_name,
    oh.created_at,
    CASE WHEN o.user_id = auth.uid() OR o.review_status = 'verified' OR o.verified_by_human = true THEN o.review_status ELSE NULL END AS review_status,
    o.conservation_status IN ('CR', 'EN') AS coordinates_protected,
    (o.user_id = auth.uid() OR o.review_status = 'verified' OR o.verified_by_human = true) AS accessible
  FROM public.observation_hashes oh
  JOIN public.observations o ON o.id = oh.observation_id
  WHERE oh.hash = lookup_hash
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.verify_observation_hash(TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.apply_user_score_from_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user UUID;
  status_value TEXT;
  delta INTEGER := 0;
BEGIN
  SELECT user_id, conservation_status INTO target_user, status_value
  FROM public.observations
  WHERE id = NEW.observation_id;

  IF target_user IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.action = 'verify' THEN
    delta := delta + 10;
    IF status_value IN ('EN', 'CR') THEN
      delta := delta + 25;
    END IF;
  ELSIF NEW.action = 'request_clarification' THEN
    delta := delta + 3;
  ELSIF NEW.action = 'reject' THEN
    delta := delta - 5;
  END IF;

  INSERT INTO public.user_scores (
    user_id,
    score,
    verified_count,
    rejected_count,
    revision_count,
    endangered_verified_count,
    auto_trust_eligible,
    updated_at
  )
  VALUES (
    target_user,
    GREATEST(0, delta),
    CASE WHEN NEW.action = 'verify' THEN 1 ELSE 0 END,
    CASE WHEN NEW.action = 'reject' THEN 1 ELSE 0 END,
    CASE WHEN NEW.action = 'request_clarification' THEN 1 ELSE 0 END,
    CASE WHEN NEW.action = 'verify' AND status_value IN ('EN', 'CR') THEN 1 ELSE 0 END,
    GREATEST(0, delta) >= 150,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE
    SET score = GREATEST(0, public.user_scores.score + delta),
        verified_count = public.user_scores.verified_count + CASE WHEN NEW.action = 'verify' THEN 1 ELSE 0 END,
        rejected_count = public.user_scores.rejected_count + CASE WHEN NEW.action = 'reject' THEN 1 ELSE 0 END,
        revision_count = public.user_scores.revision_count + CASE WHEN NEW.action = 'request_clarification' THEN 1 ELSE 0 END,
        endangered_verified_count = public.user_scores.endangered_verified_count + CASE WHEN NEW.action = 'verify' AND status_value IN ('EN', 'CR') THEN 1 ELSE 0 END,
        auto_trust_eligible = GREATEST(0, public.user_scores.score + delta) >= 150,
        updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS review_actions_apply_user_score ON public.review_actions;
CREATE TRIGGER review_actions_apply_user_score
AFTER INSERT ON public.review_actions
FOR EACH ROW EXECUTE FUNCTION public.apply_user_score_from_review();

CREATE OR REPLACE FUNCTION public.create_realtime_alert_for_priority_observation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.conservation_status = 'CR'
    OR NEW.qa_flag = true
    OR NEW.observation_status = 'pending_review'
  THEN
    INSERT INTO public.realtime_alerts (region_id, observation_id, alert_type, severity, payload)
    VALUES (
      COALESCE(NEW.h3_cell_res7, 'default'),
      NEW.id,
      'high_priority_observation',
      CASE WHEN NEW.conservation_status = 'CR' THEN 'critical' ELSE 'high' END,
      jsonb_build_object(
        'coordinates_protected', NEW.conservation_status IN ('CR', 'EN'),
        'review_status', NEW.review_status,
        'observation_status', NEW.observation_status
      )
    );

    INSERT INTO public.observation_events (observation_id, event_type, severity, payload)
    VALUES (
      NEW.id,
      'REALTIME_ALERT_CREATED',
      CASE WHEN NEW.conservation_status = 'CR' THEN 'warning' ELSE 'info' END,
      jsonb_build_object(
        'region_id', COALESCE(NEW.h3_cell_res7, 'default'),
        'coordinates_protected', NEW.conservation_status IN ('CR', 'EN')
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS observations_priority_realtime_alert ON public.observations;
CREATE TRIGGER observations_priority_realtime_alert
AFTER INSERT OR UPDATE OF conservation_status, qa_flag, observation_status ON public.observations
FOR EACH ROW EXECUTE FUNCTION public.create_realtime_alert_for_priority_observation();

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.realtime_alerts;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

INSERT INTO public.species_reference (scientific_name, common_name_en, common_name_id, is_endemic_indonesia)
VALUES
  ('Nasalis larvatus', 'Proboscis Monkey', 'Bekantan', true),
  ('Elephas maximus sumatranus', 'Sumatran Elephant', 'Gajah Sumatera', true),
  ('Macrocephalon maleo', 'Maleo', 'Maleo', true),
  ('Paradisaea apoda', 'Greater Bird-of-Paradise', 'Cendrawasih', true)
ON CONFLICT (scientific_name) DO UPDATE
SET common_name_en = EXCLUDED.common_name_en,
    common_name_id = EXCLUDED.common_name_id,
    is_endemic_indonesia = EXCLUDED.is_endemic_indonesia,
    updated_at = NOW();
