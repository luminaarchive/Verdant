// ─── /api/research — Core Research Endpoint ─────────────────────────────────
// POST: Submit a research query → multi-provider pipeline → structured result
// GET:  Retrieve a previous run by runId (for history/share)

import { NextRequest, NextResponse } from 'next/server'
import { ResearchRequestSchema, type ApiError } from '@/lib/research/schema'
import { runResearchPipeline } from '@/lib/research/pipeline'
import { checkRateLimit, checkIdempotency, setIdempotency } from '@/lib/research/rate-limit'
import { log, generateRequestId, timer } from '@/lib/research/logger'
import { saveResearchRun, saveResearchResult, getRunById } from '@/lib/supabase/admin'

export const maxDuration = 60

function errorResponse(status: number, message: string, opts: Partial<ApiError> = {}): NextResponse {
  return NextResponse.json({
    ok: false,
    status,
    message,
    retryable: opts.retryable ?? false,
    failedStep: opts.failedStep,
    runId: opts.runId,
    requestId: opts.requestId,
  } satisfies ApiError, { status })
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  const elapsed = timer()
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  log.info('Research request received', { requestId, ip })

  // ─── Rate limit ───────────────────────────────────────────────────────
  const rateLimit = checkRateLimit(ip)
  if (!rateLimit.allowed) {
    log.warn('Rate limited', { requestId, ip })
    return errorResponse(429, 'Too many requests. Please wait a minute before trying again.', { requestId })
  }

  // ─── Parse + validate body ────────────────────────────────────────────
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorResponse(400, 'Invalid JSON body', { requestId })
  }

  const parsed = ResearchRequestSchema.safeParse(body)
  if (!parsed.success) {
    const issues = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')
    return errorResponse(400, `Validation error: ${issues}`, { requestId })
  }

  const { query, mode, idempotencyKey, presetId } = parsed.data

  // ─── Idempotency check ────────────────────────────────────────────────
  if (idempotencyKey) {
    const existingRunId = checkIdempotency(idempotencyKey)
    if (existingRunId) {
      log.info('Idempotency hit — returning existing run', { requestId, runId: existingRunId })
      const existing = await getRunById(existingRunId)
      if (existing?.result) {
        return NextResponse.json({ ok: true, ...rebuildResult(existing), pipelineSource: 'cache' })
      }
    }
  }

  // ─── Run pipeline ────────────────────────────────────────────────────
  try {
    const { result } = await runResearchPipeline({ query, mode, requestId, presetId })

    // ─── Persist to Supabase (best-effort) ────────────────────────────
    await saveResearchRun({
      run_id: result.runId,
      query: result.query,
      mode: result.mode,
      status: 'ready',
      pipeline_source: result.pipelineSource,
      confidence_score: result.confidenceScore,
      duration_ms: result.durationMs,
      cost_usd: result.costBreakdown?.costUsd,
      request_id: requestId,
    }).catch(e => log.warn(`Supabase run save failed: ${e}`, { requestId, runId: result.runId }))

    await saveResearchResult({
      run_id: result.runId,
      title: result.title,
      executive_summary: result.executiveSummary,
      findings: result.findings,
      outline: result.outline,
      stats: result.stats,
      sources: result.sources,
      decision_recommendations: result.decisionRecommendations,
      evidence_items: result.evidenceItems,
      contradictions: result.contradictions,
      uncertainty_notes: result.uncertaintyNotes,
      strategic_follow_ups: result.strategicFollowUps,
    }).catch(e => log.warn(`Supabase result save failed: ${e}`, { requestId, runId: result.runId }))

    // ─── Set idempotency ──────────────────────────────────────────────
    if (idempotencyKey) {
      setIdempotency(idempotencyKey, result.runId)
    }

    log.info(`Research complete`, { requestId, runId: result.runId, durationMs: elapsed() })

    return NextResponse.json({
      ok: true,
      ...result,
    }, {
      headers: {
        'X-Request-Id': requestId,
        'X-Run-Id': result.runId,
        'X-RateLimit-Remaining': String(rateLimit.remaining),
      },
    })

  } catch (err) {
    const rawMessage = err instanceof Error ? err.message : 'Unknown pipeline error'
    const failedStep = rawMessage.includes('JSON') ? 'parse'
      : rawMessage.includes('validation') ? 'validate'
      : rawMessage.includes('All providers') ? 'all-providers'
      : 'provider-call'

    // User-friendly message (don't leak provider internals)
    let userMessage = 'Research engine temporarily unavailable. Please try again in a moment.'
    if (failedStep === 'parse') userMessage = 'AI returned an invalid response. Please retry.'
    else if (failedStep === 'validate') userMessage = 'AI response did not pass quality checks. Please retry.'
    else if (rawMessage.includes('key') || rawMessage.includes('credential')) userMessage = 'Research providers are being reconfigured. Please try again shortly.'

    log.error(`Pipeline failed: ${rawMessage}`, { requestId, failedStep, durationMs: elapsed() })

    // Save failure to Supabase (best-effort)
    try {
      const { getSupabaseAdmin } = await import('@/lib/supabase/admin')
      const sb = getSupabaseAdmin()
      if (sb) {
        await sb.from('failure_logs').insert({ request_id: requestId, failed_step: failedStep, error_message: rawMessage.slice(0, 500), metadata: { query, mode } })
      }
    } catch { /* non-critical */ }

    return errorResponse(502, userMessage, { retryable: true, failedStep, requestId })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const runId = searchParams.get('runId')

  if (!runId) {
    return errorResponse(400, 'runId query parameter is required')
  }

  const data = await getRunById(runId)
  if (!data) {
    return errorResponse(404, 'Run not found', { runId })
  }

  return NextResponse.json({ ok: true, ...rebuildResult(data) })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rebuildResult(data: { run: any; result: any }) {
  return {
    runId: data.run.run_id,
    query: data.run.query,
    mode: data.run.mode,
    status: data.run.status,
    pipelineSource: data.run.pipeline_source,
    confidenceScore: data.run.confidence_score,
    durationMs: data.run.duration_ms,
    createdAt: data.run.created_at,
    costBreakdown: data.run.cost_usd ? { model: 'gemini-2.0-flash', inputTokens: 0, outputTokens: 0, costUsd: data.run.cost_usd } : undefined,
    title: data.result?.title ?? data.run.query,
    executiveSummary: data.result?.executive_summary ?? '',
    findings: data.result?.findings ?? [],
    decisionRecommendations: data.result?.decision_recommendations ?? [],
    outline: data.result?.outline ?? [],
    stats: data.result?.stats ?? [],
    sources: data.result?.sources ?? [],
    evidenceItems: data.result?.evidence_items ?? [],
    contradictions: data.result?.contradictions ?? [],
    uncertaintyNotes: data.result?.uncertainty_notes ?? [],
    strategicFollowUps: data.result?.strategic_follow_ups ?? [],
  }
}
