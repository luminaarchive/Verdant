// ─── /api/share — Generate Share Token ──────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'
import { ShareRequestSchema } from '@/schemas/research'
import { createShareToken, getRunById } from '@/services/supabase/admin'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ ok: false, message: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = ShareRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: parsed.error.issues.map(i => i.message).join('; ') }, { status: 400 })
  }

  // Verify run exists
  const run = await getRunById(parsed.data.runId)
  if (!run) {
    return NextResponse.json({ ok: false, message: 'Run not found' }, { status: 404 })
  }

  // Generate token
  const token = randomBytes(16).toString('hex')
  const expiresAt = new Date(Date.now() + parsed.data.expiresInHours * 60 * 60 * 1000).toISOString()

  const saved = await createShareToken({
    run_id: parsed.data.runId,
    token,
    expires_at: expiresAt,
  })

  if (!saved) {
    // Supabase not configured — return a local share URL using runId as fallback
    return NextResponse.json({
      ok: true,
      shareUrl: `/share/${token}`,
      token,
      expiresAt,
      note: 'Share token not persisted (Supabase not configured). Link will not survive server restart.',
    })
  }

  const baseUrl = request.headers.get('host') ?? 'verdantai.vercel.app'
  const protocol = baseUrl.includes('localhost') ? 'http' : 'https'

  return NextResponse.json({
    ok: true,
    shareUrl: `${protocol}://${baseUrl}/share/${token}`,
    token,
    expiresAt,
  })
}
