// ─── /api/streak — Streak Tracking (No Auth Required) ───────────────────────
// Tracks research activity streaks using anonymous session cookies.
import { NextResponse } from 'next/server'

export async function POST() {
  // Streak is currently tracked client-side via localStorage.
  // This endpoint exists as a stub for future server-side tracking.
  return NextResponse.json({ ok: true, streak: 0, message: 'Streak tracked client-side' })
}

export async function GET() {
  return NextResponse.json({ ok: true, streak: 0, message: 'Streak tracked client-side' })
}
