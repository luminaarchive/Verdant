import { GeminiResearchResponseSchema, type ResearchResult, type CostBreakdown } from './schema'
import { callWithFailover } from '../ai/provider-manager'
import { getSystemInstruction, buildUserPrompt } from './prompt'
import { log, generateRunId, timer, type LogContext } from './logger'

export interface PipelineInput {
  query: string
  mode: 'focus' | 'deep' | 'analytica'
  requestId: string
  presetId?: string
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

function buildFallback(query: string, raw: string): unknown {
  return {
    title: `Research: ${query}`,
    executiveSummary: {
      whatMattersMost: raw.slice(0, 500),
      hiddenRisks: 'Unable to assess risks from unstructured response.',
      strategicImplications: 'Further structured analysis recommended.',
      recommendedNextAction: 'Retry with a more specific query for better results.',
      whyThisMattersNow: 'Initial research pass completed — quality verification needed.',
    },
    findings: [raw.slice(0, 500)],
    decisionRecommendations: [],
    outline: [{ heading: 'Overview', body: raw.slice(0, 1000) }],
    stats: [{ label: 'Source', value: 'AI Generated' }],
    sources: [{ title: 'AI Research Output' }],
    evidenceItems: [{ claim: query, evidence: raw.slice(0, 300), sourceIndex: 0, strength: 'moderate' }],
    contradictions: [],
    confidenceScore: 40,
    uncertaintyNotes: [{ uncertainty: 'Response generated from fallback path', reason: 'Primary AI output could not be parsed into structured format', whatWouldResolveIt: 'Retry the query or use a different research mode' }],
    strategicFollowUps: [`What are the strategic implications of ${query}?`],
  }
}

export async function runResearchPipeline(input: PipelineInput): Promise<PipelineOutput> {
  const runId = generateRunId()
  const elapsed = timer()
  const ctx: Partial<LogContext> = { requestId: input.requestId, runId }

  log.info('Pipeline started', ctx)
  log.step('prompt', 'Building prompt', ctx)
  const systemPrompt = getSystemInstruction(input.mode)
  const userPrompt = buildUserPrompt(input.query, input.mode, input.presetId)

  log.step('provider', 'Calling AI provider', ctx)
  const providerResult = await callWithFailover({ query: input.query, mode: input.mode, systemPrompt, userPrompt }, ctx)
  const { response, attempts } = providerResult

  log.step('parse', 'Parsing response JSON', ctx)
  let parsed: unknown
  try {
    parsed = extractJSON(response.content)
  } catch (e) {
    log.error(`JSON parse failed, using fallback: ${(e as Error).message}`, { ...ctx, failureStep: 'parse' })
    parsed = buildFallback(input.query, response.content)
  }

  log.step('validate', 'Validating schema', ctx)
  let data: any
  const validation = GeminiResearchResponseSchema.safeParse(parsed)
  if (!validation.success) {
    log.error('Schema validation failed, using fallback', { ...ctx, failureStep: 'validate' })
    const fallback = GeminiResearchResponseSchema.safeParse(buildFallback(input.query, response.content))
    if (!fallback.success) throw new Error('Both primary and fallback validation failed')
    data = fallback.data
  } else {
    data = validation.data
  }

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

  // Flag if this was a fallback parse
  if (!validation.success) {
    data.confidenceScore = Math.min(data.confidenceScore, 40)
  }

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

  log.info(`Pipeline complete via ${response.provider}/${response.model} | confidence=${auditedConfidence} sources=${sourceCount} evidence=${evidenceCount}`, { ...ctx, durationMs, pipelineSource })

  return {
    result,
    rawJson: response.content,
    providerAttempts: attempts.map(a => ({ provider: a.provider, error: a.error })),
  }
}
