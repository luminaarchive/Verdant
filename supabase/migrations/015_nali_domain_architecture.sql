-- Phase 2: Database & Domain Structure Migration
-- Table: species_reference
CREATE TABLE IF NOT EXISTS public.species_reference (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scientific_name TEXT NOT NULL UNIQUE,
    common_name_id TEXT,
    common_name_en TEXT,
    family TEXT,
    order_name TEXT,
    class_name TEXT,
    iucn_status TEXT,
    gbif_taxon_key BIGINT,
    is_endemic_indonesia BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure we have users or user_profiles table robustly handled.
-- Migration 014 already inserts into public.users. If it's missing, let's ensure it exists.
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'student',
    institution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: observations
CREATE TABLE IF NOT EXISTS public.observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    species_ref_id UUID REFERENCES public.species_reference(id),
    confidence_level FLOAT,
    observation_status TEXT DEFAULT 'pending', -- pending, identified, review_needed, failed
    review_status TEXT DEFAULT 'unreviewed', -- unreviewed, verified, rejected
    processing_stage TEXT DEFAULT 'uploaded', -- uploaded, identifying, gbif_analysis, iucn_analysis, anomaly_check, completed, failed
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    text_description TEXT,
    is_anomaly BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: observation_media
CREATE TABLE IF NOT EXISTS public.observation_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    observation_id UUID NOT NULL REFERENCES public.observations(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL, -- photo, audio, spectrogram
    storage_url TEXT NOT NULL,
    checksum TEXT,
    captured_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: analysis_runs
CREATE TABLE IF NOT EXISTS public.analysis_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    observation_id UUID NOT NULL REFERENCES public.observations(id) ON DELETE CASCADE,
    tool_name TEXT NOT NULL,
    tool_version TEXT,
    prompt_version TEXT,
    status TEXT NOT NULL, -- running, completed, error, warning
    latency_ms INTEGER,
    score_breakdown JSONB DEFAULT '{}'::jsonb,
    raw_output TEXT,
    error TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Table: observation_events
CREATE TABLE IF NOT EXISTS public.observation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    observation_id UUID NOT NULL REFERENCES public.observations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payload JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.species_reference ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observation_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observation_events ENABLE ROW LEVEL SECURITY;

-- Policies for species_reference (global read)
CREATE POLICY "Enable read access for all users" ON public.species_reference FOR SELECT USING (true);

-- Policies for users
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Policies for observations (CRUD for owner, read for reviewers/global depending on visibility but let's default to owner for now or public if it's an archive)
-- We'll allow public read for now to support the archive, but restrict updates to owner
CREATE POLICY "Observations are viewable by everyone" ON public.observations FOR SELECT USING (true);
CREATE POLICY "Users can insert their own observations" ON public.observations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own observations" ON public.observations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own observations" ON public.observations FOR DELETE USING (auth.uid() = user_id);

-- Policies for observation_media
CREATE POLICY "Observation media viewable by everyone" ON public.observation_media FOR SELECT USING (true);
CREATE POLICY "Users can insert media for their observations" ON public.observation_media FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.observations WHERE id = observation_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete media for their observations" ON public.observation_media FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.observations WHERE id = observation_id AND user_id = auth.uid())
);

-- Policies for analysis_runs
CREATE POLICY "Analysis runs viewable by everyone" ON public.analysis_runs FOR SELECT USING (true);
-- Service role handles inserts typically, but allow users to insert for their observations if client-side agents run (or via API)
CREATE POLICY "Allow authenticated to insert analysis runs" ON public.analysis_runs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policies for observation_events
CREATE POLICY "Observation events viewable by everyone" ON public.observation_events FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to insert observation events" ON public.observation_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
