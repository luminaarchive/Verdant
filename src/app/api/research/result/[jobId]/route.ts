// ─── GET /api/research/result/[jobId] — Retrieve completed report ────────────
// Reads from durable Supabase storage. Survives crashes and deployments.

import { NextRequest, NextResponse } from 'next/server'
import { getJob, getPartialResults } from '@/lib/research/jobs'

export async function GET(request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params
  const job = await getJob(jobId)

  if (!job) {
    return NextResponse.json({ ok: false, message: 'Job not found or expired' }, { status: 404 })
  }

  if (job.status === 'ready' && job.result) {
    return NextResponse.json({ ok: true, jobId, status: 'ready', result: job.result })
  }

  if (job.status === 'failed') {
    const partials = await getPartialResults(jobId)
    return NextResponse.json({
      ok: false, jobId, status: 'failed',
      errorReason: job.errorReason,
      partialResults: partials.length > 0 ? partials : undefined,
    })
  }

  return NextResponse.json({
    ok: false, jobId, status: job.status,
    message: 'Report not yet ready. Poll /api/research/status/' + jobId,
    progress: job.progress, stage: job.stage,
  }, { status: 202 })
}
