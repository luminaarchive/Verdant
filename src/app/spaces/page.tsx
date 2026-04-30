'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/verdant/AppLayout'
import { Plus } from 'lucide-react'

const spaces = [
  { dot: '#2E5D3E', title: 'Mycorrhizal Networks', desc: 'Fungi, symbiosis, nutrient cycling.', threads: ['Mycorrhizal carbon exchange rates', 'Ectomycorrhizal host specificity', 'Forest floor microbiome dynamics'], trees: 5, lastActive: 'Today' },
  { dot: '#B45309', title: 'Climate Modeling SEA', desc: 'Sea level, coral, NOAA synthesis.', threads: ['ENSO impact on Java rainfall', 'Sea level projections 2050', 'Monsoon variability patterns'], trees: 3, lastActive: '3 days ago' },
  { dot: '#1D4ED8', title: 'KITLV Colonial Records', desc: 'Dutch archives cross-referenced.', threads: ['Herbarium Bogoriense index', '1880 land surveys Borneo', 'Reinwardtia Vol. 1–12 analysis'], trees: 8, lastActive: '1 week ago' },
  { dot: '#4D7C0F', title: 'Coral Reef Dynamics', desc: 'Bleaching events, thermal stress.', threads: ['Coral Triangle temperature anomalies', 'Species resilience rankings', 'Bleaching event chronology'], trees: 2, lastActive: '5 days ago' },
  { dot: '#92400E', title: 'Javanese Land Use History', desc: 'Colonial to modern land patterns.', threads: ['Cultuurstelsel crop mapping', 'Post-independence land reform', 'Current deforestation rates'], trees: 4, lastActive: '2 days ago' },
]

export default function SpacesPage() {
  const router = useRouter()

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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {spaces.map(space => {
              const slug = space.title.toLowerCase().replace(/\s+/g, '-')
              return (
                <Link key={space.title} href={`/spaces/${slug}`} style={{ textDecoration: 'none' }}>
                  <div
                    className="card card-lift"
                    style={{ padding: '22px', cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '200px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: space.dot, flexShrink: 0 }} />
                      <span style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#1A2F23', fontWeight: '400' }}>{space.title}</span>
                    </div>
                    <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>{space.desc}</p>
                    <div style={{ flex: 1, marginBottom: '14px' }}>
                      {space.threads.map(t => (
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
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '11.5px', fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--text-muted)' }}>
                        🌱 {space.trees} trees
                      </span>
                      <span style={{ fontSize: '11.5px', fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--text-muted)' }}>
                        {space.lastActive}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}

            {/* Create new */}
            <div
              onClick={() => router.push('/spaces/new')}
              style={{
                border: '1.5px dashed rgba(26,47,35,0.18)',
                borderRadius: '12px',
                padding: '22px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                minHeight: '200px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLElement).style.borderColor = '#1A2F23'
                ;(e.currentTarget as HTMLElement).style.background = 'rgba(26,47,35,0.02)'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,47,35,0.18)'
                ;(e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(26,47,35,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={20} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
              </div>
              <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: '500' }}>Create a new space</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
