'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Sidebar } from '@/components/verdant/Sidebar'
import { TopBar } from '@/components/verdant/TopBar'

export default function SettingsPage() {
  const [model, setModel] = useState('claude')
  
  return (
    <div style={{ background: '#FAFAF7', display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            {/* Breadcrumb */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'system-ui, sans-serif', fontSize: '12px', color: '#747871', marginBottom: '16px' }}>
              <Link href="/profile" style={{ color: '#747871', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#1A2E1A'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#747871'}
              >Profile</Link>
              <span>›</span>
              <span style={{ color: '#1b1c1a' }}>Settings</span>
            </nav>

            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '400', color: '#1A2E1A', marginBottom: '6px' }}>Settings</h1>
            <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#8A9288', marginBottom: '32px' }}>Manage your Verdant preferences.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Account Card */}
              <div style={{ background: '#F5F2EB', border: '1px solid rgba(26,46,26,0.12)', borderRadius: '8px', padding: '24px' }}>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#1A2E1A', marginBottom: '16px' }}>Account</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#4A5248' }}>Email Address</p>
                    <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#1b1c1a' }}>researcher@verdant.org</p>
                  </div>
                  <div style={{ height: '1px', background: 'rgba(26,46,26,0.08)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#4A5248' }}>Subscription</p>
                    <span style={{ fontSize: '11px', background: '#3D6B3D', color: '#F5F2EB', borderRadius: '10px', padding: '2px 8px', fontFamily: 'system-ui, sans-serif' }}>Academic Pro</span>
                  </div>
                </div>
              </div>

              {/* Research Engine Card */}
              <div style={{ background: '#F5F2EB', border: '1px solid rgba(26,46,26,0.12)', borderRadius: '8px', padding: '24px' }}>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#1A2E1A', marginBottom: '16px' }}>Research Engine</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#4A5248', marginBottom: '12px' }}>Preferred AI Model</p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#1A2E1A' }}>
                        <input type="radio" name="model" checked={model === 'claude'} onChange={() => setModel('claude')} style={{ accentColor: '#3D6B3D' }} />
                        Claude 3.5 Sonnet
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#1A2E1A' }}>
                        <input type="radio" name="model" checked={model === 'gemini'} onChange={() => setModel('gemini')} style={{ accentColor: '#3D6B3D' }} />
                        Gemini 1.5 Pro
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button 
                  style={{ background: '#1A2E1A', color: '#F5F2EB', border: 'none', borderRadius: '6px', height: '40px', padding: '0 24px', fontSize: '14px', fontFamily: 'system-ui, sans-serif', fontWeight: '500', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#2D4A2D'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#1A2E1A'}
                  onClick={() => alert('Settings saved!')}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
