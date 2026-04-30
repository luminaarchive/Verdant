'use client'

import React, { use } from 'react'
import Link from 'next/link'
import { Sidebar } from '@/components/verdant/Sidebar'
import { TopBar } from '@/components/verdant/TopBar'

export default function SpaceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  
  // Basic capitalization of slug
  const title = resolvedParams.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  return (
    <div style={{ background: '#F9F8F4', display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            {/* Breadcrumb */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'system-ui, sans-serif', fontSize: '12px', color: '#747871', marginBottom: '24px' }}>
              <Link href="/spaces" style={{ color: '#747871', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#1A2F23'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#747871'}
              >Spaces</Link>
              <span>›</span>
              <span style={{ color: '#1b1c1a' }}>{title}</span>
            </nav>

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
              <div>
                <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '400', color: '#1A2F23', marginBottom: '6px' }}>{title}</h1>
                <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#8A9288' }}>
                  A collection of your research threads.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ background: '#FFFFFF', color: '#1A2F23', border: '1px solid rgba(26,46,26,0.15)', borderRadius: '6px', height: '36px', padding: '0 16px', fontSize: '13px', fontFamily: 'system-ui, sans-serif', fontWeight: '500', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#EDE8DC'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#FFFFFF'}
                >
                  Edit Space
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              {/* Dummy threads inside space */}
              {[1, 2, 3].map((i) => (
                <Link key={i} href={`/research?q=${encodeURIComponent(`${title} research part ${i}`)}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#FFFFFF', border: '1px solid rgba(45,74,45,0.12)', borderRadius: '8px', padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1A2F23'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(26,46,26,0.05)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(45,74,45,0.12)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
                  >
                    <div>
                      <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: '400', color: '#1A2F23', marginBottom: '4px' }}>{title} Exploration #{i}</h3>
                      <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#8A9288' }}>Last updated {i} days ago</p>
                    </div>
                    <span className="material-symbols-outlined" style={{ color: '#747871', fontSize: '20px' }}>chevron_right</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
