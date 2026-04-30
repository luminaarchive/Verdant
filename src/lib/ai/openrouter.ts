import type { AIProvider, ProviderRequest, ProviderResponse } from './types'
import { log, timer } from '../research/logger'

const MODE_MODELS: Record<string, string> = {
  focus: 'openai/gpt-oss-20b:free',
  deep: 'openai/gpt-oss-120b:free',
  analytica: 'nvidia/nemotron-3-nano-30b-a3b:free',
}

const MODE_MAX_TOKENS: Record<string, number> = {
  focus: 4096,
  deep: 6144,
  analytica: 8192,
}

const MODE_TIMEOUT: Record<string, number> = {
  focus: 45_000,
  deep: 55_000,
  analytica: 55_000,
}

export class OpenRouterProvider implements AIProvider {
  name = 'openrouter'
  isConfigured(): boolean { return !!process.env.OPENROUTER_API_KEY }
  async call(req: ProviderRequest): Promise<ProviderResponse> {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured')
    const model = MODE_MODELS[req.mode] ?? MODE_MODELS.focus
    const elapsed = timer()
    const maxTokens = MODE_MAX_TOKENS[req.mode] ?? 4096
    const timeoutMs = req.timeoutMs ?? (MODE_TIMEOUT[req.mode] ?? 55_000)
    log.step('openrouter', `Calling ${model} (max_tokens=${maxTokens})`, { pipelineSource: 'openrouter' })
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://verdantai.vercel.app', 'X-Title': 'VerdantAI Research' },
      body: JSON.stringify({ model, messages: [{ role: 'system', content: req.systemPrompt }, { role: 'user', content: req.userPrompt }], temperature: 0.3, max_tokens: maxTokens }),
      signal: AbortSignal.timeout(timeoutMs),
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
