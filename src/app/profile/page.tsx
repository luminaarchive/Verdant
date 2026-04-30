'use client'

import React from 'react'
import { Sidebar } from '@/components/verdant/Sidebar'
import { TopBar } from '@/components/verdant/TopBar'

export default function ProfilePage() {
  return (
    <div style={{ background: '#FAFAF7', display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '400', color: '#1A2E1A', marginBottom: '6px' }}>Profile</h1>
            <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#8A9288', marginBottom: '32px' }}>Your Verdant researcher profile.</p>
            <div style={{ background: '#F5F2EB', border: '1px solid rgba(26,46,26,0.12)', borderRadius: '4px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#EDE8DC', border: '1px solid rgba(26,46,26,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#747871' }}>account_circle</span>
                </div>
                <div>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#1A2E1A' }}>Naturalist</p>
                  <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#747871' }}>Environmental Researcher</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '24px' }}>
                {[{ label: 'Research Sessions', value: '14' }, { label: 'Day Streak', value: '14' }, { label: 'Trees Grown', value: '22' }].map((stat) => (
                  <div key={stat.label}>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '400', color: '#1A2E1A' }}>{stat.value}</p>
                    <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '12px', color: '#747871' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
