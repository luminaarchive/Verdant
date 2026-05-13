-- Phase A: Real Observation Persistence & DB Updates

-- 1. Update analysis_runs
ALTER TABLE public.analysis_runs ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;
ALTER TABLE public.analysis_runs ADD COLUMN IF NOT EXISTS fallback_used BOOLEAN DEFAULT false;
ALTER TABLE public.analysis_runs ADD COLUMN IF NOT EXISTS execution_order INTEGER;

-- 2. Create orchestrator_runs table
CREATE TABLE IF NOT EXISTS public.orchestrator_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    observation_id UUID NOT NULL REFERENCES public.observations(id) ON DELETE CASCADE,
    status TEXT NOT NULL, -- running, completed, error, warning
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    total_latency_ms INTEGER,
    total_tools_executed INTEGER DEFAULT 0,
    final_confidence FLOAT,
    final_result_status TEXT
);

-- Enable RLS for orchestrator_runs
ALTER TABLE public.orchestrator_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Orchestrator runs viewable by everyone" ON public.orchestrator_runs FOR SELECT USING (true);
CREATE POLICY "Allow authenticated to insert orchestrator runs" ON public.orchestrator_runs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated to update orchestrator runs" ON public.orchestrator_runs FOR UPDATE USING (auth.role() = 'authenticated');

-- 3. Update observation_events
ALTER TABLE public.observation_events ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'info'; -- info, warning, error, critical

-- 4. Update observations
ALTER TABLE public.observations ADD COLUMN IF NOT EXISTS confidence_calibration JSONB DEFAULT '{}'::jsonb;

-- 5. Seed species_reference
INSERT INTO public.species_reference (scientific_name, common_name_en, is_endemic_indonesia)
VALUES 
    ('Panthera tigris sumatrae', 'Sumatran Tiger', true),
    ('Pongo tapanuliensis', 'Tapanuli Orangutan', true),
    ('Dicerorhinus sumatrensis', 'Sumatran Rhinoceros', true),
    ('Nisaetus bartelsi', 'Javan Hawk-Eagle', true), -- Note: Nisaetus is the accepted genus for Spizaetus bartelsi now, but I will use the user's string if needed. Let's use user's string: 'Spizaetus bartelsi'
    ('Varanus komodoensis', 'Komodo Dragon', true),
    ('Leucopsar rothschildi', 'Bali Starling', true)
ON CONFLICT (scientific_name) DO UPDATE 
SET 
    common_name_en = EXCLUDED.common_name_en,
    is_endemic_indonesia = EXCLUDED.is_endemic_indonesia;

-- Insert Spizaetus bartelsi if Nisaetus is not what the user wants:
INSERT INTO public.species_reference (scientific_name, common_name_en, is_endemic_indonesia)
VALUES ('Spizaetus bartelsi', 'Javan Hawk-Eagle', true)
ON CONFLICT (scientific_name) DO NOTHING;

-- 6. Storage bucket schema for observation_media
-- Usually we do this via supabase function, but let's insert into storage.buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('observation_media', 'observation_media', false)
ON CONFLICT (id) DO NOTHING;

-- Policies for storage
CREATE POLICY "Users can upload media to their folder" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'observation_media' AND 
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

CREATE POLICY "Users can view media in their folder" ON storage.objects FOR SELECT USING (
  bucket_id = 'observation_media' AND 
  auth.uid()::text = (string_to_array(name, '/'))[1]
);
