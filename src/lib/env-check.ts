// ─── Environment Variable Validation ────────────────────────────────────────
// validateEnv() is called at API route entry points.
// It logs clearly which variables are missing and THROWS if AI provider is
// absent — preventing silent 401/402 loops that waste the entire timeout budget.

export interface EnvStatus {
  valid: boolean
  missing: string[]
  supabase: 'configured' | 'missing_url' | 'missing_key' | 'missing_both'
  ai: 'configured' | 'missing'
  providers: { openrouter: boolean; gemini: boolean }
}

/** Returns status without throwing — use for health checks */
export function checkEnv(): EnvStatus {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  // Treat empty strings as missing — Vercel CLI sometimes writes empty strings
  const hasUrl = !!url && url.length > 0
  const hasAnonKey = !!anonKey && anonKey.length > 0
  const hasServiceKey = !!serviceKey && serviceKey.length > 0

  const geminiKey = process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_AI_API_KEY?.trim() || process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()
  const openrouterKey = process.env.OPENROUTER_API_KEY?.trim()
  const hasGemini = !!geminiKey && geminiKey.length > 0
  const hasOpenRouter = !!openrouterKey && openrouterKey.length > 0
  const hasAI = hasGemini || hasOpenRouter

  const missing: string[] = []
  if (!hasUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!hasAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  if (!hasServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')
  if (!hasAI) missing.push('OPENROUTER_API_KEY (or GEMINI_API_KEY)')

  let supabase: EnvStatus['supabase'] = 'configured'
  if (!hasUrl && !hasServiceKey) supabase = 'missing_both'
  else if (!hasUrl) supabase = 'missing_url'
  else if (!hasServiceKey) supabase = 'missing_key'

  return {
    valid: missing.length === 0,
    missing,
    supabase,
    ai: hasAI ? 'configured' : 'missing',
    providers: { openrouter: hasOpenRouter, gemini: hasGemini },
  }
}

/**
 * Validates environment variables and throws a clear error if the AI provider
 * is not configured. Supabase missing is logged as a warning (degraded mode
 * is acceptable — in-memory fallback handles it). AI missing is fatal.
 */
export function validateEnv(): void {
  const status = checkEnv()

  // Always log provider status on first call for debugging
  console.log(`[ENV] Provider status: OpenRouter=${status.providers.openrouter ? '✓' : '✗'}, Gemini=${status.providers.gemini ? '✓' : '✗'}, Supabase=${status.supabase}`)

  if (status.providers.openrouter) {
    const key = process.env.OPENROUTER_API_KEY?.trim() ?? ''
    console.log(`[ENV] OpenRouter key prefix: ${key.slice(0, 10)}... (length: ${key.length})`)
  }

  if (status.ai === 'missing') {
    const msg = [
      '[ENV] FATAL: No AI provider configured.',
      '[ENV] Set OPENROUTER_API_KEY in Vercel: Settings → Environment Variables → Production.',
      '[ENV] Without this key, all AI generation will fail with 401 errors.',
      '[ENV] If using .env.local, ensure keys are NOT set to empty strings (this overrides Vercel values).',
    ].join('\n')
    console.error(msg)
    throw new Error('AI provider not configured. Set OPENROUTER_API_KEY in Vercel environment variables.')
  }

  if (status.supabase !== 'configured') {
    console.warn(`[ENV] WARNING: Supabase not fully configured (status: ${status.supabase}).`)
    console.warn('[ENV] Missing:', status.missing.filter(m => !m.includes('OPENROUTER') && !m.includes('GEMINI')).join(', '))
    console.warn('[ENV] App will run in degraded mode — results will not be persisted.')
  }

  if (status.valid) {
    console.log('[ENV] All environment variables configured ✓')
  }
}

/** Returns a user-friendly error message for missing AI provider */
export function getAIProviderError(): string {
  const status = checkEnv()
  if (status.ai === 'missing') {
    return 'AI provider is not configured. Please contact support or try again later.'
  }
  return ''
}
