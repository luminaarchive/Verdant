// ─── Fast Pipeline — Stage A ────────────────────────────────────────────────
// Generates a quick initial report (title + summary + findings) in 5-15s.
// BYPASSES the full provider-manager for speed.
// Tries multiple fast models with short timeouts.

import type { ResearchResult } from '@/schemas/research'

// ─── Fast models — ordered by speed, with fallback ──────────────────────────
const FAST_MODELS = [
  'openai/gpt-oss-20b:free',
  'google/gemma-4-26b-a4b-it:free',
  'openai/gpt-oss-120b:free',
]
const FAST_TIMEOUT_MS = 12_000
const FAST_MAX_TOKENS = 1500

function getFastSystemPrompt(): string {
  return `You are VerdantAI. Produce a FAST environmental research briefing as JSON.
Rules: No hallucination. Real sources only. Be concise.
JSON only, no markdown wrapping.`
}

function getFastUserPrompt(query: string): string {
  return `Quick environmental briefing on: ${query}

Return this exact JSON structure:
{"title":"specific title","executiveSummary":{"whatMattersMost":"1 sentence with data","hiddenRisks":"1 sentence","strategicImplications":"1 sentence","recommendedNextAction":"1 sentence","whyThisMattersNow":"1 sentence"},"findings":["finding with data","finding with data","finding with data"],"confidenceScore":70,"stats":[{"label":"metric","value":"number"}],"sources":[{"title":"real source","year":"2024"}]}`
}

function extractJSON(raw: string): any {
  let content = raw.trim()
  content = content.replace(/^\uFEFF/, '').replace(/[\u200B-\u200D\uFEFF]/g, '')
  content = content.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```\s*$/i, '')
  content = content.trim()
  try { return JSON.parse(content) } catch {}
  const start = content.indexOf('{')
  if (start !== -1) {
    let depth = 0, end = -1
    for (let i = start; i < content.length; i++) {
      if (content[i] === '{') depth++
      else if (content[i] === '}') { depth--; if (depth === 0) { end = i; break } }
    }
    if (end !== -1) { try { return JSON.parse(content.slice(start, end + 1)) } catch {} }
  }
  return null
}

export interface FastPipelineResult {
  result: Partial<ResearchResult>
  rawContent: string
  model: string
  durationMs: number
  stage: 'fast'
}

export async function runFastPipeline(query: string, requestId: string): Promise<FastPipelineResult> {
  const pipelineStart = Date.now()
  const apiKey = process.env.OPENROUTER_API_KEY?.trim()
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured')

  const errors: string[] = []

  // Try each fast model with remaining budget
  for (let i = 0; i < FAST_MODELS.length; i++) {
    const model = FAST_MODELS[i]
    const elapsed = Date.now() - pipelineStart
    const remaining = FAST_TIMEOUT_MS - elapsed
    if (remaining < 3000) {
      errors.push(`Budget exhausted (${elapsed}ms)`)
      break
    }

    const modelStart = Date.now()
    console.log(`[fast-pipeline] 🚀 Trying model ${i + 1}/${FAST_MODELS.length}: ${model} (budget=${remaining}ms)`)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), Math.min(remaining, 10_000))

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://verdantai.vercel.app',
          'X-Title': 'Verdant-Fast',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: getFastSystemPrompt() },
            { role: 'user', content: getFastUserPrompt(query) },
          ],
          max_tokens: FAST_MAX_TOKENS,
          temperature: 0.3,
          stream: false,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        const msg = `${model}: HTTP ${res.status} ${errText.slice(0, 80)}`
        console.warn(`[fast-pipeline] ⚠️ ${msg}`)
        errors.push(msg)
        continue // Try next model
      }

      const data = await res.json()
      const content = data?.choices?.[0]?.message?.content || ''
      const durationMs = Date.now() - pipelineStart

      console.log(`[fast-pipeline] ⚡ Success: model=${model} ${durationMs}ms (${content.length} chars)`)

      const parsed = extractJSON(content)
      const result: Partial<ResearchResult> = {
        title: parsed?.title || `Environmental Analysis: ${query}`,
        executiveSummary: parsed?.executiveSummary || {
          whatMattersMost: 'Initial analysis in progress...',
          hiddenRisks: 'Evaluating risks...',
          strategicImplications: 'Assessing implications...',
          recommendedNextAction: 'Pending full analysis...',
          whyThisMattersNow: 'Loading urgency assessment...',
        },
        findings: parsed?.findings || ['Initial analysis in progress...'],
        confidenceScore: parsed?.confidenceScore || 50,
        stats: parsed?.stats || [],
        sources: parsed?.sources || [],
        pipelineSource: 'openrouter',
        mode: 'focus',
        query,
        durationMs,
      }

      return { result, rawContent: content, model, durationMs, stage: 'fast' }

    } catch (err: any) {
      clearTimeout(timeout)
      const errMsg = err?.message || String(err)
      const isAbort = errMsg.includes('abort') || err?.name === 'AbortError' || err?.code === 'ABORT_ERR'
      const msg = `${model}: ${isAbort ? 'TIMEOUT' : errMsg}`
      console.warn(`[fast-pipeline] ⚠️ ${msg}`)
      errors.push(msg)
      continue // Try next model
    }
  }

  throw new Error(`All fast models failed: ${errors.join('; ')}`)
}
