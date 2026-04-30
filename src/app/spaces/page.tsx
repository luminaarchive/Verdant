'use client'

import React from 'react'
import { Sidebar } from '@/components/verdant/Sidebar'
import { TopBar } from '@/components/verdant/TopBar'

const spaces = [
  { dot: '#3D6B3D', title: 'Mycorrhizal Networks', desc: 'Fungi, symbiosis, nutrient cycling.', threads: ['Mycorrhizal carbon exchange rates', 'Ectomycorrhizal host specificity', 'Forest floor microbiome dynamics'], trees: 5, lastActive: 'Today' },
  { dot: '#C49A3A', title: 'Climate Modeling SEA', desc: 'Sea level, coral, NOAA synthesis.', threads: ['ENSO impact on Java rainfall', 'Sea level projections 2050'], trees: 3, lastActive: '3 days ago' },
  { dot: '#6B8FAF', title: 'KITLV Colonial Records', desc: 'Dutch archives cross-referenced.', threads: ['Herbarium Bogoriense index', '1880 land surveys Borneo', 'Reinwardtia Vol. 1–12 analysis'], trees: 8, lastActive: '1 week ago' },
  { dot: '#7AAF6A', title: 'Coral Reef Dynamics', desc: 'Bleaching events, thermal stress.', threads: ['Coral Triangle temperature anomalies', 'Species resilience rankings'], trees: 2, lastActive: '5 days ago' },
  { dot: '#8B7355', title: 'Javanese Land Use History', desc: 'Colonial to modern land patterns.', threads: ['Cultuurstelsel crop mapping', 'Post-independence land reform'], trees: 4, lastActive: '2 days ago' },
]

export default function SpacesPage() {
  return (
    <div style={{ background: '#FAFAF7', display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '400', color: '#1A2E1A', marginBottom: '6px' }}>Spaces</h1>
                <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#8A9288' }}>Organized collections of your research threads.</p>
              </div>
              <button style={{ background: '#1A2E1A', color: '#F5F2EB', border: 'none', borderRadius: '8px', height: '36px', padding: '0 16px', fontSize: '13px', fontFamily: 'system-ui, sans-serif', fontWeight: '500', cursor: 'pointer' }}>
                New Space +
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {spaces.map((space) => (
                <div key={space.title} style={{ background: '#F5F2EB', border: '1px solid rgba(45,74,45,0.12)', borderRadius: '12px', padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#1A2E1A'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(45,74,45,0.12)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: space.dot }} />
                    <span style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#1A2E1A' }}>{space.title}</span>
                  </div>
                  <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '12px', color: '#8A9288', marginBottom: '12px' }}>{space.desc}</p>
                  <div style={{ flex: 1, marginBottom: '12px' }}>
                    {space.threads.map((t) => (
                      <p key={t} style={{ fontFamily: 'system-ui, sans-serif', fontSize: '12px', color: '#4A5248', lineHeight: '1.8' }}>→ {t}</p>
                    ))}
                  </div>
                  <span style={{ fontSize: '12px', fontFamily: 'system-ui, sans-serif', color: '#8A9288' }}>
                    {space.trees} trees grown · Last active {space.lastActive}
                  </span>
                </div>
              ))}
              <div style={{ border: '1px dashed rgba(45,74,45,0.25)', borderRadius: '12px', padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '160px' }}>
                <span style={{ fontSize: '24px', color: '#8A9288' }}>+</span>
                <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#8A9288' }}>Create a new space</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
