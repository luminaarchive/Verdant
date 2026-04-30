// ─── Migration: Drop and recreate tables via Supabase SQL API ────────────────
// Uses the Supabase Management API to execute SQL directly

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  if (token !== 'verdant-migrate-2026') {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.replace(/\\n/g, '').replace(/\s+/g, '')
  
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ ok: false, message: 'Missing env vars' }, { status: 500 })
  }

  // Use the Supabase pg-meta API to run raw SQL
  // This endpoint is available at <project-url>/pg/query
  const pgUrl = `${supabaseUrl}/pg/query`
  
  const sql = `
    DROP TABLE IF EXISTS research_job_partial_results CASCADE;
    DROP TABLE IF EXISTS research_job_events CASCADE;
    DROP TABLE IF EXISTS research_jobs CASCADE;

    CREATE TABLE research_jobs (
      job_id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL,
      query TEXT NOT NULL,
      normalized_query TEXT,
      mode TEXT NOT NULL,
      preset_id TEXT,
      status TEXT NOT NULL DEFAULT 'queued',
      progress INTEGER NOT NULL DEFAULT 0,
      stage TEXT NOT NULL DEFAULT 'Queued for processing',
      provider_source TEXT,
      retry_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      started_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      completed_at TIMESTAMPTZ,
      failed_at TIMESTAMPTZ,
      stale_at TIMESTAMPTZ,
      eta_seconds INTEGER DEFAULT 30,
      error_reason TEXT,
      partial_result_available BOOLEAN NOT NULL DEFAULT false,
      export_ready BOOLEAN NOT NULL DEFAULT false,
      export_status TEXT DEFAULT 'pending',
      confidence_score INTEGER,
      source_count INTEGER,
      evidence_count INTEGER,
      result_data JSONB,
      worker_lock_id TEXT,
      worker_lock_expires_at TIMESTAMPTZ,
      resume_token TEXT,
      idempotency_key TEXT
    );

    CREATE TABLE research_job_events (
      event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      job_id TEXT NOT NULL REFERENCES research_jobs(job_id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      previous_status TEXT,
      next_status TEXT,
      event_payload JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE research_job_partial_results (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      job_id TEXT NOT NULL REFERENCES research_jobs(job_id) ON DELETE CASCADE,
      stage TEXT NOT NULL,
      partial_data JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_rj_status ON research_jobs(status);
    CREATE INDEX IF NOT EXISTS idx_rj_created ON research_jobs(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_rj_idempotency ON research_jobs(idempotency_key) WHERE idempotency_key IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_rje_job ON research_job_events(job_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_rjpr_job ON research_job_partial_results(job_id, created_at DESC);

    NOTIFY pgrst, 'reload schema';
  `

  try {
    // Try pg-meta endpoint first
    const pgResponse = await fetch(pgUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ query: sql }),
    })

    if (pgResponse.ok) {
      const result = await pgResponse.json()
      return NextResponse.json({ ok: true, message: 'Migration completed via pg/query', result })
    }

    // If pg-meta doesn't work, try the SQL endpoint
    const sqlResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ name: 'exec_sql', args: { sql } }),
    })

    if (sqlResponse.ok) {
      return NextResponse.json({ ok: true, message: 'Migration completed via rpc' })
    }

    const errText = await pgResponse.text()
    return NextResponse.json({
      ok: false,
      message: 'pg/query and rpc both failed',
      pgStatus: pgResponse.status,
      pgError: errText.slice(0, 200),
      hint: 'Run the SQL manually: supabase/migrations/003_durable_jobs.sql',
    })
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 })
  }
}
