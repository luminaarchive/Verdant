// ─── /api/health — Production Health Check + Provider Warmup ────────────────
// Diagnostic endpoint that also performs provider warmup:
//   1. Validates environment variables
//   2. Pings OpenRouter (warmup)
//   3. Pings Supabase
//   4. Reports model health cache status
//   5. Reports circuit breaker states
//
// GET /api/health → { status, env, openrouter, supabase, models, circuits }

import { NextResponse } from 'next/server'
import { checkEnv } from '@/lib/env-check'
import { getAllHealth } from '@/lib/ai/health'
import { getUnhealthyModels, getUnhealthyCount } from '@/lib/ai/model-health'
import { getAllCircuitStates } from '@/lib/ai/circuit-breaker'

export const runtime = 'nodejs'

// ─── Warmup: lightweight model ping ─────────────────────────────────────────
async function warmupOpenRouter(apiKey: string): Promise<{
  reachable: boolean
  latencyMs: number
  warmupModel?: string
  error?: string
}> {
  const start = Date.now()
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)

    // Lightweight ping — tiny prompt, tiny max_tokens
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://verdantai.vercel.app',
        'X-Title': 'Verdant-Warmup',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b:free', // Fastest verified model
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5,
        stream: false,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)
    const latencyMs = Date.now() - start

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      return {
        reachable: false,
        latencyMs,
        warmupModel: 'openai/gpt-oss-20b:free',
        error: `HTTP ${res.status}: ${errText.slice(0, 100)}`,
      }
    }

    const data = await res.json().catch(() => null)
    const content = data?.choices?.[0]?.message?.content || ''

    console.log(`[health] Warmup successful: model=openai/gpt-oss-20b:free latency=${latencyMs}ms response="${content.slice(0, 20)}"`)

    return {
      reachable: true,
      latencyMs,
      warmupModel: 'openai/gpt-oss-20b:free',
    }
  } catch (e) {
    return {
      reachable: false,
      latencyMs: Date.now() - start,
      error: (e as Error).message,
    }
  }
}

export async function GET() {
  const startTime = Date.now()
  const envStatus = checkEnv()

  // ─── OpenRouter warmup ping ────────────────────────────────────────────────
  let openrouterStatus: { reachable: boolean; latencyMs: number; warmupModel?: string; error?: string } = {
    reachable: false,
    latencyMs: 0,
  }

  if (envStatus.providers.openrouter) {
    const apiKey = process.env.OPENROUTER_API_KEY?.trim()
    if (apiKey) {
      openrouterStatus = await warmupOpenRouter(apiKey)
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

  // ─── Model health + circuit breaker diagnostics ───────────────────────────
  const providerHealth = getAllHealth()
  const unhealthyModels = getUnhealthyModels()
  const circuitStates = getAllCircuitStates()

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
    modelHealth: {
      unhealthyCount: getUnhealthyCount(),
      unhealthyModels,
    },
    circuitBreakers: circuitStates,
  }, {
    status: healthy ? 200 : 503,
  })
}
