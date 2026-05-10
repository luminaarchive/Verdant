import type { AIProvider, ProviderRequest, ProviderResponse } from './types'
import { log, timer } from '../research/logger'

// Model fallback chains per mode — reliable models first, free fallbacks last
const MODE_MODELS: Record<string, string[]> = {
  focus: [
    'anthropic/claude-3-haiku',
    'anthropic/claude-3.5-haiku',
    'meta-llama/llama-3.1-8b-instruct:free',
    'mistralai/mistral-7b-instruct:free',
  ],
  deep: [
    'anthropic/claude-3.5-sonnet',
    'anthropic/claude-3-haiku',
    'meta-llama/llama-3.1-8b-instruct:free',
    'mistralai/mistral-7b-instruct:free',
  ],
  analytica: [
    'anthropic/claude-3.5-sonnet',
    'anthropic/claude-3-haiku',
    'meta-llama/llama-3.1-8b-instruct:free',
    'mistralai/mistral-7b-instruct:free',
  ],
}

const MODE_MAX_TOKENS: Record<string, number> = {
  focus: 4096,
  deep: 6144,
  analytica: 8192,
}

const MODE_TIMEOUT: Record<string, number> = {
  focus: 60_000,
  deep: 90_000,
  analytica: 120_000,
}

export class OpenRouterProvider implements AIProvider {
  name = 'openrouter'

  isConfigured(): boolean { return !!process.env.OPENROUTER_API_KEY }

  async call(req: ProviderRequest): Promise<ProviderResponse> {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured')

    const models = MODE_MODELS[req.mode] ?? MODE_MODELS.focus
    const maxTokens = MODE_MAX_TOKENS[req.mode] ?? 4096
    const timeoutMs = req.timeoutMs ?? (MODE_TIMEOUT[req.mode] ?? 60_000)
    const elapsed = timer()

    // Try each model in the fallback chain
    const errors: string[] = []
    for (const model of models) {
      try {
        console.log(`[openrouter] Trying model: ${model} (mode=${req.mode}, max_tokens=${maxTokens})`)
        log.step('openrouter', `Calling ${model} (max_tokens=${maxTokens})`, { pipelineSource: 'openrouter' })

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://verdantai.vercel.app',
            'X-Title': 'Verdant Environmental Research',
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
          const msg = `OpenRouter ${response.status} [${model}]: ${errText.slice(0, 200)}`
          console.error(`[openrouter] ${msg}`)
          errors.push(msg)
          continue // try next model
        }

        const data = await response.json()
        const durationMs = elapsed()
        const content = data?.choices?.[0]?.message?.content

        if (!content) {
          const msg = `Model ${model} returned empty content`
          console.error(`[openrouter] ${msg}`)
          errors.push(msg)
          continue
        }

        const usage = data?.usage ?? {}
        console.log(`[openrouter] Success with ${model} in ${durationMs}ms, content length: ${content.length}`)
        log.step('openrouter', `Response from ${model} in ${durationMs}ms`, { durationMs })

        return {
          content,
          provider: 'openrouter',
          model,
          inputTokens: usage.prompt_tokens ?? 0,
          outputTokens: usage.completion_tokens ?? 0,
          durationMs,
          estimatedCostUsd: 0,
        }

      } catch (err) {
        const msg = `Model ${model} error: ${err instanceof Error ? err.message : String(err)}`
        console.error(`[openrouter] ${msg}`)
        errors.push(msg)
        continue
      }
    }

    // All models failed
    const fullError = `All OpenRouter models failed. Errors:\n${errors.join('\n')}`
    console.error(`[openrouter] ${fullError}`)
    throw new Error(fullError)
  }
}
