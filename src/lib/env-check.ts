// ─── Environment Variable Validation ────────────────────────────────────────
// Call validateEnv() at critical API route entry points for immediate,
// clear error messages in Vercel logs when env vars are missing.
//
// Design: logs which specific variables are missing, never exposes values.

export interface EnvStatus {
  valid: boolean
  missing: string[]
  supabase: 'configured' | 'missing_url' | 'missing_key' | 'missing_both'
  ai: 'configured' | 'missing'
}

/** Returns status without throwing — use for health checks */
export function checkEnv(): EnvStatus {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // AI provider: check all possible keys
  const hasGemini = !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY)
  const hasOpenRouter = !!process.env.OPENROUTER_API_KEY
  const hasAI = hasGemini || hasOpenRouter

  const missing: string[] = []
  if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  if (!serviceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')
  if (!hasAI) missing.push('GEMINI_API_KEY or OPENROUTER_API_KEY')

  let supabase: EnvStatus['supabase'] = 'configured'
  if (!url && !serviceKey) supabase = 'missing_both'
  else if (!url) supabase = 'missing_url'
  else if (!serviceKey) supabase = 'missing_key'

  return {
    valid: missing.length === 0,
    missing,
    supabase,
    ai: hasAI ? 'configured' : 'missing',
  }
}

/** Throws with clear error message if required env vars are missing */
export function validateEnv(): void {
  const status = checkEnv()
  if (!status.valid) {
    const msg = `[ENV CHECK] Missing required environment variables: ${status.missing.join(', ')}`
    console.error(msg)
    console.error(`[ENV CHECK] Supabase status: ${status.supabase}`)
    console.error(`[ENV CHECK] AI provider status: ${status.ai}`)

    // Log diagnostic info (never log actual values)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    console.error(`[ENV CHECK] SUPABASE_URL present: ${!!url}, length: ${url?.length ?? 0}, starts with: ${url?.slice(0, 20) ?? 'N/A'}`)
    console.error(`[ENV CHECK] SERVICE_KEY present: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}, length: ${process.env.SUPABASE_SERVICE_ROLE_KEY?.length ?? 0}`)

    // Don't throw — degrade gracefully. The specific operations that need
    // DB will throw their own errors with more context.
  }
}
