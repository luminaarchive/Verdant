import type { AIProvider, ProviderRequest, ProviderResponse } from './types'
import { log, timer } from '../research/logger'

const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'google/gemma-3-4b-it:free': { input: 0, output: 0 },
  'google/gemma-3-12b-it:free': { input: 0, output: 0 },
  'meta-llama/llama-4-scout:free': { input: 0, output: 0 },
}

const MODE_MODELS: Record<string, string> = {
  focus: 'google/gemma-3-4b-it:free',
  deep: 'google/gemma-3-12b-it:free',
  analytica: 'meta-llama/llama-4-scout:free',
}

export class OpenRouterProvider implements AIProvider {
  name = 'openrouter'
  isConfigured(): boolean { return !!process.env.OPENROUTER_API_KEY }
  async call(req: ProviderRequest): Promise<ProviderResponse> {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured')
    const model = MODE_MODELS[req.mode] ?? MODE_MODELS.focus
    const elapsed = timer()
    log.step('openrouter', `Calling ${model}`, { pipelineSource: 'openrouter' })
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://verdantai.vercel.app', 'X-Title': 'VerdantAI Research' },
      body: JSON.stringify({ model, messages: [{ role: 'system', content: req.systemPrompt }, { role: 'user', content: req.userPrompt }], temperature: 0.3, max_tokens: 4096 }),
      signal: AbortSignal.timeout(req.timeoutMs ?? 45_000),
    })
    if (!response.ok) { const errText = await response.text().catch(() => 'no body'); const err = new Error(`OpenRouter ${response.status}: ${errText.slice(0, 300)}`); (err as any).httpStatus = response.status; throw err }
    const data = await response.json()
    const durationMs = elapsed()
    const content = data?.choices?.[0]?.message?.content
    if (!content) throw new Error('OpenRouter returned empty content')
    const usage = data?.usage ?? {}
    log.step('openrouter', `Response in ${durationMs}ms`, { durationMs })
    return { content, provider: 'openrouter', model, inputTokens: usage.prompt_tokens ?? 0, outputTokens: usage.completion_tokens ?? 0, durationMs, estimatedCostUsd: 0 }
  }
}
