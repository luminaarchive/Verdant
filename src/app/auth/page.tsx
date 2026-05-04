'use client'

import React, { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/components/providers/LanguageProvider'

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const { language, setLanguage, t } = useLanguage()

  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [organization, setOrganization] = useState('')
  const [error, setError] = useState('')
  const humanizeAuthError = (message: string) => {
    const m = message.toLowerCase()
    if (m.includes('database error saving new user')) {
      return language === 'id'
        ? 'Pendaftaran belum dapat diproses sementara. Tim kami sudah menerima log teknis. Coba lagi beberapa saat atau gunakan email lain.'
        : 'Sign up is temporarily unavailable due to account provisioning issues. Technical logs were captured. Please retry in a moment or use another email.'
    }
    if (m.includes('invalid login credentials') || m.includes('credential')) {
      return language === 'id'
        ? 'Email atau password tidak valid. Periksa kembali dan coba lagi.'
        : 'Invalid email or password. Please verify your credentials and try again.'
    }
    if (m.includes('load failed') || m.includes('network')) {
      return language === 'id'
        ? 'Koneksi terputus saat autentikasi. Coba lagi.'
        : 'Authentication request failed to load. Please retry.'
    }
    return message
  }

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg-elevated)',
    fontFamily: "'Inter', system-ui, sans-serif", fontSize: '14px', color: 'var(--text-main)',
    outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box' as const,
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const supabase = createClient()

      const safeEmail = email.trim().toLowerCase()
      const safePassword = password.trim()
      const safeDisplayName = displayName.trim()
      const safeOrganization = organization.trim()
      if (!safeEmail || !safePassword) {
        setError(language === 'id' ? 'Email dan password wajib diisi.' : 'Email and password are required.')
        setLoading(false)
        return
      }

      if (isSignUp) {
        let { error: signUpError } = await supabase.auth.signUp({
          email: safeEmail,
          password: safePassword,
          options: {
            data: {
              display_name: safeDisplayName || safeEmail.split('@')[0],
              organization: safeOrganization || null,
            },
          },
        })
        // Retry without metadata for DB triggers that reject unexpected profile fields.
        if (signUpError?.message?.toLowerCase().includes('database error saving new user')) {
          const retry = await supabase.auth.signUp({
            email: safeEmail,
            password: safePassword,
          })
          signUpError = retry.error
        }
        if (signUpError) {
          setError(humanizeAuthError(signUpError.message))
          setLoading(false)
          return
        }
        setSuccess(language === 'id' ? 'Akun berhasil dibuat! Mengalihkan...' : 'Account created! Signing you in...')
        setTimeout(() => router.push(redirect), 1200)
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: safeEmail, password: safePassword })
        if (signInError) {
          setError(humanizeAuthError(signInError.message))
          setLoading(false)
          return
        }
        router.push(redirect)
      }
    } catch {
      setError(language === 'id' ? 'Terjadi kesalahan tak terduga. Silakan coba lagi.' : 'An unexpected error occurred. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{ width: '100%', maxWidth: '440px', position: 'relative' }}>
      {/* Language Toggle */}
      <div className="absolute top-0 right-0 slide-up" style={{ display: 'flex', gap: '4px', background: 'var(--bg-elevated)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <button
          onClick={() => setLanguage('en')}
          style={{ background: language === 'en' ? 'var(--bg-surface)' : 'transparent', color: language === 'en' ? 'var(--text-main)' : 'var(--text-muted)', border: 'none', padding: '4px 8px', fontSize: '11px', fontWeight: language === 'en' ? '600' : '500', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', boxShadow: language === 'en' ? 'var(--shadow-sm)' : 'none' }}
        >EN</button>
        <button
          onClick={() => setLanguage('id')}
          style={{ background: language === 'id' ? 'var(--bg-surface)' : 'transparent', color: language === 'id' ? 'var(--text-main)' : 'var(--text-muted)', border: 'none', padding: '4px 8px', fontSize: '11px', fontWeight: language === 'id' ? '600' : '500', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s', boxShadow: language === 'id' ? 'var(--shadow-sm)' : 'none' }}
        >ID</button>
      </div>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '36px', paddingTop: '20px' }} className="slide-up">
        <h1 className="heading-display" style={{ fontSize: '42px', letterSpacing: '-1px', marginBottom: '6px' }}>verdant</h1>
        <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', color: 'var(--text-muted)' }}>{language === 'id' ? 'Platform Intelijen Lingkungan' : 'Environmental Intelligence Platform'}</p>
      </div>

      {/* Card */}
      <div
        className="card-premium slide-up stagger-1"
        style={{ padding: '32px' }}
      >
        <h2 className="heading-card" style={{ fontSize: '24px', marginBottom: '4px' }}>
          {isSignUp ? t.auth.createAccount : t.auth.welcome}
        </h2>
        <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          {isSignUp ? t.auth.join : (language === 'id' ? 'Masuk untuk melanjutkan riset Anda.' : 'Sign in to continue your research.')}
        </p>

        {error && (
          <div style={{ background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.15)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
            <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '12.5px', color: '#C0392B', lineHeight: '1.5' }}>{error}</p>
          </div>
        )}

        {success && (
          <div style={{ background: 'rgba(46,93,62,0.06)', border: '1px solid rgba(46,93,62,0.15)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
            <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '12.5px', color: '#2E5D3E', lineHeight: '1.5' }}>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isSignUp && (
            <>
              <div>
                <label style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary, rgba(26,47,35,0.7))', display: 'block', marginBottom: '6px' }}>Full Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Dr. Jane Wilson"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(26,47,35,0.3)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border, rgba(0,0,0,0.08))')}
                />
              </div>
              <div>
                <label style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary, rgba(26,47,35,0.7))', display: 'block', marginBottom: '6px' }}>Organization <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(optional)</span></label>
                <input
                  type="text"
                  value={organization}
                  onChange={e => setOrganization(e.target.value)}
                  placeholder="e.g. WWF, Stanford, UNEP"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(26,47,35,0.3)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border, rgba(0,0,0,0.08))')}
                />
              </div>
            </>
          )}

          <div>
            <label style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@institution.edu"
              required
              style={inputStyle}
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
              style={inputStyle}
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
            onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess('') }}
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
