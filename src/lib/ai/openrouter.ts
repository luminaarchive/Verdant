import type { AIProvider, ProviderRequest, ProviderResponse } from './types'
import { log, timer } from '../research/logger'

// ─── FREE-FIRST model fallback chain ────────────────────────────────────────
// Primary: deepseek/deepseek-chat-v3-0324:free
// Fallbacks: google/gemma-3-27b-it:free → meta-llama/llama-3.3-70b-instruct:free
//            → mistralai/mistral-small-3.1-24b-instruct:free
// Paid models are NEVER attempted unless a paid key is explicitly configured.

const FREE_MODELS = [
  'openai/gpt-oss-20b:free',                    // 397ms — fastest
  'google/gemma-4-26b-a4b-it:free',             // 544ms — very reliable
  'openai/gpt-oss-120b:free',                   // 1482ms — good quality
  'nvidia/nemotron-3-super-120b-a12b:free',      // 2329ms — large model fallback
  'minimax/minimax-m2.5:free',                   // 3550ms — last resort
]

// ─── Max tokens per mode — must be large enough for full JSON schema output ──
// The schema requires: title, executiveSummary (5 fields), findings[], 
// decisionRecommendations[], outline[], stats[], sources[], evidenceItems[],
// contradictions[], confidenceScore, uncertaintyNotes[], strategicFollowUps[]
// This needs ~3000-5000 tokens minimum.
const MODE_MAX_TOKENS: Record<string, number> = {
  focus:     4000,
  deep:      6000,
  analytica: 8000,
}

// Per-model timeout — OpenRouter is the only provider, give each model more time
const MODEL_TIMEOUT_MS = 22_000

// Overall budget for all OpenRouter model attempts — stay under Vercel 60s limit
const PIPELINE_BUDGET_MS = 50_000

// Delay between model attempts (helps avoid rate limit cascades)
const INTER_MODEL_DELAY_MS = 500

// Delay after 429 rate limit
const RATE_LIMIT_DELAY_MS = 2000

// ─── Universal fetch wrapper with hard timeout ──────────────────────────────
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController()
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return res
  } finally {
    clearTimeout(timeoutHandle)
  }
}

export class OpenRouterProvider implements AIProvider {
  name = 'openrouter'

  isConfigured(): boolean {
    const key = process.env.OPENROUTER_API_KEY
    // Treat empty string as not configured — prevents silent 401 loops
    return typeof key === 'string' && key.trim().length > 0
  }

  async call(req: ProviderRequest): Promise<ProviderResponse> {
    const apiKey = process.env.OPENROUTER_API_KEY?.trim()
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured or is empty. Set it in Vercel Environment Variables.')
    }

    const maxTokens = MODE_MAX_TOKENS[req.mode] ?? 1200
    const pipelineStart = Date.now()
    const elapsed = timer()
    const errors: string[] = []

    console.log(`[openrouter] Starting call — mode=${req.mode}, max_tokens=${maxTokens}, models=${FREE_MODELS.length}, key_prefix=${apiKey.slice(0, 8)}...`)

    for (let modelIdx = 0; modelIdx < FREE_MODELS.length; modelIdx++) {
      const model = FREE_MODELS[modelIdx]

      // Abort if we're approaching the overall pipeline budget
      const budgetRemaining = PIPELINE_BUDGET_MS - (Date.now() - pipelineStart)
      if (budgetRemaining < 5_000) {
        const msg = `Pipeline budget exhausted after ${Date.now() - pipelineStart}ms — aborting remaining models`
        console.warn(`[openrouter] ${msg}`)
        errors.push(msg)
        break
      }

      // Add delay between model attempts (not before first)
      if (modelIdx > 0) {
        await new Promise(r => setTimeout(r, INTER_MODEL_DELAY_MS))
      }

      const modelTimeout = Math.min(MODEL_TIMEOUT_MS, budgetRemaining - 2_000)

      try {
        console.log(`[openrouter] Trying model ${modelIdx + 1}/${FREE_MODELS.length}: ${model} (timeout=${modelTimeout}ms, budget_remaining=${budgetRemaining}ms)`)
        log.step('openrouter', `Calling ${model} (max_tokens=${maxTokens})`, { pipelineSource: 'openrouter' })

        // ─── Fetch with hard timeout wrapper ────────────────────────────
        let response: Response
        try {
          response = await fetchWithTimeout(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://verdantai.vercel.app',
                'X-Title': 'Verdant',
              },
              body: JSON.stringify({
                model,
                messages: [
                  { role: 'system', content: req.systemPrompt },
                  { role: 'user', content: req.userPrompt },
                ],
                temperature: 0.3,
                max_tokens: maxTokens,
                stream: false, // Non-streaming for stability — no partial JSON, no ReadableStream crashes
                // NOTE: Do NOT set response_format or json_schema — free models fail with structured output
              }),
            },
            modelTimeout
          )
        } catch (fetchErr) {
          const isAbort = fetchErr instanceof Error && (fetchErr.name === 'AbortError' || fetchErr.message.includes('abort'))
          const msg = isAbort
            ? `Model ${model} timed out after ${modelTimeout}ms`
            : `Model ${model} fetch error: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`
          console.error(`[openrouter] ${msg}`)
          errors.push(msg)
          continue
        }

