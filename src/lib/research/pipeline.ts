import { GeminiResearchResponseSchema, type ResearchResult, type CostBreakdown } from './schema'
import { callWithFailover } from '../ai/provider-manager'
import { getSystemInstruction, buildUserPrompt, buildExpansionPrompt, buildContinuationPrompt } from './prompt'
import { log, generateRunId, timer, type LogContext } from './logger'

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

function isValidOutput(text: string): boolean {
  if (!text) return false
  if (text.length < 500) return false
  return true
}

async function expandWithContinuation(heading: string, query: string, ctx: Partial<LogContext>): Promise<string> {
  log.step('expand', `Expanding section: ${heading}`, ctx)
  const prompt = buildExpansionPrompt(heading, query)
  const sysPrompt = 'You are an academic environmental researcher producing a formal research report. Output plain text only. No markdown, no JSON, no headers, no bullet points.'
  
  let resultText = ''
  try {
    const res1 = await callWithFailover({ query, mode: 'focus', systemPrompt: sysPrompt, userPrompt: prompt }, ctx)
    resultText = res1.response.content.trim()
    
    // Auto-continue if section is too short (target: 1000-2000 words ≈ 5000-10000 chars)
    // First continuation: if under ~330 words
    if (resultText.length < 2000) {
      log.step('expand', `Auto-continuing short section (${resultText.length} chars): ${heading}`, ctx)
      const contPrompt = buildContinuationPrompt()
      const res2 = await callWithFailover({ 
        query, 
        mode: 'focus', 
        systemPrompt: sysPrompt, 
        userPrompt: `${prompt}\n\nPrevious text (last part):\n${resultText.slice(-500)}\n\n${contPrompt}`
      }, ctx)
      resultText += '\n\n' + res2.response.content.trim()
    }
    
    // Second continuation: if still under ~660 words after first continuation
    if (resultText.length < 4000) {
      log.step('expand', `Second continuation (${resultText.length} chars): ${heading}`, ctx)
      const contPrompt = buildContinuationPrompt()
      const res3 = await callWithFailover({ 
        query, 
        mode: 'focus', 
        systemPrompt: sysPrompt, 
        userPrompt: `${prompt}\n\nPrevious text (last part):\n${resultText.slice(-500)}\n\n${contPrompt}`
      }, ctx)
      resultText += '\n\n' + res3.response.content.trim()
    }
  } catch (err) {
    log.error(`Expansion failed for ${heading}: ${(err as Error).message}`, ctx)
    if (!resultText) resultText = "Analysis temporarily unavailable for this section."
  }
  
  return resultText
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

  log.step('parse', 'Parsing response JSON', ctx)
  let parsed: unknown
  try {
    parsed = extractJSON(response.content)
  } catch (e) {
    log.error(`JSON parse failed: ${(e as Error).message}`, { ...ctx, failureStep: 'parse' })
    throw new Error('Gagal memproses hasil AI. Output tidak valid (JSON parse error).')
  }

  log.step('validate', 'Validating schema', ctx)
  const validation = GeminiResearchResponseSchema.safeParse(parsed)
  if (!validation.success) {
    log.error('Schema validation failed', { ...ctx, failureStep: 'validate' })
    throw new Error(`Validasi hasil gagal: ${validation.error.issues.map(i => i.message).join(', ')}`)
  }
  let data = validation.data
  
  // ─── STAGE 2: Outline Expansion (Loop) ───────────────
  if (input.mode === 'deep' || input.mode === 'analytica') {
    if (data.outline && data.outline.length > 0) {
      log.step('expand_loop', `Starting expansion for ${data.outline.length} sections (batched)`, ctx)
      const batchSize = 3
      for (let i = 0; i < data.outline.length; i += batchSize) {
        const batch = data.outline.slice(i, i + batchSize)
        await Promise.all(batch.map(async (section: any) => {
          section.body = await expandWithContinuation(section.heading, input.query, ctx)
        }))
      }
    }
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
