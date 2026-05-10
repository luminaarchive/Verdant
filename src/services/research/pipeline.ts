import { GeminiResearchResponseSchema, type ResearchResult, type CostBreakdown } from '@/lib/research/schema'
import { callWithFailover } from '../ai/provider-manager'
import { getSystemInstruction, buildUserPrompt } from './prompt'
import { log, generateRunId, timer, type LogContext } from '@/lib/research/logger'

export interface PipelineInput {
  query: string
  mode: 'focus' | 'deep' | 'analytica'
  requestId: string
  presetId?: string
  runId?: string
  context?: string
}

export interface PipelineOutput {
  result: ResearchResult
  rawJson: string
  providerAttempts: { provider: string; error?: string }[]
}

function extractJSON(raw: string): unknown {
  let content = raw.trim()
  // Strip BOM and zero-width chars
  content = content.replace(/^\uFEFF/, '').replace(/[\u200B-\u200D\uFEFF]/g, '')
  // Strip markdown fenced code blocks (```json ... ``` or ``` ... ```)
  content = content.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```\s*$/i, '')
  content = content.trim()
  // Try direct parse first
  try { return JSON.parse(content) } catch {}
  // Try to find the outermost JSON object using bracket matching
  const start = content.indexOf('{')
  if (start !== -1) {
    let depth = 0
    let end = -1
    for (let i = start; i < content.length; i++) {
      if (content[i] === '{') depth++
      else if (content[i] === '}') { depth--; if (depth === 0) { end = i; break } }
    }
    if (end !== -1) {
      try { return JSON.parse(content.slice(start, end + 1)) } catch {}
    }
  }
  // Fallback: greedy regex
  const match = content.match(/\{[\s\S]*\}/)
  if (match) { try { return JSON.parse(match[0]) } catch {} }
  throw new Error('No valid JSON found in response')
}

export async function runResearchPipeline(input: PipelineInput): Promise<PipelineOutput> {
  const runId = input.runId ?? generateRunId()
  const elapsed = timer()
  const ctx: Partial<LogContext> = { requestId: input.requestId, runId }

  log.info('Pipeline started', ctx)
  log.step('prompt', 'Building prompt', ctx)
  const systemPrompt = getSystemInstruction(input.mode)
  const userPrompt = buildUserPrompt(input.query, input.mode, input.presetId, input.context)

  log.step('provider', 'Calling AI provider', ctx)
  const providerResult = await callWithFailover({ query: input.query, mode: input.mode, systemPrompt, userPrompt }, ctx)
  const { response, attempts } = providerResult

  log.step('parse', `Parsing response JSON (content_length=${response.content.length})`, ctx)
  let parsed: unknown
  let isRawFallback = false
  try {
    parsed = extractJSON(response.content)
  } catch (e) {
    log.warn(`JSON parse failed, using raw text fallback: ${(e as Error).message}. Content preview: ${response.content.slice(0, 200)}`, { ...ctx, failureStep: 'parse' })
    // Raw text fallback — the AI returned coherent text but not valid JSON.
    // Wrap it in a minimal result so the frontend can display it via RawResult.
    isRawFallback = true
    parsed = null
  }

  log.step('validate', 'Validating schema', ctx)

  // ─── RAW TEXT FALLBACK PATH ─────────────────────────────────────────
  // If JSON parsing failed, the AI returned coherent text but not structured JSON.
  // We wrap it in a minimal ResearchResult with the 'raw' field. The frontend's
  // RawResult component will render this as a formatted text report.
  if (isRawFallback || parsed === null) {
    const durationMs = elapsed()
    const pipelineSource = response.provider === 'openrouter' ? 'openrouter' as const : 'gemini-direct' as const
    log.info(`Pipeline complete (raw fallback) via ${response.provider}/${response.model} | ${durationMs}ms`, { ...ctx, durationMs, pipelineSource })

    const rawResult: any = {
      title: input.query,
      raw: response.content,
      executiveSummary: null,
      findings: [],
      outline: [],
      stats: [],
      sources: [],
      evidenceItems: [],
      contradictions: [],
      confidenceScore: 30,
      uncertaintyNotes: [],
      strategicFollowUps: [],
      decisionRecommendations: [],
      runId,
      query: input.query,
      mode: input.mode,
      pipelineSource,
      costBreakdown: {
        model: response.model,
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
        costUsd: response.estimatedCostUsd,
      },
      createdAt: new Date().toISOString(),
      status: 'ready',
      durationMs,
    }

    return {
      result: rawResult,
      rawJson: response.content,
      providerAttempts: attempts.map(a => ({ provider: a.provider, error: a.error })),
    }
  }

  // ─── STRUCTURED JSON PATH ──────────────────────────────────────────
  const validation = GeminiResearchResponseSchema.safeParse(parsed)
  if (!validation.success) {
    const issues = validation.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
    log.warn(`Schema validation failed, falling back to raw text: ${issues}`, { ...ctx, failureStep: 'validate' })
    
    // Schema validation failed — try to use whatever we parsed + raw text
    const durationMs = elapsed()
    const pipelineSource = response.provider === 'openrouter' ? 'openrouter' as const : 'gemini-direct' as const
    const partial = parsed as any
    const rawResult: any = {
      title: partial?.title || input.query,
      raw: response.content,
      executiveSummary: partial?.executiveSummary || null,
      findings: Array.isArray(partial?.findings) ? partial.findings : [],
      outline: Array.isArray(partial?.outline) ? partial.outline : [],
      stats: Array.isArray(partial?.stats) ? partial.stats : [],
      sources: Array.isArray(partial?.sources) ? partial.sources : [],
      evidenceItems: Array.isArray(partial?.evidenceItems) ? partial.evidenceItems : [],
      contradictions: Array.isArray(partial?.contradictions) ? partial.contradictions : [],
      confidenceScore: typeof partial?.confidenceScore === 'number' ? partial.confidenceScore : 30,
      uncertaintyNotes: Array.isArray(partial?.uncertaintyNotes) ? partial.uncertaintyNotes : [],
      strategicFollowUps: Array.isArray(partial?.strategicFollowUps) ? partial.strategicFollowUps : [],
      decisionRecommendations: Array.isArray(partial?.decisionRecommendations) ? partial.decisionRecommendations : [],
      runId,
      query: input.query,
      mode: input.mode,
      pipelineSource,
      costBreakdown: {
        model: response.model,
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
        costUsd: response.estimatedCostUsd,
      },
      createdAt: new Date().toISOString(),
      status: 'ready',
      durationMs,
    }

    return {
      result: rawResult,
      rawJson: response.content,
      providerAttempts: attempts.map(a => ({ provider: a.provider, error: a.error })),
    }
  }

  let data = validation.data
  
  // ─── STAGE 2: Outline Expansion — DISABLED FOR STABILITY ──────────
  // The continuation system (expandWithContinuation + Promise.all batching)
  // is temporarily disabled. It was causing:
  //   1. Timeout budget exhaustion (each expansion = another full AI call)
  //   2. Promise.all memory spikes on Vercel serverless
  //   3. Cascading failures when one expansion times out
  //
  // The outline sections will contain the short summaries from the initial
  // AI response. Re-enable once single-call generation is fully stable.
  //
  // if (input.mode === 'deep' || input.mode === 'analytica') {
  //   if (data.outline && data.outline.length > 0) {
  //     ... expansion logic ...
  //   }
  // }

  // ─── Quality Audit: mode-aware confidence calibration ───────────────
  log.step('audit', 'Quality audit — mode-aware confidence calibration', ctx)
  const sourceCount = Array.isArray(data.sources) ? data.sources.length : 0
  const evidenceCount = Array.isArray(data.evidenceItems) ? data.evidenceItems.length : 0
  const findingCount = Array.isArray(data.findings) ? data.findings.length : 0
  const outlineCount = Array.isArray(data.outline) ? data.outline.length : 0
  const recCount = Array.isArray(data.decisionRecommendations) ? data.decisionRecommendations.length : 0
  const hasContradictions = Array.isArray(data.contradictions) && data.contradictions.length > 0
  const uncertaintyCount = Array.isArray(data.uncertaintyNotes) ? data.uncertaintyNotes.length : 0
  let auditedConfidence = typeof data.confidenceScore === 'number' ? data.confidenceScore : 50

  // ── Universal evidence-thin penalties ──
  if (sourceCount <= 1) auditedConfidence = Math.min(auditedConfidence, 35)
  else if (sourceCount <= 2) auditedConfidence = Math.min(auditedConfidence, 55)

  if (evidenceCount <= 1) auditedConfidence = Math.min(auditedConfidence, 40)
  else if (evidenceCount <= 2) auditedConfidence = Math.min(auditedConfidence, 60)

  // No uncertainty = likely over-confident
  if (uncertaintyCount === 0 && auditedConfidence > 80) auditedConfidence = Math.min(auditedConfidence, 75)

  // Contradictions reduce confidence (honest signal)
  if (hasContradictions) auditedConfidence = Math.min(auditedConfidence, 70)

  // ── Mode-specific depth enforcement ──
  const modeMinimums = {
    focus:     { sources: 3, evidence: 3, findings: 4, outline: 3, recs: 2 },
    deep:      { sources: 5, evidence: 5, findings: 6, outline: 5, recs: 3 },
    analytica: { sources: 6, evidence: 6, findings: 8, outline: 8, recs: 4 },
  }
  const mins = modeMinimums[input.mode] ?? modeMinimums.focus
  let depthPenalty = 0
  if (sourceCount < mins.sources) depthPenalty += 5
  if (evidenceCount < mins.evidence) depthPenalty += 5
  if (findingCount < mins.findings) depthPenalty += 3
  if (outlineCount < mins.outline) depthPenalty += 3
  if (recCount < mins.recs) depthPenalty += 4
  auditedConfidence = Math.max(10, auditedConfidence - depthPenalty)

  data.confidenceScore = auditedConfidence

  log.info(`Quality audit: mode=${input.mode} sources=${sourceCount}/${mins.sources} evidence=${evidenceCount}/${mins.evidence} findings=${findingCount}/${mins.findings} outline=${outlineCount}/${mins.outline} recs=${recCount}/${mins.recs} depthPenalty=${depthPenalty} confidence=${data.confidenceScore}`, ctx)

  const durationMs = elapsed()
  const costBreakdown: CostBreakdown = {
    model: response.model,
    inputTokens: response.inputTokens,
    outputTokens: response.outputTokens,
    costUsd: response.estimatedCostUsd,
  }

  const pipelineSource = response.provider === 'openrouter' ? 'openrouter' as const : 'gemini-direct' as const

  const result: ResearchResult = {
    ...data,
    runId,
    query: input.query,
    mode: input.mode,
    pipelineSource,
    costBreakdown,
    createdAt: new Date().toISOString(),
    status: 'ready',
    durationMs,
  }

  log.info(`Pipeline complete via ${response.provider}/${response.model} | confidence=${auditedConfidence} sources=${sourceCount} evidence=${evidenceCount} | ${durationMs}ms`, { ...ctx, durationMs, pipelineSource })

  return {
    result,
    rawJson: response.content,
    providerAttempts: attempts.map(a => ({ provider: a.provider, error: a.error })),
  }
}
