// ─── Supabase Admin Client ──────────────────────────────────────────────────
// Uses SERVICE_ROLE_KEY to bypass RLS. Only for server-side API routes.
// Logs clear diagnostics when env vars are missing (for Vercel log debugging).

import { createClient } from '@supabase/supabase-js'

 
let _adminClient: any = null
let _initAttempted = false

export function getSupabaseAdmin() {
  if (_adminClient) return _adminClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    // Only log once to avoid log spam
    if (!_initAttempted) {
      _initAttempted = true
      console.error('[supabase] Admin client initialization FAILED - missing env vars:')
      console.error(`[supabase]   NEXT_PUBLIC_SUPABASE_URL: ${url ? `present (${url.slice(0, 25)}...)` : 'MISSING'}`)
      console.error(`[supabase]   SUPABASE_SERVICE_ROLE_KEY: ${serviceKey ? `present (length: ${serviceKey.length})` : 'MISSING'}`)
      console.error('[supabase]   -> Set these in Vercel: Settings > Environment Variables > Production')
    }
    return null
  }

  // Clean keys (remove trailing \n, escaped newlines, or whitespace from env vars)
  const cleanUrl = url.trim()
  const cleanKey = serviceKey.replace(/\\n/g, '').replace(/\s+/g, '')

  try {
    _adminClient = createClient(cleanUrl, cleanKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    console.log(`[supabase] Admin client initialized (${cleanUrl.slice(0, 25)}...)`)
  } catch (e) {
    console.error(`[supabase] Admin client creation THREW: ${(e as Error).message}`)
    console.error(`[supabase]   URL used: ${cleanUrl.slice(0, 25)}...`)
    console.error(`[supabase]   Key length: ${cleanKey.length}`)
    return null
  }

  return _adminClient
}

// ─── Typed helpers for common operations ────────────────────────────────────

export async function saveResearchRun(run: {
  run_id: string
  query: string
  mode: string
  status: string
  pipeline_source: string
  confidence_score?: number
  duration_ms?: number
  cost_usd?: number
  error_message?: string
  request_id: string
}) {
  const sb = getSupabaseAdmin()
  if (!sb) return null

  const { data, error } = await sb
    .from('research_runs')
    .upsert(run, { onConflict: 'run_id' })
    .select()
    .single()

  if (error) {
    console.error('[supabase] saveResearchRun failed:', error.message)
    return null
  }
  return data
}

export async function saveResearchResult(result: {
  run_id: string
  title: string
  executive_summary: unknown
  findings: string[]
  outline: unknown[]
  stats: unknown[]
  sources: unknown[]
  decision_recommendations?: unknown[]
  evidence_items: unknown[]
  contradictions?: unknown[]
  uncertainty_notes: unknown[]
  strategic_follow_ups?: string[]
  raw_json?: string
}) {
  const sb = getSupabaseAdmin()
  if (!sb) return null

  const { data, error } = await sb
    .from('research_results')
    .upsert(result, { onConflict: 'run_id' })
    .select()
    .single()

  if (error) {
    console.error('[supabase] saveResearchResult failed:', error.message)
    return null
  }
  return data
}

export async function getRunById(runId: string) {
  const sb = getSupabaseAdmin()
  if (!sb) return null

  const { data: run } = await sb
    .from('research_runs')
    .select('*')
    .eq('run_id', runId)
    .single()

  if (!run) return null

  const { data: result } = await sb
    .from('research_results')
    .select('*')
    .eq('run_id', runId)
    .single()

  return { run, result }
}

export async function getRecentRuns(limit = 50) {
  const sb = getSupabaseAdmin()
  if (!sb) return []

  const { data } = await sb
    .from('research_runs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  return data ?? []
}

export async function saveJournalEntry(entry: {
  query: string
  title: string
  summary?: string
  run_id?: string
}) {
  const sb = getSupabaseAdmin()
  if (!sb) return null

  const { data, error } = await sb
    .from('journal_entries')
    .insert({ ...entry, created_at: new Date().toISOString() })
    .select()
    .single()

  if (error) {
    console.error('[supabase] saveJournalEntry failed:', error.message)
    return null
  }
  return data
}

export async function getJournalEntries(limit = 50) {
  const sb = getSupabaseAdmin()
  if (!sb) return []

  const { data } = await sb
    .from('journal_entries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  return data ?? []
}

export async function deleteJournalEntry(id: string) {
  const sb = getSupabaseAdmin()
  if (!sb) return false

  const { error } = await sb.from('journal_entries').delete().eq('id', id)
  return !error
}

export async function saveFeedback(entry: {
  run_id: string
  rating: string
  comment?: string
}) {
  const sb = getSupabaseAdmin()
  if (!sb) return null

  const { data, error } = await sb
    .from('feedback_entries')
    .insert({ ...entry, created_at: new Date().toISOString() })
    .select()
    .single()

  if (error) {
    console.error('[supabase] saveFeedback failed:', error.message)
    return null
  }
  return data
}

export async function createShareToken(params: {
  run_id: string
  token: string
  expires_at: string
}) {
  const sb = getSupabaseAdmin()
  if (!sb) return null

  const { data, error } = await sb
    .from('share_tokens')
    .insert({ ...params, created_at: new Date().toISOString() })
    .select()
    .single()

  if (error) {
    console.error('[supabase] createShareToken failed:', error.message)
    return null
  }
  return data
}

export async function getRunByShareToken(token: string) {
  const sb = getSupabaseAdmin()
  if (!sb) return null

  const { data: share } = await sb
    .from('share_tokens')
    .select('*')
    .eq('token', token)
    .gte('expires_at', new Date().toISOString())
    .single()

  if (!share) return null

  return getRunById(share.run_id)
}

export async function saveGeneratedFile(file: {
  run_id: string
  file_type: string
  file_url: string
  file_size: number
}) {
  const sb = getSupabaseAdmin()
  if (!sb) return null

  const { data, error } = await sb
    .from('generated_files')
    .insert({ ...file, created_at: new Date().toISOString() })
    .select()
    .single()

  if (error) {
    console.error('[supabase] saveGeneratedFile failed:', error.message)
    return null
  }
  return data
}
