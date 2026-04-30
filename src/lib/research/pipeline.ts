// ─── Core Research Pipeline (v2 — Provider-Agnostic) ────────────────────────
// Orchestrates: prompt → provider-manager → Zod validation → enrichment → result
// No longer hardcoded to Gemini. Uses provider abstraction layer.

import { GeminiResearchResponseSchema, type ResearchResult, type CostBreakdown } from './schema'
import { callWithFailover, ProviderExhaustedError } from '../ai/provider-manager'
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

export async function runResearchPipeline(input: PipelineInput): Promise<PipelineOutput> {
  const runId = generateRunId()
  const elapsed = timer()
  const ctx: Partial<LogContext> = { requestId: input.requestId, runId }

  log.info('Pipeline started', ctx)

  // ─── Step 1: Build prompt ───────────────────────────────────────────────
  log.step('prompt', 'Building prompt', ctx)
  const systemPrompt = getSystemInstruction(input.mode)
  const userPrompt = buildUserPrompt(input.query, input.mode)

  // ─── Step 2: Call provider (with failover) ──────────────────────────────
  log.step('provider', 'Calling AI provider', ctx)
  const providerResult = await callWithFailover({
    query: input.query,
    mode: input.mode,
    systemPrompt,
    userPrompt,
  }, ctx)

  const { response, attempts } = providerResult

  // ─── Step 3: Parse JSON ─────────────────────────────────────────────────
  log.step('parse', 'Parsing response JSON', ctx)
  let parsed: unknown
  try {
    let content = response.content.trim()
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }
    parsed = JSON.parse(content)
  } catch (e) {
    log.error(`JSON parse failed: ${(e as Error).message}`, { ...ctx, failureStep: 'parse' })
    throw new Error(`Provider returned invalid JSON: ${(e as Error).message}`)
  }

  // ─── Step 4: Validate with Zod ──────────────────────────────────────────
  log.step('validate', 'Validating schema with Zod', ctx)
  const validation = GeminiResearchResponseSchema.safeParse(parsed)

  if (!validation.success) {
    const issues = validation.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')
    log.error(`Schema validation failed: ${issues}`, { ...ctx, failureStep: 'validate' })
    throw new Error(`Response schema validation failed: ${issues}`)
  }

  const data = validation.data

  // ─── Step 5: Assemble result ────────────────────────────────────────────
  const durationMs = elapsed()
  const costBreakdown: CostBreakdown = {
    model: response.model,
    inputTokens: response.inputTokens,
    outputTokens: response.outputTokens,
    costUsd: response.estimatedCostUsd,
  }

  const pipelineSource = response.provider === 'openrouter' ? 'openrouter' as const
    : response.provider === 'gemini' ? 'gemini-direct' as const
    : 'gemini-direct' as const

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

  log.info(`Pipeline complete via ${response.provider}/${response.model}`, {
    ...ctx,
    durationMs,
    pipelineSource,
  })

  log.metric('research_complete', {
    ...ctx,
    durationMs,
    provider: response.provider,
    model: response.model,
    inputTokens: response.inputTokens,
    outputTokens: response.outputTokens,
    costUsd: response.estimatedCostUsd,
    mode: input.mode,
    confidenceScore: data.confidenceScore,
    sourceCount: data.sources.length,
    findingsCount: data.findings.length,
    failoverAttempts: attempts.length,
  })

  return {
    result,
    rawJson: response.content,
    providerAttempts: attempts.map(a => ({ provider: a.provider, error: a.error })),
  }
}
