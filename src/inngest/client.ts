// ─── Inngest Client ─────────────────────────────────────────────────────────
// Durable job queue that runs outside Vercel's 60-second timeout.
// Free tier: 50,000 function runs/month.
// https://app.inngest.com

import { Inngest } from 'inngest'

export const inngest = new Inngest({ id: 'verdant-research-engine' })
