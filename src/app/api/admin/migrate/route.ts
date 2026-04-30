// ─── One-time migration runner ───────────────────────────────────────────────
// POST /api/admin/migrate — Creates durable job tables via Supabase REST SQL endpoint
// Protected by simple token. Run once after deployment.

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
    return NextResponse.json({ ok: false, message: 'Supabase not configured' }, { status: 500 })
  }

  // Execute SQL statements individually via Supabase REST /rest/v1/rpc
  // First, try to create each table using the PostgREST approach
  // Since we can't run raw SQL via PostgREST, we'll try creating via insert and catching errors
  
  // Alternative: Use the Supabase Management API SQL endpoint
  const projectRef = supabaseUrl.replace('https://', '').split('.')[0]
  
  const statements = [
    // Table 1: research_jobs
    `CREATE TABLE IF NOT EXISTS research_jobs (
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
    )`,
    `CREATE INDEX IF NOT EXISTS idx_research_jobs_status ON research_jobs(status)`,
    `CREATE INDEX IF NOT EXISTS idx_research_jobs_created ON research_jobs(created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_research_jobs_idempotency ON research_jobs(idempotency_key) WHERE idempotency_key IS NOT NULL`,
    // Table 2: research_job_events
    `CREATE TABLE IF NOT EXISTS research_job_events (
      event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      job_id TEXT NOT NULL REFERENCES research_jobs(job_id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      previous_status TEXT,
      next_status TEXT,
      event_payload JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_job_events_job ON research_job_events(job_id, created_at DESC)`,
    // Table 3: research_job_partial_results
    `CREATE TABLE IF NOT EXISTS research_job_partial_results (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      job_id TEXT NOT NULL REFERENCES research_jobs(job_id) ON DELETE CASCADE,
      stage TEXT NOT NULL,
      partial_data JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_partial_results_job ON research_job_partial_results(job_id, created_at DESC)`,
  ]

  const results: string[] = []

  for (const sql of statements) {
    try {
      // Use Supabase SQL API (available on all plans)
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ query: sql }),
      })

      if (response.ok) {
        results.push(`✅ ${sql.slice(0, 50)}...`)
      } else {
        const err = await response.text()
        results.push(`⚠️ ${sql.slice(0, 40)}: ${err.slice(0, 100)}`)
      }
    } catch (e) {
      results.push(`❌ ${sql.slice(0, 40)}: ${(e as Error).message}`)
    }
  }

  return NextResponse.json({
    ok: true,
    message: 'Migration attempted. If tables were not created via API, run the SQL file manually in the Supabase SQL Editor.',
    projectRef,
    sqlFile: 'supabase/migrations/003_durable_jobs.sql',
    results,
  })
}
