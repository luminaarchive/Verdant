// ─── GET /api/health — Diagnostic endpoint ──────────────────────────────────
// Returns system health status. Never exposes actual key values.
// Use to verify Vercel production has correct env vars configured.

import { NextResponse } from 'next/server'
import { checkEnv } from '@/lib/env-check'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const env = checkEnv()

  // Test actual Supabase connectivity (not just env presence)
  let supabaseStatus: 'connected' | 'missing_env' | 'connection_failed' = 'missing_env'
  let supabaseError: string | undefined

  if (env.supabase === 'configured') {
    const sb = getSupabaseAdmin()
    if (sb) {
      try {
        // Lightweight query to test connectivity
        const { error } = await sb.from('research_jobs').select('job_id').limit(1)
        if (error) {
          supabaseStatus = 'connection_failed'
          supabaseError = error.message
        } else {
          supabaseStatus = 'connected'
        }
      } catch (e) {
        supabaseStatus = 'connection_failed'
        supabaseError = (e as Error).message
      }
    }
  } else {
    supabaseStatus = 'missing_env'
  }

  const overall = supabaseStatus === 'connected' && env.ai === 'configured' ? 'ok' : 'degraded'

  return NextResponse.json({
    status: overall,
    supabase: supabaseStatus,
    supabaseDetail: supabaseError ?? undefined,
    ai: env.ai,
    envPresent: {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseUrlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 25) ?? null,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length ?? 0,
      geminiKey: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY),
      openrouterKey: !!process.env.OPENROUTER_API_KEY,
    },
    timestamp: new Date().toISOString(),
  })
}
