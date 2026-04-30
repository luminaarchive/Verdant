'use client'

import React, { useState } from 'react'
import { Sidebar } from '@/components/verdant/Sidebar'
import { TopBar } from '@/components/verdant/TopBar'

const timeFilters = ['All Time', 'This Week', 'This Month']

const catColors: Record<string, string> = {
  Ecology: '#3D6B3D', Botany: '#7AAF6A', Oceanography: '#6B8FAF',
  Geology: '#8B7355', Biodiversity: '#C49A3A', Heritage: '#A0856A',
}

const groups = [
  {
    label: 'TODAY',
    sessions: [
      { title: 'The Symbiotic Relationship Between Mycorrhizal Fungi', category: 'Ecology', duration: '8 min', sources: '6 sources', timestamp: '2h ago' },
      { title: 'Javanese Land-use Patterns', category: 'Botany', duration: '5 min', sources: '4 sources', timestamp: '5h ago' },
    ],
  },
  {
    label: 'YESTERDAY',
    sessions: [
      { title: 'Coral Triangle Assessment', category: 'Oceanography', duration: '12 min', sources: '8 sources', timestamp: 'Yesterday' },
      { title: 'Carbon Sequestration Peatlands', category: 'Ecology', duration: '6 min', sources: '5 sources', timestamp: 'Yesterday' },
    ],
  },
  {
    label: 'THIS WEEK',
    sessions: [
      { title: 'Tectonic History Sunda Arc', category: 'Geology', duration: '9 min', sources: '7 sources', timestamp: 'Mon' },
      { title: 'Wallace Line Biodiversity', category: 'Biodiversity', duration: '7 min', sources: '6 sources', timestamp: 'Mon' },
      { title: 'KITLV Colonial Records Analysis', category: 'Heritage', duration: '15 min', sources: '11 sources', timestamp: 'Sun' },
    ],
  },
]

export default function HistoryPage() {
  const [activeFilter, setActiveFilter] = useState('All Time')
  return (
    <div style={{ background: '#FAFAF7', display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '400', color: '#1A2E1A', marginBottom: '6px' }}>History</h1>
            <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#8A9288', marginBottom: '20px' }}>Your research sessions and reading history.</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
              {timeFilters.map((f) => {
                const active = f === activeFilter
                return (
                  <button key={f} onClick={() => setActiveFilter(f)} style={{ background: active ? '#1A2E1A' : '#F5F2EB', color: active ? '#F5F2EB' : '#4A5248', border: active ? 'none' : '1px solid rgba(45,74,45,0.2)', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', fontFamily: 'system-ui, sans-serif', cursor: 'pointer' }}>
                    {f}
                  </button>
                )
              })}
            </div>
            {groups.map((group) => (
              <div key={group.label} style={{ marginBottom: '28px' }}>
                <p style={{ fontSize: '10px', fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#8A9288', marginBottom: '8px' }}>{group.label}</p>
                {group.sessions.map((s) => (
                  <div key={s.title} style={{ background: '#F5F2EB', border: '1px solid rgba(45,74,45,0.12)', borderRadius: '10px', padding: '16px 20px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#1A2E1A'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(45,74,45,0.12)'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#3D6B3D', flexShrink: 0 }}>history</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'Georgia, serif', fontSize: '14px', color: '#1A2E1A', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: catColors[s.category] ?? '#747871', background: 'rgba(45,74,45,0.07)', borderRadius: '10px', padding: '2px 8px' }}>{s.category}</span>
                        <span style={{ fontSize: '11px', color: '#8A9288' }}>{s.duration}</span>
                        <span style={{ fontSize: '11px', color: '#8A9288' }}>{s.sources}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', color: '#8A9288', flexShrink: 0 }}>{s.timestamp}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
