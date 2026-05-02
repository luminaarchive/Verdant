'use client'

import React, { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const supabase = createClient()

  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName } },
        })
        if (signUpError) { setError(signUpError.message); setLoading(false); return }
        if (data.user) {
          // Create user profile
          await supabase.from('user_profiles').insert({
            id: data.user.id,
            display_name: displayName || email.split('@')[0],
            subscription_tier: 'seeds',
            research_count: 0,
            streak_days: 0,
            tree_stage: 'seedling',
          })
          router.push(redirect)
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) { setError(signInError.message); setLoading(false); return }
        router.push(redirect)
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{ width: '100%', maxWidth: '440px' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: '400', color: '#1A2F23', letterSpacing: '-1px', marginBottom: '6px' }}>verdant</h1>
        <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', color: 'var(--text-muted, rgba(26,47,35,0.5))' }}>Environmental Intelligence Platform</p>
      </div>

      {/* Card */}
      <div
        className="card"
        style={{
          padding: '32px',
          background: 'var(--bg-card, #FFFFFF)',
          border: '1px solid var(--border, rgba(0,0,0,0.08))',
          borderRadius: 'var(--radius-md, 12px)',
        }}
      >
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '400', color: '#1A2F23', marginBottom: '4px' }}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          {isSignUp ? 'Join the environmental research community.' : 'Sign in to continue your research.'}
        </p>

        {error && (
          <div style={{ background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.15)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
            <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '12.5px', color: '#C0392B', lineHeight: '1.5' }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isSignUp && (
            <div>
              <label style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary, rgba(26,47,35,0.7))', display: 'block', marginBottom: '6px' }}>Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Your name"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '8px',
                  border: '1px solid var(--border, rgba(0,0,0,0.08))',
                  background: 'var(--bg-elevated, #F3F1EB)',
                  fontFamily: "'Inter', system-ui, sans-serif", fontSize: '14px', color: '#1A2F23',
                  outline: 'none', transition: 'border-color 0.15s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(26,47,35,0.3)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border, rgba(0,0,0,0.08))')}
              />
            </div>
          )}

          <div>
            <label style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                border: '1px solid var(--border, rgba(0,0,0,0.08))',
                background: 'var(--bg-elevated, #F3F1EB)',
                fontFamily: "'Inter', system-ui, sans-serif", fontSize: '14px', color: '#1A2F23',
                outline: 'none', transition: 'border-color 0.15s',
                boxSizing: 'border-box',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(26,47,35,0.3)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border, rgba(0,0,0,0.08))')}
            />
          </div>

          <div>
            <label style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                border: '1px solid var(--border, rgba(0,0,0,0.08))',
                background: 'var(--bg-elevated, #F3F1EB)',
                fontFamily: "'Inter', system-ui, sans-serif", fontSize: '14px', color: '#1A2F23',
                outline: 'none', transition: 'border-color 0.15s',
                boxSizing: 'border-box',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(26,47,35,0.3)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border, rgba(0,0,0,0.08))')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', height: '44px', marginTop: '4px', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError('') }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px',
              color: 'var(--text-muted)',
            }}
          >
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <span style={{ color: '#1A2F23', fontWeight: '600' }}>{isSignUp ? 'Sign In' : 'Sign Up'}</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <p style={{ textAlign: 'center', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '11px', color: 'var(--text-muted)', marginTop: '24px' }}>
        By continuing, you agree to Verdant&apos;s Terms of Service.
      </p>
    </div>
  )
}

export default function AuthPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main, #F9F8F4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <Suspense fallback={
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      }>
        <AuthForm />
      </Suspense>
    </div>
  )
}
