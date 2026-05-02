'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/verdant/AppLayout'
import { RefreshCw } from 'lucide-react'

const timeFilters = ['All Time', 'This Week', 'Today']

const catColors: Record<string, string> = {
  Ecology: '#2E5D3E', Botany: '#4D7C0F', Oceanography: '#1D4ED8',
  Geology: '#92400E', Biodiversity: '#B45309', Heritage: '#7C3AED',
}

interface HistoryRun {
  run_id: string
  query: string
  mode: string
  status: string
  duration_ms: number | null
  created_at: string
  pipeline_source: string | null
}

function detectCategory(query: string): string {
  const q = query.toLowerCase()
  if (/ocean|coral|marine|reef|sea/.test(q)) return 'Oceanography'
  if (/plant|flora|botany|tree|peatland/.test(q)) return 'Botany'
  if (/bird|mammal|species|wildlife|biodiversity/.test(q)) return 'Biodiversity'
  if (/earthquake|tectonic|volcano|geology/.test(q)) return 'Geology'
  if (/colonial|heritage|historical|kitlv/.test(q)) return 'Heritage'
  return 'Ecology'
}

function formatDuration(ms: number | null): string {
  if (!ms) return ''
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)} min`
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

function getGroup(dateStr: string): 'TODAY' | 'THIS WEEK' | 'OLDER' {
  const now = new Date()
  const d = new Date(dateStr)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000)
  if (d >= todayStart) return 'TODAY'
  if (d >= weekStart) return 'THIS WEEK'
  return 'OLDER'
}

function SkeletonRow() {
  return (
    <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(26,47,35,0.06)', animation: 'shimmer 2s infinite' }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: '12px', width: '60%', background: 'rgba(26,47,35,0.08)', borderRadius: '4px', marginBottom: '8px', animation: 'shimmer 2s infinite' }} />
        <div style={{ height: '10px', width: '40%', background: 'rgba(26,47,35,0.05)', borderRadius: '4px', animation: 'shimmer 2s infinite' }} />
      </div>
    </div>
  )
}

export default function HistoryPage() {
  const [activeFilter, setActiveFilter] = useState('All Time')
  const [runs, setRuns] = useState<HistoryRun[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/history')
      if (!res.ok) throw new Error('Failed to fetch history')
      const data = await res.json()
      setRuns(data.runs || data || [])
    } catch {
      setError('Could not load research history.')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  // Filter runs by time
  const filtered = runs.filter(r => {
    if (activeFilter === 'All Time') return true
    const group = getGroup(r.created_at)
    if (activeFilter === 'Today') return group === 'TODAY'
    if (activeFilter === 'This Week') return group === 'TODAY' || group === 'THIS WEEK'
    return true
  })

  // Group by label
  const groups = filtered.reduce<Record<string, HistoryRun[]>>((acc, r) => {
    const label = getGroup(r.created_at)
    if (!acc[label]) acc[label] = []
    acc[label].push(r)
    return acc
  }, {})

  const groupOrder = ['TODAY', 'THIS WEEK', 'OLDER']

  return (
    <AppLayout>
      <div style={{ padding: '36px 32px 60px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }} className="slide-up">
            <div>
              <h1 className="heading-page" style={{ marginBottom: '6px' }}>History</h1>
              <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '14px', color: 'var(--text-muted)' }}>
                Your research sessions and reading history.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }} className="slide-up stagger-1">
            {timeFilters.map(f => {
              const active = f === activeFilter
              return (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={active ? 'chip chip-active' : 'chip'}
                  style={{ padding: '6px 16px', fontSize: '12.5px', cursor: 'pointer' }}
                >
                  {f}
                </button>
              )
            })}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow />
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '60px 0' }} className="slide-up stagger-2">
              <p className="heading-card" style={{ fontSize: '20px', marginBottom: '8px' }}>Something went wrong</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>{error}</p>
              <button onClick={fetchHistory} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={13} /> Retry
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontSize: '14px' }} className="slide-up stagger-2">
              <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--green-mid)', display: 'block', marginBottom: '12px' }}>science</span>
              <p className="heading-card" style={{ fontSize: '20px', marginBottom: '8px' }}>No sessions found</p>
              <p style={{ marginBottom: '16px' }}>No research sessions for this time period.</p>
              <Link href="/" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                Start Researching
              </Link>
            </div>
          )}

          {/* Sessions */}
          {!loading && !error && filtered.length > 0 && (
            groupOrder.map(label => {
              const groupSessions = groups[label]
              if (!groupSessions || groupSessions.length === 0) return null
              return (
                <div key={label} style={{ marginBottom: '32px' }}>
                  <p style={{ fontSize: '10px', fontFamily: "'Inter', system-ui, sans-serif", textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '10px' }}>{label}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} className="slide-up stagger-2">
                    {groupSessions.map(s => {
                      const category = detectCategory(s.query)
                      return (
                        <Link
                          key={s.run_id}
                          href={`/research?q=${encodeURIComponent(s.query)}`}
                          style={{ textDecoration: 'none' }}
                        >
                          <div
                            className="card-premium"
                            style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
                          >
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--green-mid)' }}>history</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '18px', color: '#1A2F23', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: '1.2' }}>{s.query}</p>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '11px', color: catColors[category] ?? 'var(--text-muted)', background: 'rgba(26,47,35,0.06)', borderRadius: '10px', padding: '2px 8px', fontFamily: "'Inter', sans-serif", fontWeight: '500' }}>{category}</span>
                                {s.duration_ms && <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>{formatDuration(s.duration_ms)}</span>}
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", textTransform: 'capitalize' }}>{s.mode}</span>
                              </div>
                            </div>
                            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', flexShrink: 0, fontFamily: "'Inter', sans-serif" }}>{timeAgo(s.created_at)}</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
      <style>{`@keyframes shimmer { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }`}</style>
    </AppLayout>
  )
}
