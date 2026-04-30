'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/components/verdant/AppLayout'
import { ChevronRight } from 'lucide-react'

export default function NewSpacePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setIsCreating(true)
    const slug = title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    setTimeout(() => router.push(`/spaces/${slug}`), 400)
  }

  return (
    <AppLayout>
      <div style={{ padding: '36px 32px 60px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            <Link href="/spaces" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#1A2F23'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
            >Spaces</Link>
            <ChevronRight size={12} />
            <span style={{ color: 'var(--text-main)' }}>New Space</span>
          </nav>

          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '30px', fontWeight: '400', color: '#1A2F23', marginBottom: '8px' }}>Create New Space</h1>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>
            Organize your research threads into a focused collection.
          </p>

          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', fontWeight: '600', color: '#1A2F23' }}>
                  Space Title <span style={{ color: 'var(--destructive)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Mycorrhizal Networks"
                  autoFocus
                  required
                  maxLength={60}
                  className="input"
                />
                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
                  {title.length}/60 characters
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', fontWeight: '600', color: '#1A2F23' }}>
                  Description
                </label>
                <textarea
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Brief description of this research collection..."
                  rows={3}
                  maxLength={200}
                  className="input"
                  style={{ resize: 'vertical', minHeight: '80px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => router.push('/spaces')}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || isCreating}
                className="btn btn-primary"
                style={{ minWidth: '140px' }}
              >
                {isCreating ? 'Creating...' : 'Create Space'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
