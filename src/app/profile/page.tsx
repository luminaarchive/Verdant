'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/verdant/AppLayout'
import { useToast } from '@/components/verdant/Toast'
import { Settings, LogOut, Flame, BookOpen, Search } from 'lucide-react'

const stats = [
  { label: 'Research Sessions', value: '14', icon: Search },
  { label: 'Day Streak', value: '14', icon: Flame },
  { label: 'Journal Entries', value: '7', icon: BookOpen },
]

const recentActivity = [
  { title: 'Mycorrhizal Networks', category: 'Ecology', time: '2 hours ago' },
  { title: 'Javanese Land-use Patterns', category: 'Botany', time: '5 hours ago' },
  { title: 'Coral Triangle Assessment', category: 'Oceanography', time: 'Yesterday' },
]

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)

  const handleSignOut = () => {
    setShowSignOutConfirm(false)
    toast('Signed out successfully', { icon: 'logout' })
    setTimeout(() => router.push('/'), 1200)
  }

  return (
    <AppLayout>
      <div style={{ padding: '36px 32px 60px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '34px', fontWeight: '400', color: '#1A2F23', marginBottom: '6px' }}>Profile</h1>
              <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '14px', color: 'var(--text-muted)' }}>Your Verdant researcher profile.</p>
            </div>
            <button
              onClick={() => router.push('/settings')}
              className="btn btn-ghost"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px' }}
            >
              <Settings size={15} />
              Settings
            </button>
          </div>

          {/* Profile Card */}
          <div className="card" style={{ padding: '28px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '24px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #D1FAE5, #1A2F23)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: '24px', color: '#FFFFFF' }}>N</span>
              </div>
              <div>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#1A2F23', marginBottom: '4px' }}>Naturalist</p>
                <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', color: 'var(--text-muted)' }}>Environmental Researcher</p>
                <span className="badge badge-green" style={{ marginTop: '6px', fontSize: '10px' }}>Academic Pro</span>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', paddingBottom: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border)' }}>
              {stats.map(s => {
                const Icon = s.icon
                return (
                  <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Icon size={14} style={{ color: 'var(--green-mid)' }} />
                      <p style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: '400', color: '#1A2F23', lineHeight: '1' }}>{s.value}</p>
                    </div>
                    <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '11.5px', color: 'var(--text-muted)' }}>{s.label}</p>
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '12.5px', color: 'var(--text-muted)' }}>Joined April 2026</p>
              {!showSignOutConfirm ? (
                <button
                  onClick={() => setShowSignOutConfirm(true)}
                  style={{
                    background: 'transparent',
                    color: 'var(--destructive)',
                    border: 'none',
                    fontSize: '13px',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.7'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                >
                  <LogOut size={13} />
                  Sign Out
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-muted)' }}>Confirm?</p>
                  <button
                    onClick={handleSignOut}
                    style={{ background: 'var(--destructive)', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '5px 12px', fontSize: '12.5px', fontFamily: "'Inter', sans-serif", fontWeight: '600', cursor: 'pointer' }}
                  >
                    Yes, sign out
                  </button>
                  <button
                    onClick={() => setShowSignOutConfirm(false)}
                    style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', fontSize: '12.5px', fontFamily: "'Inter', sans-serif", cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card" style={{ padding: '24px' }}>
            <p className="section-label">Recent Activity</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentActivity.map(a => (
                <Link key={a.title} href={`/research?q=${encodeURIComponent(a.title)}`} style={{ textDecoration: 'none' }}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '8px', transition: 'background 0.15s', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <div>
                      <p style={{ fontFamily: 'Georgia, serif', fontSize: '14px', color: '#1A2F23', marginBottom: '2px' }}>{a.title}</p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11.5px', color: 'var(--text-muted)' }}>{a.category}</p>
                    </div>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11.5px', color: 'var(--text-muted)', flexShrink: 0 }}>{a.time}</span>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <Link href="/history" style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--green-mid)', textDecoration: 'none', fontWeight: '500' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.textDecoration = 'underline'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.textDecoration = 'none'}
              >
                View full history →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
