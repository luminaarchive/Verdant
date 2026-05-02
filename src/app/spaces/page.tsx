'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/verdant/AppLayout'
import { Plus } from 'lucide-react'

export interface SpaceData {
  id: string
  name: string
  description: string
  category: string
  slug: string
  dot: string
  createdAt: string
  threads: string[]
}

const CATEGORY_COLORS: Record<string, string> = {
  Ecology: '#2E5D3E', Biodiversity: '#B45309', Botany: '#4D7C0F',
  Mycology: '#7C3AED', Geology: '#92400E', Oceanography: '#1D4ED8',
}

// Seed data only shown when no user-created spaces exist
const SEED_SPACES: SpaceData[] = [
  { id: 'seed-1', name: 'Mycorrhizal Networks', description: 'Fungi, symbiosis, nutrient cycling.', category: 'Mycology', slug: 'mycorrhizal-networks', dot: '#7C3AED', createdAt: '2026-04-01T00:00:00Z', threads: ['Mycorrhizal carbon exchange rates', 'Ectomycorrhizal host specificity', 'Forest floor microbiome dynamics'] },
  { id: 'seed-2', name: 'Climate Modeling SEA', description: 'Sea level, coral, NOAA synthesis.', category: 'Oceanography', slug: 'climate-modeling-sea', dot: '#1D4ED8', createdAt: '2026-04-05T00:00:00Z', threads: ['ENSO impact on Java rainfall', 'Sea level projections 2050', 'Monsoon variability patterns'] },
  { id: 'seed-3', name: 'KITLV Colonial Records', description: 'Dutch archives cross-referenced.', category: 'Ecology', slug: 'kitlv-colonial-records', dot: '#2E5D3E', createdAt: '2026-04-10T00:00:00Z', threads: ['Herbarium Bogoriense index', '1880 land surveys Borneo', 'Reinwardtia Vol. 1–12 analysis'] },
]

const STORAGE_KEY = 'verdant-spaces'

export function getSpaces(): SpaceData[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return SEED_SPACES
    const parsed = JSON.parse(raw) as SpaceData[]
    return parsed.length > 0 ? parsed : SEED_SPACES
  } catch {
    return SEED_SPACES
  }
}

export function saveSpaces(spaces: SpaceData[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(spaces))
}

export function addSpace(space: Omit<SpaceData, 'id' | 'createdAt' | 'threads' | 'dot'>): SpaceData {
  const spaces = getSpaces()
  const newSpace: SpaceData = {
    ...space,
    id: `space-${Date.now()}`,
    dot: CATEGORY_COLORS[space.category] || '#2E5D3E',
    createdAt: new Date().toISOString(),
    threads: [],
  }
  spaces.push(newSpace)
  saveSpaces(spaces)
  return newSpace
}

export function getSpaceBySlug(slug: string): SpaceData | null {
  const spaces = getSpaces()
  return spaces.find(s => s.slug === slug) || null
}

export function addThreadToSpace(slug: string, thread: string): void {
  const spaces = getSpaces()
  const space = spaces.find(s => s.slug === slug)
  if (space && !space.threads.includes(thread)) {
    space.threads.unshift(thread)
    saveSpaces(spaces)
  }
}

export function removeSpace(id: string): void {
  const spaces = getSpaces().filter(s => s.id !== id)
  saveSpaces(spaces)
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hrs = Math.floor(diff / 3600000)
  if (hrs < 24) return 'Today'
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`
}

export default function SpacesPage() {
  const router = useRouter()
  const [spaces, setSpaces] = useState<SpaceData[]>([])

  useEffect(() => { setSpaces(getSpaces()) }, [])

  return (
    <AppLayout>
      <div style={{ padding: '36px 32px 60px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '34px', fontWeight: '400', color: '#1A2F23', marginBottom: '6px' }}>Spaces</h1>
              <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '14px', color: 'var(--text-muted)' }}>
                Organized collections of your research threads.
              </p>
            </div>
            <button
              onClick={() => router.push('/spaces/new')}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#253d2c'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#1A2F23'}
            >
              <Plus size={15} />
              New Space
            </button>
          </div>

          {spaces.length === 0 ? (
            <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--green-mid)', marginBottom: '12px', display: 'block' }}>folder_open</span>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#1A2F23', marginBottom: '8px' }}>No spaces yet</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto 16px', lineHeight: '1.6' }}>
                Create your first space to organize related research threads into focused collections.
              </p>
              <button onClick={() => router.push('/spaces/new')} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={14} /> Create Space
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {spaces.map(space => (
                <Link key={space.id} href={`/spaces/${space.slug}`} style={{ textDecoration: 'none' }}>
                  <div
                    className="card card-lift"
                    style={{ padding: '22px', cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '200px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: space.dot, flexShrink: 0 }} />
                      <span style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#1A2F23', fontWeight: '400' }}>{space.name}</span>
                    </div>
                    <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>{space.description}</p>
                    <div style={{ flex: 1, marginBottom: '14px' }}>
                      {space.threads.slice(0, 3).map(t => (
                        <p
                          key={t}
                          style={{
                            fontFamily: "'Inter', system-ui, sans-serif",
                            fontSize: '12.5px',
                            color: 'var(--text-secondary)',
                            lineHeight: '2',
                            paddingLeft: '12px',
                            borderLeft: `2px solid ${space.dot}30`,
                          }}
                        >
                          {t}
                        </p>
                      ))}
                      {space.threads.length === 0 && (
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No threads yet</p>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '11.5px', fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--text-muted)' }}>
                        {space.category} · {space.threads.length} thread{space.threads.length !== 1 ? 's' : ''}
                      </span>
                      <span style={{ fontSize: '11.5px', fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--text-muted)' }}>
                        {timeAgo(space.createdAt)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Create new card */}
              <div
                onClick={() => router.push('/spaces/new')}
                style={{
                  border: '1.5px dashed rgba(26,47,35,0.18)',
                  borderRadius: '12px', padding: '22px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '10px', minHeight: '200px', transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1A2F23'; (e.currentTarget as HTMLElement).style.background = 'rgba(26,47,35,0.02)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,47,35,0.18)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(26,47,35,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={20} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                </div>
                <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: '500' }}>Create a new space</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
