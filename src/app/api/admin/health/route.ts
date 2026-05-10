// ─── /api/admin/health — Provider Health Dashboard ──────────────────────────
import { NextResponse } from 'next/server'
import { getAllHealth } from '@/infrastructure/health'

export async function GET() {
  const health = getAllHealth()
  const providers = health.map(h => ({
    ...h,
    successRate: (h.successCount + h.failureCount) > 0
      ? Number((h.successCount / (h.successCount + h.failureCount) * 100).toFixed(1))
      : null,
    avgLatencyMs: h.successCount > 0
      ? Math.round(h.totalLatencyMs / h.successCount)
      : null,
  }))

  return NextResponse.json({
    ok: true,
    providers,
    configured: {
      openrouter: !!(process.env.OPENROUTER_API_KEY?.trim()),
      gemini: !!(process.env.GEMINI_API_KEY?.trim()),
      resend: !!(process.env.RESEND_API_KEY?.trim()),
      supabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
      pdfService: !!(process.env.PDF_SERVICE_URL?.trim()),
    },
    timestamp: new Date().toISOString(),
  })
}
