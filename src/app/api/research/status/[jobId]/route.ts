// ─── GET /api/research/status/[jobId] — Poll job status ──────────────────────
// Checks Supabase first, falls back to in-memory store for mem_ prefixed jobs.
// Always returns a terminal status (ready/failed) — never leaves frontend hanging.

import { NextRequest, NextResponse } from 'next/server'
import { getJob, getJobStatus } from '@/services/research/jobs'

export const maxDuration = 30

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params

  if (!jobId) {
    return NextResponse.json(
      { found: false, jobId: '', status: 'failed', errorReason: 'Missing jobId', ready: false, failed: true },
      { status: 400 }
    )
  }

  // In-memory jobs (mem_ prefix) — used when Supabase is unavailable
  if (jobId.startsWith('mem_')) {
    try {
      // Dynamically import to avoid circular dependency
      const { memoryJobs } = await import('@/app/api/research/start/route')
      const memJob = memoryJobs.get(jobId)

      if (!memJob) {
        return NextResponse.json({
          found: false,
          jobId,
          status: 'failed',
          errorReason: 'Job not found (in-memory jobs do not survive server restarts)',
          ready: false,
          failed: true,
          progress: 0,
          stage: 'Job expired',
          etaSeconds: 0,
          exportReady: false,
          partialResultAvailable: false,
        }, { status: 404 })
      }

      return NextResponse.json({
        found: true,
        jobId,
        status: memJob.status,
        progress: memJob.progress,
        stage: memJob.stage,
        etaSeconds: 0,
        ready: memJob.status === 'ready',
        failed: memJob.status === 'failed',
        exportReady: false,
        partialResultAvailable: !!memJob.result,
        errorReason: memJob.errorReason,
      })
    } catch (err) {
      console.error(`[status] In-memory job lookup failed: ${(err as Error).message}`)
      return NextResponse.json({
        found: false,
        jobId,
        status: 'failed',
        errorReason: 'Status lookup failed',
        ready: false,
        failed: true,
        progress: 0,
        stage: 'Error',
        etaSeconds: 0,
        exportReady: false,
        partialResultAvailable: false,
      }, { status: 500 })
    }
  }

  // DB-backed jobs
  try {
    const job = await getJob(jobId)

    if (!job) {
      return NextResponse.json({
        found: false,
        jobId,
        status: 'failed',
        errorReason: 'Job not found or expired',
        ready: false,
        failed: true,
        progress: 0,
        stage: 'Not found',
        etaSeconds: 0,
        exportReady: false,
        partialResultAvailable: false,
      }, { status: 404 })
    }

    return NextResponse.json(await getJobStatus(jobId))
  } catch (err) {
    console.error(`[status] DB lookup failed for ${jobId}: ${(err as Error).message}`)
    return NextResponse.json({
      found: false,
      jobId,
      status: 'failed',
      errorReason: 'Status check failed — please retry',
      ready: false,
      failed: true,
      progress: 0,
      stage: 'Error',
      etaSeconds: 0,
      exportReady: false,
      partialResultAvailable: false,
    }, { status: 500 })
  }
}