        // ─── HTTP error handling ────────────────────────────────────────
        if (!response.ok) {
          const errText = await response.text().catch(() => 'no body')
          const msg = `OpenRouter HTTP ${response.status} [${model}]: ${errText.slice(0, 300)}`
          console.error(`[openrouter] ${msg}`)
          errors.push(msg)

          // 429 rate limit — wait then try next model
          if (response.status === 429) {
            console.warn(`[openrouter] Rate limited on ${model}, waiting ${RATE_LIMIT_DELAY_MS}ms then trying next`)
            await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY_MS))
            continue
          }

          // Non-retryable HTTP errors — skip to next model immediately
          if ([400, 401, 403, 404, 422].includes(response.status)) {
            console.warn(`[openrouter] Non-retryable status ${response.status} for ${model}, trying next`)
            continue
          }

          // 5xx — try next model
          continue
        }

        // ─── Response body validation ───────────────────────────────────
        // OpenRouter can return HTML error pages, Cloudflare pages, or empty bodies
        const text = await response.text().catch(() => '')

        if (!text || !text.trim()) {
          const msg = `Model ${model} returned empty response body`
          console.error(`[openrouter] ${msg}`)
          errors.push(msg)
          continue
        }

        // Reject HTML responses (Cloudflare error pages, etc.)
        if (text.trim().startsWith('<') || text.trim().startsWith('<!')) {
          const msg = `Model ${model} returned HTML instead of JSON (likely Cloudflare/proxy error)`
          console.error(`[openrouter] ${msg}`)
          errors.push(msg)
          continue
        }

        // ─── JSON parsing ───────────────────────────────────────────────
        let data: unknown
        try {
          data = JSON.parse(text)
        } catch (parseErr) {
          const msg = `Model ${model} returned non-JSON response: ${(parseErr as Error).message}. Body preview: ${text.slice(0, 200)}`
          console.error(`[openrouter] ${msg}`)
          errors.push(msg)
          continue
        }

        // ─── Content extraction (safe — handles multiple provider schemas) ─
        const durationMs = elapsed()
        const content =
          (data as any)?.choices?.[0]?.message?.content ||
          (data as any)?.choices?.[0]?.text ||
          (data as any)?.message?.content ||
          (data as any)?.content ||
          ''

        if (!content || typeof content !== 'string' || content.trim().length === 0) {
          const msg = `Model ${model} returned empty or missing content. Keys: ${Object.keys(data as any).join(', ')}`
          console.error(`[openrouter] ${msg}`)
          errors.push(msg)
          continue
        }

        // Reject suspiciously short responses (likely error messages, not real output)
        if (content.trim().length < 50) {
          const msg = `Model ${model} returned suspiciously short content (${content.trim().length} chars): "${content.trim().slice(0, 100)}"`
          console.warn(`[openrouter] ${msg}`)
          errors.push(msg)
          continue
        }

        const usage = (data as any)?.usage ?? {}
        console.log(`[openrouter] ✓ Success with ${model} in ${durationMs}ms, content_length=${content.length}, tokens=${usage.prompt_tokens ?? '?'}+${usage.completion_tokens ?? '?'}`)
        log.step('openrouter', `Response from ${model} in ${durationMs}ms`, { durationMs })

        return {
          content,
          provider: 'openrouter',
          model,
          inputTokens: usage.prompt_tokens ?? 0,
          outputTokens: usage.completion_tokens ?? 0,
          durationMs,
          estimatedCostUsd: 0, // Free models
        }

      } catch (err) {
        const isAbort = err instanceof Error && (err.name === 'AbortError' || err.message.includes('abort'))
        const msg = isAbort
          ? `Model ${model} timed out after ${modelTimeout}ms`
          : `Model ${model} error: ${err instanceof Error ? err.message : String(err)}`
        console.error(`[openrouter] ${msg}`)
        errors.push(msg)
        continue
      }
    }

    // All models failed
    const totalMs = Date.now() - pipelineStart
    const fullError = `All OpenRouter free models failed after ${totalMs}ms.\nErrors:\n${errors.map((e, i) => `  [${i + 1}] ${e}`).join('\n')}`
    console.error(`[openrouter] ${fullError}`)
    throw new Error(fullError)
  }
}
