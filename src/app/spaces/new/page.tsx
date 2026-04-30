'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sidebar } from '@/components/verdant/Sidebar'
import { TopBar } from '@/components/verdant/TopBar'

export default function NewSpacePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return
    const slug = title.toLowerCase().replace(/\s+/g, '-')
    router.push(`/spaces/${slug}`)
  }

  return (
    <div style={{ background: '#FAFAF7', display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <div style={{ maxWidth: '600px', margin: '40px auto 0' }}>
            {/* Breadcrumb */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'system-ui, sans-serif', fontSize: '12px', color: '#747871', marginBottom: '16px' }}>
              <Link href="/spaces" style={{ color: '#747871', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#1A2E1A'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#747871'}
              >Spaces</Link>
              <span>›</span>
              <span style={{ color: '#1b1c1a' }}>New Space</span>
            </nav>

            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '400', color: '#1A2E1A', marginBottom: '8px' }}>Create New Space</h1>
            <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#8A9288', marginBottom: '32px' }}>
              Organize your research threads into a dedicated collection.
            </p>

            <form onSubmit={handleCreate} style={{ background: '#F5F2EB', border: '1px solid rgba(45,74,45,0.12)', borderRadius: '12px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', fontWeight: '600', color: '#1A2E1A' }}>Space Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Mycorrhizal Networks"
                  autoFocus
                  style={{ background: '#FAFAF7', border: '1px solid rgba(26,46,26,0.2)', borderRadius: '4px', padding: '10px 12px', fontSize: '14px', fontFamily: 'system-ui, sans-serif', color: '#1b1c1a', outline: 'none' }}
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', fontWeight: '600', color: '#1A2E1A' }}>Description (Optional)</label>
                <input 
                  type="text" 
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Brief description of this collection"
                  style={{ background: '#FAFAF7', border: '1px solid rgba(26,46,26,0.2)', borderRadius: '4px', padding: '10px 12px', fontSize: '14px', fontFamily: 'system-ui, sans-serif', color: '#1b1c1a', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button 
                  type="button"
                  onClick={() => router.push('/spaces')}
                  style={{ flex: 1, background: 'transparent', color: '#4A5248', border: '1px solid rgba(26,46,26,0.2)', borderRadius: '6px', height: '40px', fontSize: '13px', fontFamily: 'system-ui, sans-serif', fontWeight: '500', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(26,46,26,0.05)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!title}
                  style={{ flex: 1, background: title ? '#1A2E1A' : 'rgba(26,46,26,0.2)', color: '#F5F2EB', border: 'none', borderRadius: '6px', height: '40px', fontSize: '13px', fontFamily: 'system-ui, sans-serif', fontWeight: '500', cursor: title ? 'pointer' : 'default', transition: 'background 0.15s' }}
                >
                  Create Space
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
