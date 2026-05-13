-- NaLI Migration: 017_nali_human_review_system.sql

-- Add Human Review System fields to observations
ALTER TABLE "public"."observations"
ADD COLUMN IF NOT EXISTS "reviewer_id" UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS "review_notes" TEXT,
ADD COLUMN IF NOT EXISTS "review_confidence_delta" NUMERIC(3, 2);

-- Update review_status constraint to support ambiguity
ALTER TABLE "public"."observations" DROP CONSTRAINT IF EXISTS "observations_review_status_check";
ALTER TABLE "public"."observations" ADD CONSTRAINT "observations_review_status_check" 
CHECK (review_status IN ('unreviewed', 'verified', 'rejected', 'needs_additional_evidence'));
