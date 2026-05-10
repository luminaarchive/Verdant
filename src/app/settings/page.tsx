'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'
import { useToast } from '@/components/ui/Toast'
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/services/supabase/client'

type SearchMode = 'focus' | 'deep' | 'analytica'

const TIER_LABELS: Record<string, string> = {
  seeds: 'Seeds Free',
  sapling: 'Sapling',
  forest_keeper: 'Forest Keeper',
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [model, setModel] = useState<SearchMode>('focus')
  const [emailNotifs, setEmailNotifs] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Real user data
  const [email, setEmail] = useState('')
  const [tier, setTier] = useState('Seeds Free')
  const [joinedDate, setJoinedDate] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      // Load search mode from localStorage
      const saved = localStorage.getItem('verdant-search-mode') as SearchMode | null
      if (saved) setModel(saved)

      // Load real user data
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (user) {
        setEmail(user.email || '')
        setUserId(user.id)

        const { data: profile } = await sb
          .from('user_profiles')
          .select('subscription_tier, joined_at, email_notifications')
          .eq('id', user.id)
          .single()

        if (profile) {
          setTier(TIER_LABELS[profile.subscription_tier] || 'Seeds Free')
          setJoinedDate(new Date(profile.joined_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))
          setEmailNotifs(profile.email_notifications ?? false)
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    // Save search mode to localStorage
    localStorage.setItem('verdant-search-mode', model)

    // Save email notifications to Supabase
    if (userId) {
      const sb = createClient()
      const { error } = await sb
        .from('user_profiles')
        .update({ email_notifications: emailNotifs })
        .eq('id', userId)

      if (error) {
        toast('Failed to save notification preferences', { type: 'error' })
        setSaving(false)
        return
      }
    }

    setShowSaved(true)
    toast('Settings saved successfully', { icon: 'check_circle' })
    setTimeout(() => setShowSaved(false), 2500)
    setSaving(false)
  }

  return (
    <AppLayout>
      <div style={{ padding: '36px 32px 60px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            <Link href="/profile" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#1A2F23'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
            >Profile</Link>
            <ChevronRight size={12} />
            <span style={{ color: 'var(--text-main)' }}>Settings</span>
          </nav>

          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '34px', fontWeight: '400', color: '#1A2F23', marginBottom: '6px' }}>Settings</h1>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px' }}>
            Manage your Verdant preferences.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Account */}
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#1A2F23', marginBottom: '18px' }}>Account</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13.5px', color: 'var(--text-secondary)' }}>Email Address</p>
                  <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13.5px', color: 'var(--text-muted)' }}>
                    {loading ? '...' : (email || 'Not signed in')}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13.5px', color: 'var(--text-secondary)' }}>Subscription</p>
                  <span className="badge badge-green">{loading ? '...' : tier}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                  <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13.5px', color: 'var(--text-secondary)' }}>Member since</p>
                  <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13.5px', color: 'var(--text-muted)' }}>
                    {loading ? '...' : (joinedDate || 'Unknown')}
                  </p>
                </div>
              </div>
            </div>

            {/* Research Engine */}
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#1A2F23', marginBottom: '6px' }}>Research Engine</h2>
              <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
                Choose your default research mode. This affects the depth and format of results.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { id: 'focus' as SearchMode, label: 'Focus Mode', desc: 'Fast, concise analysis optimized for clarity.' },
                  { id: 'deep' as SearchMode, label: 'Deep Research', desc: 'Thorough multi-source synthesis for complex topics.' },
                  { id: 'analytica' as SearchMode, label: 'Analytica', desc: 'Statistical and data-heavy structured output.' },
                ].map(m => (
                  <label
                    key={m.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px 16px',
                      background: model === m.id ? 'rgba(209,250,229,0.3)' : 'var(--bg-elevated)',
                      border: `1px solid ${model === m.id ? 'rgba(26,47,35,0.2)' : 'var(--border)'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="mode"
                      checked={model === m.id}
                      onChange={() => setModel(m.id)}
                      style={{ accentColor: '#1A2F23', width: '16px', height: '16px' }}
                    />
                    <div>
                      <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13.5px', fontWeight: '600', color: '#1A2F23', marginBottom: '2px' }}>{m.label}</p>
                      <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '12px', color: 'var(--text-muted)' }}>{m.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="card" style={{ padding: '24px' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#1A2F23', marginBottom: '18px' }}>Notifications</h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13.5px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '2px' }}>Email Notifications</p>
                  <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '12px', color: 'var(--text-muted)' }}>Receive weekly digest of research trends</p>
                </div>
                <button
                  onClick={() => setEmailNotifs(!emailNotifs)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: emailNotifs ? '#1A2F23' : 'rgba(26,47,35,0.15)',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s ease',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '2px',
                    left: emailNotifs ? '22px' : '2px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    transition: 'left 0.2s ease',
                  }} />
                </button>
              </div>
            </div>

            {/* Save */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
              {showSaved && (
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--green-mid)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
                  Saved
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary"
                style={{ minWidth: '140px', height: '40px', opacity: saving ? 0.6 : 1 }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
