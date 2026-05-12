-- ═══════════════════════════════════════════════════════════════════
-- NaLIAI Export Durability — Supabase Migration
-- Run this in the Supabase SQL Editor AFTER 003_durable_jobs.sql
-- Safe to run multiple times (uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)
-- ═══════════════════════════════════════════════════════════════════

-- 1. Add export durability columns to research_jobs
ALTER TABLE research_jobs ADD COLUMN IF NOT EXISTS export_file_path TEXT;
ALTER TABLE research_jobs ADD COLUMN IF NOT EXISTS export_file_size INTEGER;
ALTER TABLE research_jobs ADD COLUMN IF NOT EXISTS export_generation_attempts INTEGER DEFAULT 0;
ALTER TABLE research_jobs ADD COLUMN IF NOT EXISTS export_failure_reason TEXT;

-- 2. Resume eligibility function
-- Finds jobs that are stuck in processing states with expired worker locks
-- or that haven't been updated within a threshold period.
CREATE OR REPLACE FUNCTION find_resumable_jobs(stale_minutes INTEGER DEFAULT 5)
RETURNS SETOF research_jobs AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM research_jobs
  WHERE status IN (
    'evidence_synthesis', 'report_composition', 'contradiction_audit',
    'quality_audit', 'generating_exports', 'retrying'
  )
  AND (
    -- Worker lock expired
    (worker_lock_expires_at IS NOT NULL AND worker_lock_expires_at < now())
    OR
    -- No worker lock but stuck in processing state
    (worker_lock_id IS NULL AND updated_at < now() - (stale_minutes || ' minutes')::interval)
  );
END;
$$ LANGUAGE plpgsql;

-- 3. Index for export status queries
CREATE INDEX IF NOT EXISTS idx_research_jobs_export ON research_jobs(export_status)
  WHERE export_status IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════
-- DONE. Export durability columns and resume function added.
-- ═══════════════════════════════════════════════════════════════════
