// ─── GET /api/research/status/[jobId] — Poll job status ──────────────────────
// Returns current stage from durable DB. For Analytica/Deep, triggers next
// stage with worker lock. Includes stale job detection and lock renewal.

import { NextRequest, NextResponse } from 'next/server'
import { getJob, getJobStatus } from '@/lib/research/jobs'

export const maxDuration = 60

export async function GET(request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params
  const job = await getJob(jobId)

  if (!job) {
    return NextResponse.json({ found: false, jobId, status: 'failed', errorReason: 'Job not found or expired' }, { status: 404 })
  }

  return NextResponse.json(await getJobStatus(jobId))
}
