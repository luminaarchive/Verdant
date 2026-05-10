// ─── OpenRouter Provider — Production-Hardened ──────────────────────────────
// Sequential model fallback with:
//   - Model health cache (skip dead models)
//   - Circuit breaker integration
//   - Raw response forensics
//   - Multi-layer timeout protection
//   - Structured observability logging

import type { AIProvider, ProviderRequest, ProviderResponse } from './types'
import { log, timer } from '@/lib/research/logger'
import { isModelHealthy, markModelUnhealthy, markModelHealthy, type UnhealthyReason } from '@/infrastructure/model-health'
import { isCircuitAllowed, recordCircuitSuccess, recordCircuitFailure } from '@/infrastructure/circuit-breaker'
import { metricModelAttempt, metricModelSuccess, metricModelFailure, metricModelTimeout, metricFallback, getModelReliability, getModelLatency } from '@/infrastructure/metrics'

// ─── Verified Working Free Models (tested 2026-05-10) ───────────────────────
// These were tested live against OpenRouter API. Ordered by latency.
const FREE_MODELS = [
  'openai/gpt-oss-20b:free',                    // 397ms — fastest
  'google/gemma-4-26b-a4b-it:free',             // 544ms — very reliable
  'openai/gpt-oss-120b:free',                   // 1482ms — good quality
  'nvidia/nemotron-3-super-120b-a12b:free',      // 2329ms — large model fallback
  'minimax/minimax-m2.5:free',                   // 3550ms — last resort
]

// ─── Max tokens per mode ────────────────────────────────────────────────────
const MODE_MAX_TOKENS: Record<string, number> = {
  focus:     3000,
  deep:      6000,
  analytica: 8000,
}

// ─── Timeout Configuration ──────────────────────────────────────────────────
const MODEL_TIMEOUT_MS = 20_000     // Per-model hard timeout
const PIPELINE_BUDGET_MS = 45_000   // Total budget — must leave headroom for DB + overhead under 60s
const INTER_MODEL_DELAY_MS = 500    // Delay between attempts (rate limit protection)
const RATE_LIMIT_DELAY_MS = 2000    // Extra delay after 429

// ─── Hard fetch timeout wrapper ─────────────────────────────────────────────
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const existingSignal = options.signal

  // Merge abort signals if the caller provided one
  if (existingSignal) {
    existingSignal.addEventListener('abort', () => controller.abort())
  }

  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

// ─── Response forensics logger ──────────────────────────────────────────────
function logResponseForensics(
  model: string,
  httpStatus: number,
  body: string,
  headers: Record<string, string>,
  durationMs: number,
  context: string
): void {
  const sanitized = body.replace(/sk-or-[a-zA-Z0-9-]+/g, 'sk-or-***REDACTED***')
  const truncated = sanitized.length > 3000 ? sanitized.slice(0, 3000) + `...[truncated ${sanitized.length - 3000} chars]` : sanitized
  
  console.error(
    `[openrouter-forensics] ${context}\n` +
    `  model: ${model}\n` +
    `  status: ${httpStatus}\n` +
    `  duration: ${durationMs}ms\n` +
    `  content-type: ${headers['content-type'] || 'unknown'}\n` +
    `  body_length: ${body.length}\n` +
    `  body_preview: ${truncated.slice(0, 500)}`
  )
}

// ─── Map HTTP/failure to health reason ──────────────────────────────────────
function toHealthReason(httpStatus: number, context: string): UnhealthyReason {
  if (httpStatus === 404) return 'http_404'
  if (httpStatus === 429) return 'http_429'
  if (httpStatus >= 500) return 'http_5xx'
  if (context === 'timeout') return 'timeout'
  if (context === 'empty') return 'empty_body'
  if (context === 'json') return 'invalid_json'
  if (context === 'content') return 'empty_content'
  return 'provider_unavailable'
}

export class OpenRouterProvider implements AIProvider {
  name = 'openrouter'

  isConfigured(): boolean {
    const key = process.env.OPENROUTER_API_KEY?.trim()
    return typeof key === 'string' && key.length > 0
  }

  async call(req: ProviderRequest): Promise<ProviderResponse> {
    const apiKey = process.env.OPENROUTER_API_KEY?.trim()
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured or is empty.')
    }

    // ─── Circuit breaker check ──────────────────────────────────────
    if (!isCircuitAllowed('openrouter')) {
      throw new Error('OpenRouter circuit breaker is OPEN — provider temporarily blocked due to high failure rate')
    }

