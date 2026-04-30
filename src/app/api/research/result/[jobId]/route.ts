// ─── GET /api/research/result/[jobId] — Retrieve completed report ────────────

import { NextRequest, NextResponse } from 'next/server'
import { getJob } from '@/lib/research/jobs'

export async function GET(request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params
  const job = getJob(jobId)

  if (!job) {
    return NextResponse.json({ ok: false, message: 'Job not found or expired' }, { status: 404 })
  }

  if (job.status === 'ready' && job.result) {
    return NextResponse.json({ ok: true, jobId, status: 'ready', result: job.result })
  }

  if (job.status === 'failed') {
    return NextResponse.json({
      ok: false, jobId, status: 'failed',
      errorReason: job.errorReason,
      partialResult: job.partialResultAvailable ? job.partialResult : undefined,
    })
  }

  return NextResponse.json({
    ok: false, jobId, status: job.status,
    message: 'Report not yet ready. Poll /api/research/status/' + jobId,
    progress: job.progress, stage: job.stage,
  }, { status: 202 })
}
