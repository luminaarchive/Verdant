// ─── /api/health — Production Health Check ──────────────────────────────────
// Quick diagnostic endpoint to verify:
//   1. Environment variables are configured
//   2. OpenRouter is reachable
//   3. Supabase is reachable
//
// Use this to debug production failures without reading function logs.
// GET /api/health → { status, env, openrouter, supabase, timestamp }

import { NextResponse } from 'next/server'
import { checkEnv } from '@/lib/env-check'
import { getAllHealth } from '@/lib/ai/health'

export const runtime = 'nodejs'

export async function GET() {
  const startTime = Date.now()
  const envStatus = checkEnv()

  // ─── OpenRouter ping ──────────────────────────────────────────────────────
  let openrouterStatus: { reachable: boolean; latencyMs: number; error?: string } = {
    reachable: false,
    latencyMs: 0,
  }

  if (envStatus.providers.openrouter) {
    const orStart = Date.now()
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      const res = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY?.trim()}`,
        },
        signal: controller.signal,
      })
      clearTimeout(timeout)
      openrouterStatus = {
        reachable: res.ok,
        latencyMs: Date.now() - orStart,
        error: res.ok ? undefined : `HTTP ${res.status}`,
      }
    } catch (e) {
      openrouterStatus = {
        reachable: false,
        latencyMs: Date.now() - orStart,
        error: (e as Error).message,
      }
    }
  } else {
    openrouterStatus.error = 'OPENROUTER_API_KEY not configured'
  }

  // ─── Supabase ping ────────────────────────────────────────────────────────
  let supabaseStatus: { reachable: boolean; latencyMs: number; error?: string } = {
    reachable: false,
    latencyMs: 0,
  }

  if (envStatus.supabase === 'configured') {
    const sbStart = Date.now()
    try {
      const { getSupabaseAdmin } = await import('@/lib/supabase/admin')
      const sb = getSupabaseAdmin()
      if (sb) {
        const { error } = await sb.from('research_runs').select('run_id').limit(1)
        supabaseStatus = {
          reachable: !error,
          latencyMs: Date.now() - sbStart,
          error: error?.message,
        }
      } else {
        supabaseStatus.error = 'Admin client returned null'
      }
    } catch (e) {
      supabaseStatus = {
        reachable: false,
        latencyMs: Date.now() - sbStart,
        error: (e as Error).message,
      }
    }
  } else {
    supabaseStatus.error = `Supabase status: ${envStatus.supabase}`
  }

  // ─── Provider health history ──────────────────────────────────────────────
  const providerHealth = getAllHealth()

  // ─── Overall status ───────────────────────────────────────────────────────
  const healthy = envStatus.ai === 'configured' && openrouterStatus.reachable

  return NextResponse.json({
    status: healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    totalLatencyMs: Date.now() - startTime,
    env: {
      valid: envStatus.valid,
      missing: envStatus.missing,
      supabase: envStatus.supabase,
      ai: envStatus.ai,
      providers: envStatus.providers,
    },
    openrouter: openrouterStatus,
    supabase: supabaseStatus,
    providerHealth,
  }, {
    status: healthy ? 200 : 503,
  })
}