    const maxTokens = MODE_MAX_TOKENS[req.mode] ?? 4000
    const pipelineStart = Date.now()
    const elapsed = timer()
    const errors: string[] = []
    const requestId = `or_${Date.now().toString(36)}`

    // ─── Filter healthy models + adaptive routing ─────────────────
    let healthyModels = FREE_MODELS.filter(m => isModelHealthy(m))
    const skippedModels = FREE_MODELS.filter(m => !isModelHealthy(m))

    if (skippedModels.length > 0) {
      console.log(`[openrouter] ⏭️ Skipping ${skippedModels.length} unhealthy models: ${skippedModels.join(', ')}`)
    }

    if (healthyModels.length === 0) {
      console.warn(`[openrouter] ⚠️ All models unhealthy — forcing retry on all models`)
      healthyModels = [...FREE_MODELS]
    }

    // ─── Adaptive routing: reorder by reliability + latency ─────────
    const reliability = getModelReliability()
    const latency = getModelLatency()
    if (reliability.size > 0) {
      healthyModels.sort((a, b) => {
        const aRel = reliability.get(a) ?? 0.5
        const bRel = reliability.get(b) ?? 0.5
        // Primary: higher reliability first
        if (Math.abs(aRel - bRel) > 0.1) return bRel - aRel
        // Secondary: lower latency first
        const aLat = latency.get(a) ?? 5000
        const bLat = latency.get(b) ?? 5000
        return aLat - bLat
      })
      console.log(`[openrouter] 📊 Adaptive order: ${healthyModels.map(m => {
        const r = reliability.get(m)
        const l = latency.get(m)
        return `${m.split('/')[1]?.split(':')[0]}(r=${r?.toFixed(2) ?? '?'},l=${l ? Math.round(l) + 'ms' : '?'})`
      }).join(' → ')}`)
    }

    console.log(
      `[openrouter] 🚀 Starting | reqId=${requestId} mode=${req.mode} ` +
      `max_tokens=${maxTokens} models=${healthyModels.length}/${FREE_MODELS.length} ` +
      `key_prefix=${apiKey.slice(0, 8)}...`
    )

