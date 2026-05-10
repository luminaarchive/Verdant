// ─── /api/feedback — User Feedback ──────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'
import { FeedbackRequestSchema } from '@/schemas/research'
import { saveFeedback } from '@/services/supabase/admin'

export async function POST(request: NextRequest) {
  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ ok: false, message: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = FeedbackRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: parsed.error.issues.map(i => i.message).join('; ') }, { status: 400 })
  }

  const entry = await saveFeedback({ run_id: parsed.data.runId, rating: parsed.data.rating, comment: parsed.data.comment })
  return NextResponse.json({ ok: true, saved: !!entry })
}
