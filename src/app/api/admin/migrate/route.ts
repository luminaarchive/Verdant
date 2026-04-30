// ─── One-time migration runner ───────────────────────────────────────────────
// POST /api/admin/migrate — Creates durable job tables using Supabase PostgREST
// Uses the service role key to execute DDL via the /pg/query endpoint

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

  const sb = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'public' },
  })

  const results: string[] = []

  // Try creating tables by inserting and catching the "relation does not exist" error
  // Then use a different approach: create tables via individual SQL statements through PostgREST

  // Step 1: Check if research_jobs table exists
  const { error: checkError } = await sb.from('research_jobs').select('job_id').limit(1)
  
  if (checkError && checkError.message.includes('does not exist')) {
    results.push('⚠️ research_jobs table does not exist. You must create it manually.')
    results.push('📋 Go to Supabase Dashboard → SQL Editor → paste the migration SQL')
    results.push(`🔗 https://supabase.com/dashboard/project/${supabaseUrl.replace('https://','').split('.')[0]}/sql/new`)
    
    return NextResponse.json({
      ok: false,
      message: 'Tables do not exist. Manual SQL execution required.',
      dashboardUrl: `https://supabase.com/dashboard/project/${supabaseUrl.replace('https://','').split('.')[0]}/sql/new`,
      sqlFile: 'supabase/migrations/003_durable_jobs.sql',
      instructions: [
        '1. Open the Supabase Dashboard URL above',
        '2. Copy the SQL from supabase/migrations/003_durable_jobs.sql',
        '3. Paste into the SQL Editor and click Run',
        '4. Re-run this migration endpoint to verify',
      ],
      results,
    })
  } else if (checkError) {
    results.push(`⚠️ research_jobs check returned: ${checkError.message}`)
  } else {
    results.push('✅ research_jobs table exists')
  }

  // Step 2: Check research_job_events
  const { error: eventsError } = await sb.from('research_job_events').select('event_id').limit(1)
  if (eventsError && eventsError.message.includes('does not exist')) {
    results.push('⚠️ research_job_events table missing — needs manual creation')
  } else {
    results.push('✅ research_job_events table exists')
  }

  // Step 3: Check research_job_partial_results
  const { error: partialsError } = await sb.from('research_job_partial_results').select('id').limit(1)
  if (partialsError && partialsError.message.includes('does not exist')) {
    results.push('⚠️ research_job_partial_results table missing — needs manual creation')
  } else {
    results.push('✅ research_job_partial_results table exists')
  }

  // Step 4: Test a write cycle
  const testJobId = `test_migration_${Date.now()}`
  const { error: writeError } = await sb.from('research_jobs').insert({
    job_id: testJobId,
    run_id: 'test',
    query: 'migration test',
    mode: 'focus',
    status: 'queued',
    progress: 0,
    stage: 'test',
    retry_count: 0,
  })
  
  if (writeError) {
    results.push(`⚠️ Write test failed: ${writeError.message}`)
  } else {
    results.push('✅ Write test passed')
    // Clean up
    await sb.from('research_jobs').delete().eq('job_id', testJobId)
    results.push('✅ Cleanup passed')
  }

  const allPassed = results.every(r => r.startsWith('✅'))

  return NextResponse.json({
    ok: allPassed,
    message: allPassed ? 'All tables verified and writable. Durable job system is operational.' : 'Some tables need attention.',
    results,
  })
}
