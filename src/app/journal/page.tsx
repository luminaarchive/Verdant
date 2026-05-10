'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'
import { useToast } from '@/components/ui/Toast'
import { Trash2, ExternalLink, BookOpen } from 'lucide-react'

interface JournalEntry {
  id: number
  query: string
  title: string
  summary?: string
  confidenceScore?: number
  hasActionable?: boolean
  savedAt: string
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('verdant-journal') ?? '[]')
    setEntries(saved)
  }, [])

  const deleteEntry = (id: number) => {
    const updated = entries.filter(e => e.id !== id)
    setEntries(updated)
    localStorage.setItem('verdant-journal', JSON.stringify(updated))
    toast('Entry removed', { type: 'info', icon: 'delete' })
  }

  const clearAll = () => {
    setEntries([])
    localStorage.removeItem('verdant-journal')
    toast('Journal cleared', { type: 'info' })
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
      return iso
    }
  }

  return (
    <AppLayout>
      <div style={{ padding: '36px 32px 60px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }} className="slide-up">
            <div>
              <h1 className="heading-page" style={{ marginBottom: '6px' }}>Journal</h1>
              <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '14px', color: 'var(--text-muted)' }}>
                Your saved research analyses and findings.
              </p>
            </div>
            {entries.length > 0 && (
              <button
                onClick={clearAll}
                className="btn btn-ghost"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px', color: 'var(--destructive)', borderColor: 'rgba(192,57,43,0.2)' }}
              >
                <Trash2 size={13} />
                Clear All
              </button>
            )}
          </div>

          {entries.length === 0 ? (
            <div className="card-premium slide-up stagger-1" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(26,47,35,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <BookOpen size={28} style={{ color: 'var(--green-mid)' }} />
              </div>
              <p className="heading-card" style={{ fontSize: '22px', marginBottom: '10px' }}>Your Institutional Journal is empty</p>
              <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '420px', margin: '0 auto 24px' }}>
                Save completed research reports here to build your academic repository, export to PDF, and increase your institutional reputation score over time.
              </p>
              <Link href="/" className="btn btn-primary" style={{ display: 'inline-flex', textDecoration: 'none', padding: '10px 24px', borderRadius: '24px' }}>
                Start your first investigation
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="slide-up stagger-1">
              
              {/* Journal Metrics Header (Phase 6.5) */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <div style={{ flex: 1, minWidth: '220px', background: 'var(--bg-elevated)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--green-mid)' }}>workspace_premium</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Journal Quality</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontFamily: 'Georgia, serif', fontSize: '32px', color: '#1A2F23', lineHeight: '1' }}>
                      {Math.round(entries.reduce((acc, e) => acc + (e.confidenceScore || 85), 0) / entries.length)}
                    </span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'var(--text-muted)' }}>/100</span>
                  </div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Average integrity score across {entries.length} reports</p>
                </div>

                <div style={{ flex: 1, minWidth: '220px', background: 'var(--bg-elevated)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#B8860B' }}>fact_check</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actionability</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#B8860B', lineHeight: '1' }}>
                      {entries.filter(e => !e.hasActionable).length}
                    </span>
                  </div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>reports missing actionable recommendations</p>
                </div>

                <div style={{ flex: 1, minWidth: '220px', background: 'var(--bg-elevated)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--green-dark)' }}>trending_up</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submission Targets</span>
                  </div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    Need <strong style={{ color: 'var(--green-dark)' }}>{Math.max(0, 10 - entries.length)}</strong> more Deep Researches to reach Analyst Tier.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {entries.map(entry => (
                <div key={entry.id} className="card-premium" style={{ padding: '20px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                    <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '22px', fontWeight: '400', color: '#1A2F23', lineHeight: '1.4' }}>{entry.title}</h3>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        onClick={() => {
                          toast('Exporting PDF...', { type: 'info' })
                          setTimeout(() => {
                            window.print()
                            toast('PDF Exported', { type: 'success' })
                            // Track export in local storage for reputation
                            const currentExports = parseInt(localStorage.getItem('verdant-exports-count') ?? '0', 10)
                            localStorage.setItem('verdant-exports-count', (currentExports + 1).toString())
                          }, 1000)
                        }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.15s' }}
                        title="Export PDF"
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-main)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>download</span>
                      </button>
                      <Link
                        href={`/research?q=${encodeURIComponent(entry.query)}`}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)', textDecoration: 'none', transition: 'all 0.15s' }}
                        title="Open research"
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1A2F23'; (e.currentTarget as HTMLElement).style.color = '#FFFFFF' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
                      >
                        <ExternalLink size={12} />
                      </Link>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '6px', background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.15s' }}
                        title="Remove entry"
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(192,57,43,0.08)'; (e.currentTarget as HTMLElement).style.color = 'var(--destructive)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  {entry.summary && (
                    <div id={`exportable-journal-${entry.id}`}>
                      <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {entry.summary}
                      </p>
                    </div>
                  )}
                  <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '11px', color: 'var(--text-muted)' }}>
                    Saved {formatDate(entry.savedAt)}
                  </p>
                </div>
              ))}
            </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
