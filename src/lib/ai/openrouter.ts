// ─── OpenRouter Provider (Primary) ──────────────────────────────────────────
// Routes through OpenRouter to access Claude, GPT, and other premium models.
// Primary provider for Deep and Analytica modes.

import type { AIProvider, ProviderRequest, ProviderResponse } from './types'
import { log, timer } from '../research/logger'

// ─── Model selection per mode ───────────────────────────────────────────────
// Focus: fast, cost-effective model
// Deep: Claude Sonnet for thorough research
// Analytica: Claude Opus for journal-grade depth
const MODE_MODELS: Record<string, string> = {
  focus: 'anthropic/claude-sonnet-4-5',
  deep: 'anthropic/claude-sonnet-4-5',
  analytica: 'anthropic/claude-opus-4',
}

// Max tokens scaled per mode for target page counts
const MODE_MAX_TOKENS: Record<string, number> = {
  focus: 8192,       // 5-8 pages (~2-3K words)
  deep: 16384,       // 10-15 pages (~4-6K words)
  analytica: 32768,  // 20-30 pages (~8-12K words)
}

// Timeouts scaled per mode complexity
const MODE_TIMEOUT: Record<string, number> = {
  focus: 60_000,      // 1 minute
  deep: 180_000,      // 3 minutes
  analytica: 600_000, // 10 minutes
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
    const maxTokens = MODE_MAX_TOKENS[req.mode] ?? 8192
    const timeoutMs = req.timeoutMs ?? (MODE_TIMEOUT[req.mode] ?? 60_000)
    const elapsed = timer()

    log.step('openrouter', `Calling ${model} (max_tokens=${maxTokens}, timeout=${timeoutMs}ms)`, { pipelineSource: 'openrouter' })

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
        max_tokens: maxTokens,
      }),
      signal: AbortSignal.timeout(timeoutMs),
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

    log.step('openrouter', `Response in ${durationMs}ms (${inputTokens}+${outputTokens} tokens, model=${model})`, { durationMs })

    return {
      content,
      provider: 'openrouter',
      model,
      inputTokens,
      outputTokens,
      durationMs,
      estimatedCostUsd: 0,
    }
  }
}
