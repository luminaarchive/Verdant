'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/verdant/AppLayout'
import { useToast } from '@/components/verdant/Toast'
import { AvatarModal } from '@/components/verdant/AvatarModal'
import { Settings, LogOut, Flame, BookOpen, Search, Eye, Download, Camera, MapPin, Globe, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getStreak } from '@/lib/streak/client'
import { getTopSpecializations, getMemory } from '@/lib/intelligence/memory'
import { getStatusInsights } from '@/lib/intelligence/status'
import { getPrestigeLevel } from '@/lib/intelligence/prestige'
import { useLanguage } from '@/components/providers/LanguageProvider'

interface UserProfile {
  display_name: string | null
  username?: string | null
  bio?: string | null
  avatar_url?: string | null
  subscription_tier: string
  research_count: number
  streak_days: number
  joined_at: string
  organization?: string | null
  role?: string | null
  research_focus?: string | null
  location?: string | null
  website?: string | null
}

const TIER_LABELS: Record<string, string> = { seeds: 'Seeds Free', sapling: 'Sapling', forest_keeper: 'Forest Keeper' }

const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: '8px',
  border: '1.5px solid var(--border-strong)', background: 'var(--bg-surface)',
  fontFamily: "'Manrope', system-ui, sans-serif" as const, fontSize: '14px',
  color: 'var(--text-main)', outline: 'none', boxSizing: 'border-box' as const,
  transition: 'border-color 0.15s, box-shadow 0.15s',
}

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { language, setLanguage } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [showAvatar, setShowAvatar] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [streakDays, setStreakDays] = useState(0)
  const [journalCount, setJournalCount] = useState(0)
  const [watchlistCount, setWatchlistCount] = useState(0)
  const [exportsCount, setExportsCount] = useState(0)

  // Edit form state
  const [form, setForm] = useState({ displayName: '', username: '', bio: '', organization: '', role: '', research_focus: '', location: '', website: '' })

  useEffect(() => {
    async function load() {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) { router.push('/auth'); return }
      setEmail(user.email || '')
      setUserId(user.id)

      const { data: p } = await sb.from('user_profiles').select('*').eq('id', user.id).single()
      if (p) {
        setProfile(p)
        setForm({
          displayName: p.display_name || '', username: p.username || '',
          bio: p.bio || '', organization: p.organization || '',
          role: p.role || '', research_focus: p.research_focus || '',
          location: p.location || '', website: p.website || '',
        })
      }

      try { const j = JSON.parse(localStorage.getItem('verdant-journal') ?? '[]'); setJournalCount(j.length) } catch {}
      try { const w = JSON.parse(localStorage.getItem('verdant-watchlists') ?? '[]'); setWatchlistCount(w.length) } catch {}
      try { setExportsCount(parseInt(localStorage.getItem('verdant-exports-count') ?? '0', 10)) } catch {}
      setStreakDays(getStreak().days)
      setLoading(false)
    }
    load()
  }, [router])

  const handleSave = async () => {
    setSaving(true)
    try {
      const sb = createClient()
      const { error } = await sb.from('user_profiles').update({
        display_name: form.displayName || null, username: form.username || null,
        bio: form.bio || null, organization: form.organization || null,
        role: form.role || null, research_focus: form.research_focus || null,
        location: form.location || null, website: form.website || null,
        updated_at: new Date().toISOString(),
      }).eq('id', userId)

      if (error) {
        if (error.code === '23505') toast('Username already taken', { type: 'error' })
        else toast('Failed to save', { type: 'error' })
      } else {
        setProfile(prev => prev ? { ...prev, ...form, display_name: form.displayName } : prev)
        toast('Profile updated', { type: 'success', icon: 'save' })
        setEditing(false)
      }
    } catch { toast('Failed to save', { type: 'error' }) }
    setSaving(false)
  }

  const handleSignOut = async () => {
    const sb = createClient()
    await sb.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  const displayName = profile?.display_name || email.split('@')[0] || 'Researcher'
  const initial = displayName.charAt(0).toUpperCase()
  const tier = TIER_LABELS[profile?.subscription_tier ?? 'seeds'] || 'Seeds Free'
  const joinedDate = profile?.joined_at ? new Date(profile.joined_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''
  const researchCount = profile?.research_count ?? 0
  const avatarUrl = profile?.avatar_url

  const stats = [
    { label: 'Research', value: String(researchCount), icon: Search },
    { label: 'Streak', value: `${streakDays}d`, icon: Flame },
    { label: 'Journal', value: String(journalCount), icon: BookOpen },
    { label: 'Watchlists', value: String(watchlistCount), icon: Eye },
    { label: 'Exports', value: String(exportsCount), icon: Download },
  ]

  if (loading) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: '13px', color: 'var(--text-muted)' }}>Loading profile...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div style={{ padding: '36px 32px 60px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }} className="slide-up">
            <div>
              <h1 className="heading-page" style={{ marginBottom: '6px' }}>Profile</h1>
              <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: '14px', color: 'var(--text-muted)' }}>Your Verdant researcher profile.</p>
            </div>
            <button onClick={() => router.push('/settings')} className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px' }}>
              <Settings size={15} /> Settings
            </button>
          </div>

          {/* Profile Hero Card */}
          <div className="card-premium slide-up stagger-1" style={{ padding: '32px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
              {/* Avatar with edit overlay */}
              <div style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }} onClick={() => setShowAvatar(true)}>
                <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, #D1FAE5, #1A2F23)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '3px solid var(--bg-surface)', boxShadow: 'var(--shadow-md)' }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '36px', color: '#FFFFFF' }}>{initial}</span>
                  )}
                </div>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0' }}>
                  <Camera size={20} color="#FFFFFF" />
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <p className="heading-card" style={{ fontSize: '26px', marginBottom: '2px' }}>{displayName}</p>
                {profile?.username && (
                  <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>@{profile.username}</p>
                )}
                <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                  {profile?.role || 'Environmental Researcher'}
                  {profile?.organization && <span> · {profile.organization}</span>}
                </p>
                {profile?.bio && (
                  <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: '1.5' }}>{profile.bio}</p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                  <span className="badge badge-green" style={{ fontSize: '10px' }}>{tier}</span>
                  {joinedDate && <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: "'Manrope', sans-serif" }}>Joined {joinedDate}</span>}
                  {profile?.location && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: "'Manrope', sans-serif" }}>
                      <MapPin size={11} /> {profile.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', padding: '16px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
              {stats.map(s => {
                const Icon = s.icon
                return (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <Icon size={13} style={{ color: 'var(--green-mid)' }} />
                      <p style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '24px', color: 'var(--green-dark)', lineHeight: '1' }}>{s.value}</p>
                    </div>
                    <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.label}</p>
                  </div>
                )
              })}
            </div>

            {/* Quick actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              {(profile?.subscription_tier === 'seeds' || !profile?.subscription_tier) && (
                <Link href="/pricing" style={{ textDecoration: 'none' }}>
                  <button className="btn btn-primary" style={{ height: '32px', fontSize: '12px', gap: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>workspace_premium</span> Upgrade
                  </button>
                </Link>
              )}
              <button onClick={() => setEditing(true)} className="btn btn-ghost" style={{ height: '32px', fontSize: '12px', marginLeft: 'auto' }}>
                Edit Profile
              </button>
            </div>
          </div>

          {/* Edit Profile Form */}
          {editing && (
            <div className="card-premium slide-up" style={{ padding: '28px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="heading-card" style={{ fontSize: '18px', margin: 0 }}>Edit Profile</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ height: '34px', fontSize: '12px', opacity: saving ? 0.6 : 1 }}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button onClick={() => setEditing(false)} className="btn btn-ghost" style={{ height: '34px', fontSize: '12px' }}>Cancel</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontFamily: "'Manrope', sans-serif", fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Display Name</label>
                  <input type="text" value={form.displayName} onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))} placeholder="Dr. Jane Wilson" style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--green-dark)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26,47,35,0.06)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.boxShadow = 'none' }} />
                </div>
                <div>
                  <label style={{ fontFamily: "'Manrope', sans-serif", fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Username</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '14px', fontFamily: "'Manrope', sans-serif" }}>@</span>
                    <input type="text" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase() }))} placeholder="janewilson" style={{ ...inputStyle, paddingLeft: '28px' }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--green-dark)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26,47,35,0.06)' }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.boxShadow = 'none' }} />
                  </div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontFamily: "'Manrope', sans-serif", fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Bio <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({form.bio.length}/160)</span></label>
                  <textarea value={form.bio} onChange={e => { if (e.target.value.length <= 160) setForm(p => ({ ...p, bio: e.target.value })) }} placeholder="Environmental researcher focused on..." rows={2}
                    style={{ ...inputStyle, resize: 'vertical' as const, minHeight: '60px' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--green-dark)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26,47,35,0.06)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.boxShadow = 'none' }} />
                </div>
                <div>
                  <label style={{ fontFamily: "'Manrope', sans-serif", fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Organization</label>
                  <input type="text" value={form.organization} onChange={e => setForm(p => ({ ...p, organization: e.target.value }))} placeholder="e.g. WWF, Stanford" style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--green-dark)' }} onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-strong)' }} />
                </div>
                <div>
                  <label style={{ fontFamily: "'Manrope', sans-serif", fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Role / Title</label>
                  <input type="text" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} placeholder="e.g. Senior Ecologist" style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--green-dark)' }} onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-strong)' }} />
                </div>
                <div>
                  <label style={{ fontFamily: "'Manrope', sans-serif", fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Location</label>
                  <input type="text" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Jakarta, Indonesia" style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--green-dark)' }} onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-strong)' }} />
                </div>
                <div>
                  <label style={{ fontFamily: "'Manrope', sans-serif", fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Website</label>
                  <input type="url" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} placeholder="https://..." style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--green-dark)' }} onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-strong)' }} />
                </div>
                <div>
                  <label style={{ fontFamily: "'Manrope', sans-serif", fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Research Focus</label>
                  <input type="text" value={form.research_focus} onChange={e => setForm(p => ({ ...p, research_focus: e.target.value }))} placeholder="e.g. Coral reef ecology" style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--green-dark)' }} onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-strong)' }} />
                </div>
                <div>
                  <label style={{ fontFamily: "'Manrope', sans-serif", fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Intelligence Language</label>
                  <select value={language} onChange={e => setLanguage(e.target.value as 'en' | 'id')} style={inputStyle}>
                    <option value="en">English (US)</option>
                    <option value="id">Bahasa Indonesia</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Research Memory */}
          {(() => {
            const specializations = typeof window !== 'undefined' ? getTopSpecializations(5) : []
            const mem = typeof window !== 'undefined' ? getMemory() : null
            if (specializations.length === 0) return null
            return (
              <div className="card-premium slide-up stagger-2" style={{ padding: '24px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <p className="heading-card" style={{ fontSize: '18px', margin: 0 }}>Environmental Memory</p>
                  {mem?.specialization && <span className="chip" style={{ fontSize: '10px' }}>{mem.specialization}</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {specializations.map(s => (
                    <div key={s.topic} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', background: 'var(--bg-main)' }}>
                      <div>
                        <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: '13px', fontWeight: 500, color: 'var(--text-main)' }}>{s.topic}</p>
                        <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: '11px', color: 'var(--text-muted)' }}>{s.count} session{s.count !== 1 ? 's' : ''}</p>
                      </div>
                      <div style={{ width: `${Math.min(100, s.count * 15)}px`, height: '4px', borderRadius: '2px', background: 'rgba(26,47,35,0.08)' }}>
                        <div style={{ width: '100%', height: '100%', borderRadius: '2px', background: '#1A2F23' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Account & Danger Zone */}
          <div className="card-premium slide-up stagger-3" style={{ padding: '24px' }}>
            <p className="heading-card" style={{ fontSize: '18px', marginBottom: '16px' }}>Account</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</p>
                  <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: '13.5px', color: 'var(--text-main)' }}>{email}</p>
                </div>
                <span className="badge badge-green">{tier}</span>
              </div>
              <div style={{ height: '1px', background: 'var(--border)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={handleSignOut}
                  style={{ background: 'transparent', color: 'var(--destructive)', border: 'none', fontSize: '13px', fontFamily: "'Manrope', sans-serif", fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <LogOut size={13} /> Sign Out
                </button>
                <button onClick={() => toast('Account deletion coming soon', { type: 'info', icon: 'info' })}
                  style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', fontSize: '12px', fontFamily: "'Manrope', sans-serif", cursor: 'pointer' }}>
                  Delete account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAvatar && (
        <AvatarModal userId={userId} currentUrl={avatarUrl || null} onClose={() => setShowAvatar(false)}
          onUpdate={url => setProfile(prev => prev ? { ...prev, avatar_url: url } : prev)} />
      )}
    </AppLayout>
  )
}
