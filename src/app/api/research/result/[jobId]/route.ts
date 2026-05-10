// ─── GET /api/research/result/[jobId] — Retrieve completed report ────────────
// Checks Supabase first, falls back to in-memory store for mem_ prefixed jobs.

import { NextRequest, NextResponse } from 'next/server'
import { getJob, getPartialResults } from '@/services/research/jobs'

export const maxDuration = 30

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params

  if (!jobId) {
    return NextResponse.json({ ok: false, message: 'Missing jobId' }, { status: 400 })
  }

  // In-memory jobs (mem_ prefix)
  if (jobId.startsWith('mem_')) {
    try {
      const { memoryJobs } = await import('@/app/api/research/start/route')
      const memJob = memoryJobs.get(jobId)

      if (!memJob) {
        return NextResponse.json({ ok: false, message: 'Job not found or expired' }, { status: 404 })
      }

      if (memJob.status === 'ready' && memJob.result) {
        return NextResponse.json({ ok: true, jobId, status: 'ready', result: memJob.result })
      }

      if (memJob.status === 'failed') {
        return NextResponse.json({
          ok: false,
          jobId,
          status: 'failed',
          errorReason: memJob.errorReason ?? 'Analysis failed',
        })
      }

      return NextResponse.json({
        ok: false,
        jobId,
        status: memJob.status,
        message: 'Report not yet ready',
        progress: memJob.progress,
        stage: memJob.stage,
      }, { status: 202 })
    } catch (err) {
      console.error(`[result] In-memory result lookup failed: ${(err as Error).message}`)
      return NextResponse.json({ ok: false, message: 'Result lookup failed' }, { status: 500 })
    }
  }

  // DB-backed jobs
  try {
    const job = await getJob(jobId)

    if (!job) {
      return NextResponse.json({ ok: false, message: 'Job not found or expired' }, { status: 404 })
    }

    if (job.status === 'ready' && job.result) {
      return NextResponse.json({ ok: true, jobId, status: 'ready', result: job.result })
    }

    if (job.status === 'failed') {
      const partials = await getPartialResults(jobId).catch(() => [])
      return NextResponse.json({
        ok: false,
        jobId,
        status: 'failed',
        errorReason: job.errorReason,
        partialResults: partials.length > 0 ? partials : undefined,
      })
    }

    return NextResponse.json({
      ok: false,
      jobId,
      status: job.status,
      message: `Report not yet ready. Poll /api/research/status/${jobId}`,
      progress: job.progress,
      stage: job.stage,
    }, { status: 202 })
  } catch (err) {
    console.error(`[result] DB result lookup failed for ${jobId}: ${(err as Error).message}`)
    return NextResponse.json({ ok: false, message: 'Result retrieval failed — please retry' }, { status: 500 })
  }
}
