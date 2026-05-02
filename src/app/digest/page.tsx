'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/verdant/AppLayout'
import { ArrowRight, RefreshCw } from 'lucide-react'
import { generateDigest, getReturnVisitSummary, runChangeDetection, type DigestEntry } from '@/lib/retention/signals'
import { getWatchlists, WATCHLIST_TYPES } from '@/lib/retention/watchlists'
import { getDailyBrief } from '@/lib/intelligence/daily-brief'

const SEV_COLORS = { urgent: '#C0392B', important: '#B8860B', info: 'var(--green-mid)' }
const SEV_LABELS = { urgent: 'URGENT', important: 'IMPORTANT', info: 'INFO' }

export default function DigestPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<DigestEntry[]>([])
  const [summary, setSummary] = useState(getReturnVisitSummary())
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const refresh = () => {
    runChangeDetection()
    setEntries(generateDigest())
    setSummary(getReturnVisitSummary())
    setLastRefresh(new Date())
  }

  useEffect(() => { refresh() }, [])

  const watchlistCount = getWatchlists().filter(w => w.status === 'active').length

  return (
    <AppLayout>
      <div style={{ padding: '28px 32px 60px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }} className="slide-up">
          <div>
            <h1 className="heading-page" style={{ marginBottom: '4px' }}>Intelligence Digest</h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-muted)' }}>
              {summary.message}
            </p>
          </div>
          <button onClick={refresh} className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Daily Intelligence Ritual */}
        {(() => {
          if (typeof window === 'undefined') return null
          const daily = getDailyBrief()
          if (!daily) return null
          return (
            <div className="slide-up stagger-1" style={{ marginBottom: '20px' }}>
              <div className="section-frame">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '13px', color: 'var(--green-mid)' }}>wb_sunny</span>
                  <h3 className="heading-section" style={{ margin: 0, color: 'var(--green-mid)' }}>Today's Brief</h3>
                </div>
              </div>
              <Link
                href={`/research?q=${encodeURIComponent(daily.query)}`}
                className="card-signal"
                style={{ display: 'block', padding: '18px 20px', textDecoration: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <span className="badge-live" style={{ fontSize: '9px', padding: '2px 10px 2px 18px' }}>Global Brief</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: 'var(--text-faint)' }}>{daily.date}</span>
                </div>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: daily.color, flexShrink: 0, marginTop: '2px' }}>{daily.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p className="heading-card" style={{ fontSize: '18px', color: '#1A2F23', lineHeight: '1.35', marginBottom: '6px' }}>{daily.headline}</p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.55' }}>{daily.detail}</p>
                    {daily.watchlistImpact && (
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'var(--warning)', marginTop: '6px', fontWeight: '500' }}>{daily.watchlistImpact}</p>
                    )}
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '4px' }} />
                </div>
              </Link>
            </div>
          )
        })()}

        {/* Status Banner */}
        {(summary.urgentCount > 0 || summary.importantCount > 0) && (
          <div className="card-premium fade-up stagger-1" style={{ padding: '16px 20px', marginBottom: '20px', borderLeft: `3px solid ${summary.urgentCount > 0 ? '#C0392B' : '#B8860B'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: summary.urgentCount > 0 ? '#C0392B' : '#B8860B' }}>
                {summary.urgentCount > 0 ? 'error' : 'info'}
              </span>
              <div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
                  {summary.urgentCount > 0 ? `${summary.urgentCount} Urgent Alert${summary.urgentCount > 1 ? 's' : ''}` : `${summary.importantCount} Important Update${summary.importantCount > 1 ? 's' : ''}`}
                </p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'var(--text-muted)' }}>
                  Across {watchlistCount} active watchlist{watchlistCount !== 1 ? 's' : ''} · Last checked {lastRefresh.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Digest Entries */}
        {entries.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} className="fade-up stagger-2">
            <div className="section-frame">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>notifications_active</span>
                <h3 className="heading-section" style={{ margin: 0 }}>Watchlist Signals</h3>
              </div>
            </div>
            {entries.map(entry => {
              const typeInfo = WATCHLIST_TYPES.find(t => t.id === entry.category)
              return (
                <div key={entry.id} className="card-premium" style={{ padding: '16px 18px', cursor: 'pointer', transition: 'border-color 0.15s' }}
                  onClick={() => router.push(`/research?q=${encodeURIComponent(entry.actionQuery)}`)}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#1A2F23'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = ''}
                >
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: SEV_COLORS[entry.severity] }}>{typeInfo?.icon ?? 'info'}</span>
                      <span className="label-system" style={{ color: SEV_COLORS[entry.severity] }}>{SEV_LABELS[entry.severity]}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p className="heading-card" style={{ fontSize: '16px', marginBottom: '4px', lineHeight: '1.4' }}>{entry.title}</p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.55' }}>{entry.summary}</p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                        {typeInfo?.label} · {new Date(entry.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: '600', color: 'var(--green-mid)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {entry.actionLabel} <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="card-premium fade-up stagger-2" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--green-mid)', marginBottom: '12px', display: 'block' }}>inbox</span>
            <p className="heading-card" style={{ fontSize: '20px', marginBottom: '8px' }}>Intelligence digest is clear</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto 16px', lineHeight: '1.6' }}>
              {watchlistCount > 0
                ? 'No new signals across your watchlists. Environmental monitoring is active.'
                : 'Add items to your watchlists to receive environmental intelligence signals.'}
            </p>
            {watchlistCount === 0 && (
              <Link href="/watchlists" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>visibility</span>
                Set Up Watchlists
              </Link>
            )}
          </div>
        )}

        {/* Stale reports */}
        {summary.staleReports > 0 && (
          <div className="card-premium fade-up stagger-3" style={{ padding: '16px 18px', marginTop: '20px', borderLeft: '3px solid #B8860B' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#B8860B' }}>update</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: '500', color: 'var(--text-main)' }}>
                  {summary.staleReports} saved report{summary.staleReports > 1 ? 's' : ''} may need refreshing
                </p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'var(--text-muted)' }}>
                  Environmental conditions change rapidly — consider re-running outdated analyses.
                </p>
              </div>
              <Link href="/journal" className="btn btn-ghost" style={{ fontSize: '12px', textDecoration: 'none' }}>View Journal</Link>
            </div>
          </div>
        )}

        {/* Signal Forecasting */}
        <div className="card-premium fade-up stagger-4" style={{ padding: '20px', marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--green-mid)' }}>trending_up</span>
            <p className="label-system" style={{ color: 'var(--green-mid)' }}>Signal Forecast</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { signal: 'Coral bleaching risk elevated for Indo-Pacific — monitoring recommended', confidence: 72, icon: 'scuba_diving', color: '#C0392B' },
              { signal: 'Southeast Asian fire season approaching — peatland alerts likely within 4 weeks', confidence: 68, icon: 'local_fire_department', color: '#B45309' },
              { signal: 'IUCN Red List update expected — potential reclassifications for 300+ species', confidence: 55, icon: 'pets', color: '#7C3AED' },
            ].map((f, i) => (
              <Link key={i} href={`/research?q=${encodeURIComponent(f.signal)}`} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '6px', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: f.color }}>{f.icon}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12.5px', color: 'var(--text-secondary)', flex: 1, lineHeight: '1.4' }}>{f.signal}</span>
                  <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '16px', color: f.color, flexShrink: 0 }}>{f.confidence}%</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Planet Pulse */}
        <div className="fade-up stagger-5" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--green-mid)' }}>satellite_alt</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'var(--text-secondary)' }}>CO₂: 427.3 ppm · Ocean SST: +1.42°C · Arctic Ice: 12.1M km²</span>
          </div>
          <Link href="/pulse" style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'var(--green-mid)', textDecoration: 'none', fontWeight: '500' }}>Full Pulse →</Link>
        </div>
      </div>
    </AppLayout>
  )
}
