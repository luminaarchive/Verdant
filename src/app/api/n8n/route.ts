// ─── /api/n8n — n8n Webhook Proxy (Fallback Pipeline) ───────────────────────
// Tries n8n first. If n8n fails, automatically falls back to Gemini-direct pipeline.
// This ensures research always works regardless of n8n status.

import { NextRequest, NextResponse } from 'next/server'
import { log, generateRequestId, timer } from '@/lib/logger'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  const elapsed = timer()

  const N8N_WEBHOOK = process.env.N8N_WEBHOOK_URL
    ?? 'https://n8n-production-08c7.up.railway.app/webhook/102bbfd1-ae4d-4470-a653-03b5278bf654'

  log.info('n8n proxy request received', { requestId, pipelineSource: 'n8n-fallback' })

  try {
    const body = await request.json()

    // ─── Try n8n first ──────────────────────────────────────────────────
    try {
      const response = await fetch(N8N_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000), // 30s timeout for n8n
      })

      const contentType = response.headers.get('content-type') ?? ''
      let data: unknown

      if (contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        data = { raw: text }
      }

      // Check if n8n returned an error (code:0 = missing Respond to Webhook)
      if (
        typeof data === 'object' && data !== null &&
        'code' in data && 'message' in data
      ) {
        log.warn('n8n returned workflow error, falling back to Gemini', {
          requestId,
          pipelineSource: 'n8n-fallback',
          durationMs: elapsed(),
        })
        // Fall through to Gemini fallback below
        throw new Error('n8n workflow error')
      }

      log.info('n8n responded successfully', {
        requestId,
        pipelineSource: 'n8n-fallback',
        durationMs: elapsed(),
      })

      return NextResponse.json(data, { status: response.ok ? 200 : response.status })

    } catch (n8nError) {
      log.warn(`n8n failed: ${n8nError instanceof Error ? n8nError.message : 'unknown'}. Falling back to /api/research`, {
        requestId,
        pipelineSource: 'n8n-fallback',
      })
    }

    // ─── Fallback to Gemini-direct ──────────────────────────────────────
    log.info('Executing Gemini-direct fallback', { requestId })

    const fallbackResponse = await fetch(new URL('/api/research', request.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: body.query,
        mode: body.mode ?? 'focus',
      }),
    })

    const fallbackData = await fallbackResponse.json()

    log.info('Gemini fallback complete', {
      requestId,
      pipelineSource: 'gemini-direct',
      durationMs: elapsed(),
    })

    return NextResponse.json(fallbackData, { status: fallbackResponse.status })

  } catch (err) {
    log.error(`n8n proxy total failure: ${err instanceof Error ? err.message : 'unknown'}`, {
      requestId,
      durationMs: elapsed(),
    })
    return NextResponse.json(
      { ok: false, status: 502, message: 'All pipelines unreachable', retryable: true },
      { status: 502 }
    )
  }
}
