import { GeminiResearchResponseSchema, type ResearchResult, type CostBreakdown } from './schema'
import { callWithFailover } from '../ai/provider-manager'
import { getSystemInstruction, buildUserPrompt } from './prompt'
import { log, generateRunId, timer, type LogContext } from './logger'

export interface PipelineInput {
  query: string
  mode: 'focus' | 'deep' | 'analytica'
  requestId: string
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
  const userPrompt = buildUserPrompt(input.query, input.mode)

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

  log.info(`Pipeline complete via ${response.provider}/${response.model}`, { ...ctx, durationMs, pipelineSource })

  return {
    result,
    rawJson: response.content,
    providerAttempts: attempts.map(a => ({ provider: a.provider, error: a.error })),
  }
}
