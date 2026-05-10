// ─── Gemini Provider (Secondary) ────────────────────────────────────────────
// Fallback provider. Uses Gemini REST API directly.
// Tries multiple API key env vars in sequence — if one is quota-exhausted, tries the next.

import type { AIProvider, ProviderRequest, ProviderResponse } from './types'
import { log, timer } from '@/lib/research/logger'

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const MODEL = 'gemini-2.0-flash'
const COST_INPUT = 0.000075
const COST_OUTPUT = 0.0003

// All possible env var names for Gemini API keys
const GEMINI_KEY_VARS = ['GEMINI_API_KEY', 'GOOGLE_AI_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY']

function getAvailableKeys(): string[] {
  return GEMINI_KEY_VARS
    .map(name => process.env[name]?.trim())
    .filter((key): key is string => !!key && key.length > 0)
    // Deduplicate (in case multiple env vars point to same key)
    .filter((key, idx, arr) => arr.indexOf(key) === idx)
}

export class GeminiProvider implements AIProvider {
  name = 'gemini'

  isConfigured(): boolean {
    return getAvailableKeys().length > 0
  }

  async call(req: ProviderRequest): Promise<ProviderResponse> {
    const keys = getAvailableKeys()
    if (keys.length === 0) throw new Error('No Gemini API key configured')

    const errors: string[] = []

    for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
      const apiKey = keys[keyIdx]
      const elapsed = timer()
      const keyLabel = `key_${keyIdx + 1}/${keys.length}`

      log.step('gemini', `Calling ${MODEL} (${keyLabel})`, { pipelineSource: 'gemini-direct' })
      console.log(`[gemini] Trying ${MODEL} with ${keyLabel}, prefix=${apiKey.slice(0, 8)}...`)

      const controller = new AbortController()
      const timeoutMs = req.timeoutMs ?? 18_000
      const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs)

      try {
        const response = await fetch(`${GEMINI_BASE}/${MODEL}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: req.systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: req.userPrompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 4000,
            },
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutHandle)

        if (!response.ok) {
          const errText = await response.text().catch(() => 'no body')
          const msg = `Gemini ${response.status} (${keyLabel}): ${errText.slice(0, 200)}`
          console.error(`[gemini] ${msg}`)
          errors.push(msg)

          // 429 quota exhausted — try next key
          if (response.status === 429) {
            console.warn(`[gemini] Key ${keyLabel} quota exhausted, trying next key...`)
            continue
          }

          // Other errors — throw immediately (don't waste time on other keys)
          const err = new Error(msg)
          ;(err as any).httpStatus = response.status
          throw err
        }

        // Safe response parsing
        const text = await response.text().catch(() => '')
        if (!text || !text.trim()) {
          errors.push(`Gemini (${keyLabel}) returned empty response body`)
          continue
        }

        let data: any
        try {
          data = JSON.parse(text)
        } catch {
          errors.push(`Gemini (${keyLabel}) returned non-JSON: ${text.slice(0, 100)}`)
          continue
        }

        const durationMs = elapsed()
        const content = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (!content) {
          errors.push(`Gemini (${keyLabel}) returned empty content`)
          continue
        }

        const usage = data?.usageMetadata ?? {}
        const inputTokens = usage.promptTokenCount ?? 0
        const outputTokens = usage.candidatesTokenCount ?? 0
        const estimatedCostUsd = (inputTokens / 1000) * COST_INPUT + (outputTokens / 1000) * COST_OUTPUT

        console.log(`[gemini] ✓ Success with ${MODEL} (${keyLabel}) in ${durationMs}ms, tokens=${inputTokens}+${outputTokens}`)
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

      } catch (err) {
        clearTimeout(timeoutHandle)
        if (err instanceof Error && (err.name === 'AbortError' || err.message.includes('abort'))) {
          errors.push(`Gemini (${keyLabel}) timed out after ${timeoutMs}ms`)
          continue
        }
        // Re-throw non-quota errors
        throw err
      }
    }

    // All keys exhausted
    throw new Error(`Gemini: all ${keys.length} API keys failed. Errors: ${errors.join(' | ')}`)
  }
}
