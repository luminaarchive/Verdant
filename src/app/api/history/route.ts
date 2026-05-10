// ─── /api/history — Research History ────────────────────────────────────────
import { NextResponse } from 'next/server'
import { getRecentRuns } from '@/services/supabase/admin'

export async function GET() {
  try {
    const runs = await getRecentRuns(50)
    return NextResponse.json({ ok: true, runs })
  } catch {
    return NextResponse.json({ ok: true, runs: [] })
  }
}
