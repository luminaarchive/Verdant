-- NaLI Migration: 018_nali_audio_foundation.sql

-- Add Spectrogram and Audio Metadata support
ALTER TABLE "public"."observation_media"
ADD COLUMN IF NOT EXISTS "spectrogram_url" TEXT,
ADD COLUMN IF NOT EXISTS "audio_metadata" JSONB DEFAULT '{}'::jsonb;
