// ─── Gemini API Client ──────────────────────────────────────────────────────
// Calls the Gemini REST API with structured JSON output.
// All keys read from environment variables. Never hardcoded.

import { log, timer, type LogContext } from '@/lib/research/logger'

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const MODEL = 'gemini-2.0-flash'
const MAX_RETRIES = 2
const RETRY_DELAY_MS = 1500

interface GeminiCallResult {
  content: string
  inputTokens: number
  outputTokens: number
  model: string
}

export async function callGemini(
  prompt: string,
  systemInstruction: string,
  ctx: Partial<LogContext>
): Promise<GeminiCallResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Set it in environment variables.')
  }

  const url = `${GEMINI_API_BASE}/${MODEL}:generateContent?key=${apiKey}`

  const body = {
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
      maxOutputTokens: 8192,
    },
  }

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const elapsed = timer()

    try {
      if (attempt > 0) {
        log.warn(`Gemini retry attempt ${attempt}`, { ...ctx, retryCount: attempt })
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS * attempt))
      }

      log.step('gemini-call', `Calling ${MODEL} (attempt ${attempt + 1})`, ctx)

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(45_000), // 45s timeout
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'no body')
        throw new Error(`Gemini API returned ${response.status}: ${errorText.slice(0, 300)}`)
      }

      const data = await response.json()
      const durationMs = elapsed()

      // Extract the text content from the response
      const candidate = data?.candidates?.[0]
      if (!candidate?.content?.parts?.[0]?.text) {
        throw new Error('Gemini returned no content in response')
      }

      const content = candidate.content.parts[0].text
      const usage = data?.usageMetadata ?? {}

      log.step('gemini-call', `Gemini responded in ${durationMs}ms`, {
        ...ctx,
        durationMs,
        inputTokens: usage.promptTokenCount,
        outputTokens: usage.candidatesTokenCount,
      })

      return {
        content,
        inputTokens: usage.promptTokenCount ?? 0,
        outputTokens: usage.candidatesTokenCount ?? 0,
        model: MODEL,
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      log.error(`Gemini call failed (attempt ${attempt + 1}): ${lastError.message}`, {
        ...ctx,
        durationMs: elapsed(),
        retryCount: attempt,
      })
    }
  }

  throw lastError ?? new Error('Gemini call failed after all retries')
}
