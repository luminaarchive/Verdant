import { NextRequest, NextResponse } from 'next/server'

const N8N_WEBHOOK = 'https://n8n-production-08c7.up.railway.app/webhook/102bbfd1-ae4d-4470-a653-03b5278bf654'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    // Parse the response body regardless of status code
    const contentType = response.headers.get('content-type') ?? ''
    let data: unknown

    if (contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      data = { raw: text }
    }

    // If n8n returns a workflow config error (code:0), surface it as a raw message
    if (
      typeof data === 'object' &&
      data !== null &&
      'code' in data &&
      'message' in data
    ) {
      const d = data as { code: number; message: string }
      // code:0 means n8n workflow isn't set up to respond yet
      // Return a friendly raw text so the UI shows it as a research output placeholder
      return NextResponse.json({
        raw: `n8n workflow responded: ${d.message}\n\nPlease check the n8n workflow configuration — the "Respond to Webhook" node may be missing or unused.`,
      })
    }

    return NextResponse.json(data, { status: response.ok ? 200 : response.status })
  } catch (err) {
    console.error('[n8n proxy] error:', err)
    return NextResponse.json({ error: 'Pipeline unreachable' }, { status: 502 })
  }
}
