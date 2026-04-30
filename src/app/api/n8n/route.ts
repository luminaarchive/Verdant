import { NextRequest, NextResponse } from 'next/server'

const N8N_WEBHOOK = 'https://n8n-production-08c7.up.railway.app/webhook/102bbfd1-ae4d-4470-a653-03b5278bf654'

export const maxDuration = 60 // Vercel: allow up to 60s for n8n to respond

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `n8n responded with ${response.status}` },
        { status: response.status }
      )
    }

    // Try to parse as JSON; fall back to plain text
    const contentType = response.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      const data = await response.json()
      return NextResponse.json(data)
    } else {
      const text = await response.text()
      return NextResponse.json({ raw: text })
    }
  } catch (err) {
    console.error('[n8n proxy] error:', err)
    return NextResponse.json({ error: 'Pipeline unreachable' }, { status: 502 })
  }
}