    for (let modelIdx = 0; modelIdx < healthyModels.length; modelIdx++) {
      const model = healthyModels[modelIdx]

      // ─── Budget check ───────────────────────────────────────────
      const budgetRemaining = PIPELINE_BUDGET_MS - (Date.now() - pipelineStart)
      if (budgetRemaining < 5_000) {
        const msg = `Pipeline budget exhausted after ${Date.now() - pipelineStart}ms`
        console.warn(`[openrouter] ⏱️ ${msg}`)
        errors.push(msg)
        break
      }

      // ─── Inter-model delay ──────────────────────────────────────
      if (modelIdx > 0) {
        metricFallback()
        await new Promise(r => setTimeout(r, INTER_MODEL_DELAY_MS))
      }

      metricModelAttempt(model)
      const modelTimeout = Math.min(MODEL_TIMEOUT_MS, budgetRemaining - 2_000)
      const modelStart = Date.now()

      try {
        console.log(
          `[openrouter] 📡 Model ${modelIdx + 1}/${healthyModels.length}: ${model} ` +
          `(timeout=${modelTimeout}ms, budget=${budgetRemaining}ms)`
        )

        // ─── Fetch with hard timeout ────────────────────────────
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
                stream: false,
              }),
            },
            modelTimeout
          )
        } catch (fetchErr) {
          const modelMs = Date.now() - modelStart
          const isAbort = fetchErr instanceof Error && (fetchErr.name === 'AbortError' || fetchErr.message.includes('abort'))
          const msg = isAbort
            ? `⏱️ ${model} timed out after ${modelMs}ms`
            : `❌ ${model} fetch error: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`
          console.error(`[openrouter] ${msg}`)
          errors.push(msg)
          markModelUnhealthy(model, isAbort ? 'timeout' : 'provider_unavailable')
          recordCircuitFailure('openrouter')
          continue
        }

        // ─── HTTP error handling ────────────────────────────────
        if (!response.ok) {
          const modelMs = Date.now() - modelStart
          const errText = await response.text().catch(() => 'no body')
          const msg = `HTTP ${response.status} [${model}]: ${errText.slice(0, 200)}`
          console.error(`[openrouter] ❌ ${msg}`)
          errors.push(msg)

          // Forensics for non-200 responses
          const headers: Record<string, string> = {}
          response.headers.forEach((v, k) => { headers[k] = v })
          logResponseForensics(model, response.status, errText, headers, modelMs, 'HTTP_ERROR')

          // Mark model unhealthy based on status
          markModelUnhealthy(model, toHealthReason(response.status, ''))

          if (response.status === 429) {
            console.warn(`[openrouter] 🔄 Rate limited on ${model}, delaying ${RATE_LIMIT_DELAY_MS}ms`)
            await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY_MS))
          }

          recordCircuitFailure('openrouter')
          continue
        }

        // ─── Response body validation ───────────────────────────
        const text = await response.text().catch(() => '')
        const modelMs = Date.now() - modelStart

        if (!text || !text.trim()) {
          const msg = `${model} returned empty body`
          console.error(`[openrouter] ❌ ${msg}`)
          errors.push(msg)
          markModelUnhealthy(model, 'empty_body')
          recordCircuitFailure('openrouter')
          continue
        }

        // Reject HTML responses
        if (text.trim().startsWith('<') || text.trim().startsWith('<!')) {
          const msg = `${model} returned HTML (Cloudflare/proxy error)`
          console.error(`[openrouter] ❌ ${msg}`)
          errors.push(msg)
          const headers: Record<string, string> = {}
          response.headers.forEach((v, k) => { headers[k] = v })
          logResponseForensics(model, 200, text, headers, modelMs, 'HTML_RESPONSE')
          markModelUnhealthy(model, 'invalid_json')
          recordCircuitFailure('openrouter')
          continue
        }

        // ─── JSON parsing ───────────────────────────────────────
        let data: unknown
        try {
          data = JSON.parse(text)
        } catch (parseErr) {
          const msg = `${model} non-JSON response: ${(parseErr as Error).message}`
          console.error(`[openrouter] ❌ ${msg}`)
          errors.push(msg)
          const headers: Record<string, string> = {}
          response.headers.forEach((v, k) => { headers[k] = v })
          logResponseForensics(model, 200, text, headers, modelMs, 'JSON_PARSE_FAILURE')
          markModelUnhealthy(model, 'invalid_json')
          recordCircuitFailure('openrouter')
          continue
        }

        // ─── Content extraction ─────────────────────────────────
        const content =
          (data as any)?.choices?.[0]?.message?.content ||
          (data as any)?.choices?.[0]?.text ||
          (data as any)?.message?.content ||
          (data as any)?.content ||
          ''

        if (!content || typeof content !== 'string' || content.trim().length === 0) {
          const msg = `${model} returned empty content. Keys: ${Object.keys(data as any).join(', ')}`
          console.error(`[openrouter] ❌ ${msg}`)
          errors.push(msg)
          markModelUnhealthy(model, 'empty_content')
          recordCircuitFailure('openrouter')
          continue
        }

        if (content.trim().length < 50) {
          const msg = `${model} suspiciously short (${content.trim().length} chars): "${content.trim().slice(0, 100)}"`
          console.warn(`[openrouter] ⚠️ ${msg}`)
          errors.push(msg)
          continue // Don't mark unhealthy — might be a transient issue
        }

        // ─── SUCCESS ────────────────────────────────────────────
        const durationMs = elapsed()
        const usage = (data as any)?.usage ?? {}

        console.log(
          `[openrouter] ✅ SUCCESS | model=${model} reqId=${requestId} ` +
          `duration=${durationMs}ms content_length=${content.length} ` +
          `tokens=${usage.prompt_tokens ?? '?'}+${usage.completion_tokens ?? '?'}`
        )

        markModelHealthy(model)
        metricModelSuccess(model, durationMs)
        recordCircuitSuccess('openrouter')

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
        const modelMs = Date.now() - modelStart
        const isAbort = err instanceof Error && (err.name === 'AbortError' || err.message.includes('abort'))
        const msg = isAbort
          ? `⏱️ ${model} timed out after ${modelMs}ms`
          : `❌ ${model} error: ${err instanceof Error ? err.message : String(err)}`
        console.error(`[openrouter] ${msg}`)
        errors.push(msg)
        recordCircuitFailure('openrouter')
        continue
      }
    }

    // ─── All models failed ──────────────────────────────────────────
    const totalMs = Date.now() - pipelineStart
    const fullError = `All ${healthyModels.length} OpenRouter models failed in ${totalMs}ms. Errors: ${errors.map((e, i) => `[${i + 1}] ${e}`).join(' | ')}`
    console.error(`[openrouter] 🔴 ${fullError}`)
    throw new Error(fullError)
  }
}
