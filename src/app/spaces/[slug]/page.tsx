'use client'

import React, { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/verdant/AppLayout'
import { Plus, ChevronRight, Trash2, ArrowLeft } from 'lucide-react'
import { getSpaceBySlug, removeSpace, type SpaceData } from '@/app/spaces/page'

export default function SpaceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const [space, setSpace] = useState<SpaceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const found = getSpaceBySlug(slug)
    setSpace(found)
    setLoading(false)
  }, [slug])

  const handleDelete = () => {
    if (space) {
      removeSpace(space.id)
      router.push('/spaces')
    }
  }

  const title = slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  if (loading) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </AppLayout>
    )
  }

  if (!space) {
    return (
      <AppLayout>
        <div style={{ padding: '36px 32px 60px' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center', paddingTop: '80px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--text-muted)', display: 'block', marginBottom: '16px' }}>folder_off</span>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '400', color: '#1A2F23', marginBottom: '8px' }}>Space not found</h1>
            <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              The space &ldquo;{title}&rdquo; doesn&apos;t exist or has been deleted.
            </p>
            <button onClick={() => router.push('/spaces')} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={14} /> Back to Spaces
            </button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div style={{ padding: '36px 32px 60px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            <Link href="/spaces" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#1A2F23'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
            >Spaces</Link>
            <ChevronRight size={12} />
            <span style={{ color: 'var(--text-main)' }}>{space.name}</span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: space.dot, marginBottom: '10px' }} />
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '30px', fontWeight: '400', color: '#1A2F23', marginBottom: '8px' }}>{space.name}</h1>
              <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '14px', color: 'var(--text-muted)', maxWidth: '500px' }}>
                {space.description || 'A collection of your research threads.'}
              </p>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'var(--text-muted)', display: 'inline-block', marginTop: '8px' }}>{space.category}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => router.push(`/?q=${encodeURIComponent(space.name)}`)}
                className="btn btn-ghost"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px' }}
              >
                <Plus size={15} />
                New Thread
              </button>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn btn-ghost"
                  style={{ height: '38px', color: 'var(--destructive)' }}
                  title="Delete space"
                >
                  <Trash2 size={14} />
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button onClick={handleDelete} style={{ background: 'var(--destructive)', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', fontFamily: "'Inter', sans-serif", fontWeight: '600', cursor: 'pointer' }}>Delete</button>
                  <button onClick={() => setShowDeleteConfirm(false)} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', fontSize: '12px', fontFamily: "'Inter', sans-serif", cursor: 'pointer' }}>Cancel</button>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {space.threads.map(thread => (
              <Link
                key={thread}
                href={`/research?q=${encodeURIComponent(thread)}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  className="card"
                  style={{
                    padding: '16px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: '12px', cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#FFFFFF'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: space.dot, flexShrink: 0 }} />
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '15px', color: '#1A2F23' }}>{thread}</p>
                  </div>
                  <ChevronRight size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                </div>
              </Link>
            ))}

            {space.threads.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--green-mid)', display: 'block', marginBottom: '12px' }}>science</span>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#1A2F23', marginBottom: '8px' }}>No threads yet</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13.5px', marginBottom: '16px' }}>Start a new research thread in this space.</p>
                <button onClick={() => router.push(`/?q=${encodeURIComponent(space.name)}`)} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={14} /> Start Research
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
