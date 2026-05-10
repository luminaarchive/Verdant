import { createBrowserClient } from '@supabase/ssr'

// ─── Safe Browser Client ────────────────────────────────────────────────────
// Returns a real Supabase client if configured, or a no-op stub if not.
// This prevents the entire React app from crashing when NEXT_PUBLIC_SUPABASE_*
// variables are missing (e.g., in Preview environments without Supabase config).
//
// The stub client silently returns empty results for all operations, allowing
// the app to render and function (without auth/DB features).

let _cachedClient: ReturnType<typeof createBrowserClient> | null = null
let _initAttempted = false

// No-op stub that mimics the Supabase client API surface without crashing.
// All methods return empty/null results.
function createNoopClient(): any {
  const noopQuery = {
    select: () => noopQuery,
    insert: () => noopQuery,
    update: () => noopQuery,
    delete: () => noopQuery,
    upsert: () => noopQuery,
    eq: () => noopQuery,
    neq: () => noopQuery,
    gt: () => noopQuery,
    lt: () => noopQuery,
    gte: () => noopQuery,
    lte: () => noopQuery,
    like: () => noopQuery,
    ilike: () => noopQuery,
    is: () => noopQuery,
    in: () => noopQuery,
    order: () => noopQuery,
    limit: () => noopQuery,
    single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    then: (resolve: any) => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }).then(resolve),
  }

  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: (_event: any, _callback: any) => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signInWithOAuth: () => Promise.resolve({ data: { url: null, provider: null }, error: { message: 'Supabase not configured' } }),
    },
    from: () => noopQuery,
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        download: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        remove: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      }),
    },
  }
}

export function createClient() {
  if (_cachedClient) return _cachedClient
  if (_initAttempted) return createNoopClient()

  _initAttempted = true

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  if (!url || !key) {
    console.warn('[supabase/client] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. Auth features disabled.')
    return createNoopClient()
  }

  try {
    _cachedClient = createBrowserClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
    return _cachedClient
  } catch (e) {
    console.error('[supabase/client] Failed to create browser client:', (e as Error).message)
    return createNoopClient()
  }
}
