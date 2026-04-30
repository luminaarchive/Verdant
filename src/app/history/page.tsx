'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/verdant/AppLayout'

const timeFilters = ['All Time', 'This Week', 'Today']

const catColors: Record<string, string> = {
  Ecology: '#2E5D3E', Botany: '#4D7C0F', Oceanography: '#1D4ED8',
  Geology: '#92400E', Biodiversity: '#B45309', Heritage: '#7C3AED',
}

type Session = { title: string; category: string; duration: string; sources: string; timestamp: string; group: string }

const sessions: Session[] = [
  { title: 'The Symbiotic Relationship Between Mycorrhizal Fungi', category: 'Ecology', duration: '8 min', sources: '6 sources', timestamp: '2h ago', group: 'Today' },
  { title: 'Javanese Land-use Patterns Through Colonial Records', category: 'Botany', duration: '5 min', sources: '4 sources', timestamp: '5h ago', group: 'Today' },
  { title: 'Coral Triangle Assessment — Thermal Stress Events', category: 'Oceanography', duration: '12 min', sources: '8 sources', timestamp: 'Yesterday', group: 'This Week' },
  { title: 'Carbon Sequestration in Indonesian Peatlands', category: 'Ecology', duration: '6 min', sources: '5 sources', timestamp: 'Yesterday', group: 'This Week' },
  { title: 'Tectonic History of the Sunda Arc', category: 'Geology', duration: '9 min', sources: '7 sources', timestamp: 'Mon', group: 'This Week' },
  { title: 'Wallace Line Biodiversity Gradient Analysis', category: 'Biodiversity', duration: '7 min', sources: '6 sources', timestamp: 'Mon', group: 'This Week' },
  { title: 'KITLV Colonial Natural History Records — Herbarium', category: 'Heritage', duration: '15 min', sources: '11 sources', timestamp: 'Last week', group: 'All Time' },
  { title: 'Deep Ocean Vents and Extremophile Evolution', category: 'Ecology', duration: '10 min', sources: '9 sources', timestamp: '2 weeks ago', group: 'All Time' },
]

export default function HistoryPage() {
  const [activeFilter, setActiveFilter] = useState('All Time')

  const filtered = activeFilter === 'All Time'
    ? sessions
    : sessions.filter(s => s.group === activeFilter)

  // Group by label for display
  const groups = filtered.reduce<Record<string, Session[]>>((acc, s) => {
    const label = s.group === 'Today' ? 'TODAY' : s.group === 'This Week' ? 'THIS WEEK' : 'OLDER'
    if (!acc[label]) acc[label] = []
    acc[label].push(s)
    return acc
  }, {})

  return (
    <AppLayout>
      <div style={{ padding: '36px 32px 60px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '34px', fontWeight: '400', color: '#1A2F23', marginBottom: '6px' }}>History</h1>
              <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '14px', color: 'var(--text-muted)' }}>
                Your research sessions and reading history.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
            {timeFilters.map(f => {
              const active = f === activeFilter
              return (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{
                    background: active ? '#1A2F23' : '#FFFFFF',
                    color: active ? '#FFFFFF' : 'var(--text-secondary)',
                    border: active ? '1px solid #1A2F23' : '1px solid var(--border-strong)',
                    borderRadius: '20px',
                    padding: '6px 16px',
                    fontSize: '13px',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: active ? '600' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.borderColor = '#1A2F23' } }}
                  onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)' } }}
                >
                  {f}
                </button>
              )
            })}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontSize: '14px' }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#1A2F23', marginBottom: '8px' }}>No sessions found</p>
              <p>No research sessions for this time period.</p>
            </div>
          ) : (
            Object.entries(groups).map(([label, groupSessions]) => (
              <div key={label} style={{ marginBottom: '32px' }}>
                <p style={{ fontSize: '10px', fontFamily: "'Inter', system-ui, sans-serif", textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '10px' }}>{label}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {groupSessions.map(s => (
                    <Link
                      key={s.title}
                      href={`/research?q=${encodeURIComponent(s.title)}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <div
                        className="card"
                        style={{
                          padding: '14px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FFFFFF' }}
                      >
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--green-mid)' }}>history</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: 'Georgia, serif', fontSize: '14.5px', color: '#1A2F23', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</p>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '11px', color: catColors[s.category] ?? 'var(--text-muted)', background: 'rgba(26,47,35,0.06)', borderRadius: '10px', padding: '2px 8px', fontFamily: "'Inter', sans-serif", fontWeight: '500' }}>{s.category}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>{s.duration}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>{s.sources}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', flexShrink: 0, fontFamily: "'Inter', sans-serif" }}>{s.timestamp}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  )
}
