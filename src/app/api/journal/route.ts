// ─── /api/journal — Journal CRUD ────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'
import { JournalEntrySchema } from '@/lib/research/schema'
import { saveJournalEntry, getJournalEntries, deleteJournalEntry } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const entries = await getJournalEntries(50)
    return NextResponse.json({ ok: true, entries })
  } catch {
    return NextResponse.json({ ok: true, entries: [] })
  }
}

export async function POST(request: NextRequest) {
  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ ok: false, message: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = JournalEntrySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: parsed.error.issues.map(i => i.message).join('; ') }, { status: 400 })
  }

  const entry = await saveJournalEntry(parsed.data)
  if (!entry) {
    // Supabase not configured — return success so frontend saves locally
    return NextResponse.json({ ok: true, entry: { ...parsed.data, id: String(Date.now()), persisted: false } })
  }

  return NextResponse.json({ ok: true, entry })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ ok: false, message: 'id required' }, { status: 400 })
  }

  const success = await deleteJournalEntry(id)
  return NextResponse.json({ ok: success })
}
