'use client'

import React, { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/verdant/AppLayout'
import { Plus, ChevronRight } from 'lucide-react'

const spaceData: Record<string, {
  dot: string
  desc: string
  threads: { title: string; date: string }[]
}> = {
  'mycorrhizal-networks': {
    dot: '#2E5D3E',
    desc: 'Deep dives into fungal symbiosis, nutrient cycling, and the "wood wide web" communication systems.',
    threads: [
      { title: 'Mycorrhizal carbon exchange rates', date: 'Today' },
      { title: 'Ectomycorrhizal host specificity', date: '2 days ago' },
      { title: 'Forest floor microbiome dynamics', date: '1 week ago' },
    ],
  },
  'climate-modeling-sea': {
    dot: '#B45309',
    desc: 'Sea level projections, coral bleaching data, and NOAA synthesis for Southeast Asian waters.',
    threads: [
      { title: 'ENSO impact on Java rainfall', date: 'Yesterday' },
      { title: 'Sea level projections 2050', date: '3 days ago' },
      { title: 'Monsoon variability patterns', date: '1 week ago' },
    ],
  },
  'kitlv-colonial-records': {
    dot: '#1D4ED8',
    desc: 'Dutch colonial botanical surveys and natural history records from 1850–1920, cross-referenced with modern data.',
    threads: [
      { title: 'Herbarium Bogoriense index', date: '3 days ago' },
      { title: '1880 land surveys Borneo', date: '5 days ago' },
      { title: 'Reinwardtia Vol. 1–12 analysis', date: '1 week ago' },
    ],
  },
  'coral-reef-dynamics': {
    dot: '#4D7C0F',
    desc: 'Thermal stress events, bleaching chronology, and species resilience rankings in the Coral Triangle.',
    threads: [
      { title: 'Coral Triangle temperature anomalies', date: '5 days ago' },
      { title: 'Species resilience rankings', date: '1 week ago' },
      { title: 'Bleaching event chronology', date: '2 weeks ago' },
    ],
  },
  'javanese-land-use-history': {
    dot: '#92400E',
    desc: 'Historical land-use patterns from Dutch colonial era through post-independence reforms.',
    threads: [
      { title: 'Cultuurstelsel crop mapping', date: '2 days ago' },
      { title: 'Post-independence land reform', date: '4 days ago' },
      { title: 'Current deforestation rates', date: '1 week ago' },
    ],
  },
}

export default function SpaceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const title = slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const data = spaceData[slug]

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
            <span style={{ color: 'var(--text-main)' }}>{title}</span>
          </nav>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              {data && <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: data.dot, marginBottom: '10px' }} />}
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '30px', fontWeight: '400', color: '#1A2F23', marginBottom: '8px' }}>{title}</h1>
              <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '14px', color: 'var(--text-muted)', maxWidth: '500px' }}>
                {data?.desc ?? 'A collection of your research threads.'}
              </p>
            </div>
            <button
              onClick={() => router.push(`/?space=${slug}`)}
              className="btn btn-ghost"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px' }}
            >
              <Plus size={15} />
              New Thread
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(data?.threads ?? []).map(thread => (
              <Link
                key={thread.title}
                href={`/research?q=${encodeURIComponent(thread.title)}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  className="card"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#FFFFFF'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: data?.dot ?? '#1A2F23', flexShrink: 0 }} />
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '15px', color: '#1A2F23' }}>{thread.title}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>{thread.date}</span>
                    <ChevronRight size={15} style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
              </Link>
            ))}

            {(!data?.threads || data.threads.length === 0) && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#1A2F23', marginBottom: '8px' }}>No threads yet</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13.5px' }}>Start a new research thread in this space.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
