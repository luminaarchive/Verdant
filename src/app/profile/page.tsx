'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/verdant/Sidebar'
import { TopBar } from '@/components/verdant/TopBar'

export default function ProfilePage() {
  const router = useRouter()
  return (
    <div style={{ background: '#F9F8F4', display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
              <div>
                <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '400', color: '#1A2F23', marginBottom: '6px' }}>Profile</h1>
                <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#8A9288' }}>Your Verdant researcher profile.</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => router.push('/settings')}
                  style={{ background: '#FFFFFF', color: '#4A5248', border: '1px solid rgba(26,46,26,0.15)', borderRadius: '6px', height: '36px', padding: '0 16px', fontSize: '13px', fontFamily: 'system-ui, sans-serif', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.15s, color 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1A2F23'; (e.currentTarget as HTMLElement).style.color = '#FFFFFF'; (e.currentTarget as HTMLElement).style.borderColor = '#1A2F23' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FFFFFF'; (e.currentTarget as HTMLElement).style.color = '#4A5248'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,46,26,0.15)' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>settings</span>
                  Settings
                </button>
              </div>
            </div>
            <div style={{ background: '#FFFFFF', border: '1px solid rgba(26,46,26,0.12)', borderRadius: '4px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#EDE8DC', border: '1px solid rgba(26,46,26,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#747871' }}>account_circle</span>
                </div>
                <div>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#1A2F23' }}>Naturalist</p>
                  <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#747871' }}>Environmental Researcher</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
                {[{ label: 'Research Sessions', value: '14' }, { label: 'Day Streak', value: '14' }, { label: 'Trees Grown', value: '22' }].map((stat) => (
                  <div key={stat.label}>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '400', color: '#1A2F23' }}>{stat.value}</p>
                    <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '12px', color: '#747871' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid rgba(26,46,26,0.08)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#8A9288' }}>Joined April 2026</p>
                <button 
                  onClick={() => alert('Sign out clicked')}
                  style={{ background: 'transparent', color: '#E05A3A', border: 'none', fontSize: '13px', fontFamily: 'system-ui, sans-serif', fontWeight: '500', cursor: 'pointer', transition: 'opacity 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.7'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
