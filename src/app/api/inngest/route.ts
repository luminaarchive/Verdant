// ─── Inngest Webhook Endpoint ────────────────────────────────────────────────
// Serves the Inngest event handler for Next.js App Router.
// Register at: https://app.inngest.com > Your App > App URL
// URL: https://your-domain.vercel.app/api/inngest

import { serve } from 'inngest/next'
import { inngest } from '@/inngest/client'
import { researchPipeline } from '@/inngest/functions/research-pipeline'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [researchPipeline],
})
