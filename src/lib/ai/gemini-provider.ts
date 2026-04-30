// ─── Gemini Provider (Secondary) ────────────────────────────────────────────
// Fallback provider. Uses Gemini REST API directly.

import type { AIProvider, ProviderRequest, ProviderResponse } from './types'
import { log, timer } from '../research/logger'

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const MODEL = 'gemini-2.0-flash'
const COST_INPUT = 0.000075
const COST_OUTPUT = 0.0003

export class GeminiProvider implements AIProvider {
  name = 'gemini'

  isConfigured(): boolean {
    return !!process.env.GEMINI_API_KEY
  }

  async call(req: ProviderRequest): Promise<ProviderResponse> {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured')

    const elapsed = timer()
    log.step('gemini', `Calling ${MODEL}`, { pipelineSource: 'gemini-direct' })

    const response = await fetch(`${GEMINI_BASE}/${MODEL}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: req.systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: req.userPrompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
          maxOutputTokens: 8192,
        },
      }),
      signal: AbortSignal.timeout(req.timeoutMs ?? 45_000),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => 'no body')
      const err = new Error(`Gemini ${response.status}: ${errText.slice(0, 300)}`)
      ;(err as any).httpStatus = response.status
      throw err
    }

    const data = await response.json()
    const durationMs = elapsed()

    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!content) throw new Error('Gemini returned empty content')

    const usage = data?.usageMetadata ?? {}
    const inputTokens = usage.promptTokenCount ?? 0
    const outputTokens = usage.candidatesTokenCount ?? 0
    const estimatedCostUsd = (inputTokens / 1000) * COST_INPUT + (outputTokens / 1000) * COST_OUTPUT

    log.step('gemini', `Response in ${durationMs}ms (${inputTokens}+${outputTokens} tokens)`, { durationMs })

    return {
      content,
      provider: 'gemini',
      model: MODEL,
      inputTokens,
      outputTokens,
      durationMs,
      estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)),
    }
  }
}
