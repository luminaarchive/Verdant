// ─── Core Research Pipeline ─────────────────────────────────────────────────
// Orchestrates: prompt → Gemini → Zod validation → enrichment → result
// This is the heart of VerdantAI's backend.

import { GeminiResearchResponseSchema, type ResearchResult, type CostBreakdown } from './schema'
import { callGemini } from './gemini'
import { getSystemInstruction, buildUserPrompt } from './prompt'
import { log, generateRunId, timer, type LogContext } from './logger'

// Gemini pricing (approximate, per 1K tokens) — for cost visibility
const COST_PER_1K_INPUT = 0.000075   // Gemini 2.0 Flash
const COST_PER_1K_OUTPUT = 0.0003

export interface PipelineInput {
  query: string
  mode: 'focus' | 'deep' | 'analytica'
  requestId: string
}

export interface PipelineOutput {
  result: ResearchResult
  rawJson: string
}

export async function runResearchPipeline(input: PipelineInput): Promise<PipelineOutput> {
  const runId = generateRunId()
  const elapsed = timer()
  const ctx: Partial<LogContext> = {
    requestId: input.requestId,
    runId,
    pipelineSource: 'gemini-direct',
  }

  log.info('Pipeline started', ctx)

  // ─── Step 1: Build prompt ───────────────────────────────────────────────
  log.step('prompt', 'Building prompt', ctx)
  const systemInstruction = getSystemInstruction(input.mode)
  const userPrompt = buildUserPrompt(input.query, input.mode)

  // ─── Step 2: Call Gemini ────────────────────────────────────────────────
  log.step('gemini', 'Calling Gemini API', ctx)
  const geminiResult = await callGemini(userPrompt, systemInstruction, ctx)

  // ─── Step 3: Parse JSON ─────────────────────────────────────────────────
  log.step('parse', 'Parsing Gemini response JSON', ctx)
  let parsed: unknown
  try {
    // Clean the response in case Gemini wraps it in markdown
    let content = geminiResult.content.trim()
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }
    parsed = JSON.parse(content)
  } catch (e) {
    log.error(`JSON parse failed: ${(e as Error).message}`, { ...ctx, failureStep: 'parse' })
    throw new Error(`Gemini returned invalid JSON. Parse error: ${(e as Error).message}`)
  }

  // ─── Step 4: Validate with Zod ──────────────────────────────────────────
  log.step('validate', 'Validating response schema with Zod', ctx)
  const validation = GeminiResearchResponseSchema.safeParse(parsed)

  if (!validation.success) {
    const issues = validation.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')
    log.error(`Schema validation failed: ${issues}`, { ...ctx, failureStep: 'validate' })
    throw new Error(`Response schema validation failed: ${issues}`)
  }

  const data = validation.data

  // ─── Step 5: Compute cost ───────────────────────────────────────────────
  log.step('cost', 'Computing cost breakdown', ctx)
  const costBreakdown: CostBreakdown = {
    model: geminiResult.model,
    inputTokens: geminiResult.inputTokens,
    outputTokens: geminiResult.outputTokens,
    costUsd: Number(
      (
        (geminiResult.inputTokens / 1000) * COST_PER_1K_INPUT +
        (geminiResult.outputTokens / 1000) * COST_PER_1K_OUTPUT
      ).toFixed(6)
    ),
  }

  // ─── Step 6: Assemble result ────────────────────────────────────────────
  const durationMs = elapsed()
  const result: ResearchResult = {
    ...data,
    runId,
    query: input.query,
    mode: input.mode,
    pipelineSource: 'gemini-direct',
    costBreakdown,
    createdAt: new Date().toISOString(),
    status: 'ready',
    durationMs,
  }

  log.info(`Pipeline complete`, {
    ...ctx,
    durationMs,
    sourceCount: data.sources.length,
    confidenceScore: data.confidenceScore,
    costUsd: costBreakdown.costUsd,
  })

  log.metric('research_complete', {
    ...ctx,
    durationMs,
    inputTokens: geminiResult.inputTokens,
    outputTokens: geminiResult.outputTokens,
    costUsd: costBreakdown.costUsd,
    mode: input.mode,
    confidenceScore: data.confidenceScore,
    sourceCount: data.sources.length,
    findingsCount: data.findings.length,
  })

  return {
    result,
    rawJson: geminiResult.content,
  }
}
