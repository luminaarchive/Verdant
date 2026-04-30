// ─── /api/admin/health — Provider Health Dashboard ──────────────────────────
import { NextResponse } from 'next/server'
import { getAllHealth } from '@/lib/ai/health'

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
      openrouter: !!process.env.OPENROUTER_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      resend: !!process.env.RESEND_API_KEY,
      supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      pdfService: !!process.env.PDF_SERVICE_URL,
    },
    timestamp: new Date().toISOString(),
  })
}
