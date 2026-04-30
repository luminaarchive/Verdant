// ─── OpenRouter Provider ────────────────────────────────────────────────────
// Primary provider. Routes to best available model via OpenRouter API.

import type { AIProvider, ProviderRequest, ProviderResponse } from './types'
import { log, timer } from '../research/logger'

// Cost per 1K tokens (approximate, varies by model)
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'google/gemini-2.0-flash-001': { input: 0.0001, output: 0.0004 },
  'google/gemini-2.5-flash-preview': { input: 0.00015, output: 0.0006 },
  'deepseek/deepseek-chat-v3-0324': { input: 0.0003, output: 0.0012 },
  'meta-llama/llama-4-maverick': { input: 0.0002, output: 0.0008 },
  'qwen/qwen3-235b-a22b': { input: 0.0002, output: 0.0008 },
}

// Mode → model mapping (quality + cost balance)
const MODE_MODELS: Record<string, string> = {
  focus: 'google/gemini-2.0-flash-001',         // fast + cheap
  deep: 'google/gemini-2.5-flash-preview',      // high quality
  analytica: 'deepseek/deepseek-chat-v3-0324',  // strong structured output
}

export class OpenRouterProvider implements AIProvider {
  name = 'openrouter'

  isConfigured(): boolean {
    return !!process.env.OPENROUTER_API_KEY
  }

  async call(req: ProviderRequest): Promise<ProviderResponse> {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured')

    const model = MODE_MODELS[req.mode] ?? MODE_MODELS.focus
    const elapsed = timer()

    log.step('openrouter', `Calling ${model}`, { pipelineSource: 'openrouter' })

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://verdantai.vercel.app',
        'X-Title': 'VerdantAI Research',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: req.systemPrompt },
          { role: 'user', content: req.userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 8192,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(req.timeoutMs ?? 45_000),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => 'no body')
      const err = new Error(`OpenRouter ${response.status}: ${errText.slice(0, 300)}`)
      ;(err as any).httpStatus = response.status
      throw err
    }

    const data = await response.json()
    const durationMs = elapsed()

    const content = data?.choices?.[0]?.message?.content
    if (!content) throw new Error('OpenRouter returned empty content')

    const usage = data?.usage ?? {}
    const inputTokens = usage.prompt_tokens ?? 0
    const outputTokens = usage.completion_tokens ?? 0
    const costs = MODEL_COSTS[model] ?? { input: 0.0002, output: 0.0008 }
    const estimatedCostUsd = (inputTokens / 1000) * costs.input + (outputTokens / 1000) * costs.output

    log.step('openrouter', `Response in ${durationMs}ms (${inputTokens}+${outputTokens} tokens)`, { durationMs })

    return {
      content,
      provider: 'openrouter',
      model,
      inputTokens,
      outputTokens,
      durationMs,
      estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)),
    }
  }
}
