'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/verdant/AppLayout'
import { ArrowRight, Plus, Trash2, Eye, AlertTriangle, Bell } from 'lucide-react'
import { getWatchlists, addWatchlistItem, removeWatchlistItem, updateWatchlistItem, dismissSignal, WATCHLIST_TYPES, type WatchlistItem, type WatchlistType } from '@/lib/retention/watchlists'
import { runChangeDetection } from '@/lib/retention/signals'

const SEV_COLORS = { urgent: '#C0392B', important: '#B8860B', info: 'var(--green-mid)' }
const PRIORITY_COLORS = { critical: '#C0392B', high: '#B8860B', medium: 'var(--text-muted)', low: 'var(--text-muted)' }

export default function WatchlistsPage() {
  const router = useRouter()
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newType, setNewType] = useState<WatchlistType>('species')
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')

  const refresh = useCallback(() => setItems(getWatchlists()), [])

  useEffect(() => {
    refresh()
    // Run change detection on page load
    const result = runChangeDetection()
    if (result.newSignals > 0) refresh()
  }, [refresh])

  const handleAdd = () => {
    if (!newTitle.trim()) return
    const query = `${WATCHLIST_TYPES.find(t => t.id === newType)?.label ?? ''} intelligence: ${newTitle.trim()}`
    addWatchlistItem({ type: newType, title: newTitle.trim(), description: newDesc.trim(), query, priority: newPriority })
    setNewTitle(''); setNewDesc(''); setShowAdd(false)
    refresh()
  }

  const handleRemove = (id: string) => { removeWatchlistItem(id); refresh() }
  const handleDismiss = (wlId: string, sigId: string) => { dismissSignal(wlId, sigId); refresh() }
  const handlePause = (id: string, current: string) => { updateWatchlistItem(id, { status: current === 'active' ? 'paused' : 'active' }); refresh() }

  const activeSignals = items.reduce((c, i) => c + i.signals.filter(s => !s.dismissed).length, 0)

  return (
    <AppLayout>
      <div style={{ padding: '28px 32px 60px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '400', color: '#1A2F23', letterSpacing: '-0.5px', marginBottom: '4px' }}>Environmental Watchlists</h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-muted)' }}>
              {items.length} tracked · {activeSignals} active signal{activeSignals !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} /> Add Watch Item
          </button>
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="card fade-up" style={{ padding: '20px', marginBottom: '20px' }}>
            <p className="section-label">New Watch Item</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {WATCHLIST_TYPES.map(t => (
                  <button key={t.id} onClick={() => setNewType(t.id)} style={{
                    padding: '5px 12px', borderRadius: '16px', cursor: 'pointer', fontSize: '11px', fontFamily: "'Inter', sans-serif", fontWeight: '500',
                    border: newType === t.id ? '1px solid #1A2F23' : '1px solid var(--border)', background: newType === t.id ? '#1A2F23' : 'transparent', color: newType === t.id ? '#fff' : 'var(--text-muted)', transition: 'all 0.15s',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '12px', verticalAlign: 'middle', marginRight: '4px' }}>{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="What are you monitoring? e.g. Sumatran Tiger" style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-elevated)', color: 'var(--text-main)', outline: 'none' }} />
              <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Brief context (optional)" style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', padding: '8px 14px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', outline: 'none' }} />
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Priority:</span>
                {(['low', 'medium', 'high', 'critical'] as const).map(p => (
                  <button key={p} onClick={() => setNewPriority(p)} style={{
                    padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontFamily: "'Inter', sans-serif", fontWeight: '500', cursor: 'pointer',
                    border: newPriority === p ? `1px solid ${PRIORITY_COLORS[p]}` : '1px solid var(--border)', background: newPriority === p ? `${PRIORITY_COLORS[p]}15` : 'transparent', color: newPriority === p ? PRIORITY_COLORS[p] : 'var(--text-muted)', transition: 'all 0.15s',
                  }}>{p}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleAdd} className="btn btn-primary" style={{ fontSize: '13px' }}>Add to Watchlist</button>
                <button onClick={() => setShowAdd(false)} className="btn btn-ghost" style={{ fontSize: '13px' }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Watchlist items */}
        {items.length === 0 ? (
          <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--green-mid)', marginBottom: '12px', display: 'block' }}>visibility</span>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: 'var(--text-main)', marginBottom: '8px' }}>No items being watched</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto', lineHeight: '1.6' }}>
              Add species, ecosystems, policies, or research topics to monitor. Verdant will track environmental changes and alert you to meaningful shifts.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map(item => {
              const undismissed = item.signals.filter(s => !s.dismissed)
              const typeInfo = WATCHLIST_TYPES.find(t => t.id === item.type)
              return (
                <div key={item.id} className="card" style={{ padding: '18px', opacity: item.status === 'paused' ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: undismissed.length > 0 ? '12px' : '0' }}>
                    <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--green-mid)', flexShrink: 0, marginTop: '2px' }}>{typeInfo?.icon ?? 'visibility'}</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{item.title}</span>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 6px', borderRadius: '4px', background: `${PRIORITY_COLORS[item.priority]}15`, color: PRIORITY_COLORS[item.priority] }}>{item.priority}</span>
                          {item.status === 'paused' && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: 'var(--text-muted)' }}>PAUSED</span>}
                        </div>
                        {item.description && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{item.description}</p>}
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {typeInfo?.label} · Added {new Date(item.addedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          {undismissed.length > 0 && <span style={{ color: SEV_COLORS[undismissed[0].severity], fontWeight: '600' }}> · {undismissed.length} signal{undismissed.length > 1 ? 's' : ''}</span>}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => router.push(`/research?q=${encodeURIComponent(item.query)}`)} className="btn btn-ghost" title="Research" style={{ padding: '4px 8px' }}><Eye size={14} /></button>
                      <button onClick={() => handlePause(item.id, item.status)} className="btn btn-ghost" title={item.status === 'active' ? 'Pause' : 'Resume'} style={{ padding: '4px 8px' }}><Bell size={14} /></button>
                      <button onClick={() => handleRemove(item.id)} className="btn btn-ghost" title="Remove" style={{ padding: '4px 8px', color: '#C0392B' }}><Trash2 size={14} /></button>
                    </div>
                  </div>

                  {/* Signals */}
                  {undismissed.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {undismissed.slice(0, 3).map(sig => (
                        <div key={sig.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '8px 10px', background: `${SEV_COLORS[sig.severity]}08`, borderRadius: '6px', borderLeft: `3px solid ${SEV_COLORS[sig.severity]}` }}>
                          <AlertTriangle size={13} style={{ color: SEV_COLORS[sig.severity], flexShrink: 0, marginTop: '2px' }} />
                          <div style={{ flex: 1 }}>
                            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12.5px', fontWeight: '500', color: 'var(--text-main)', marginBottom: '2px' }}>{sig.title}</p>
                            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{sig.description}</p>
                            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>{sig.source} · {new Date(sig.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          <button onClick={() => handleDismiss(item.id, sig.id)} className="btn btn-ghost" style={{ padding: '2px 6px', fontSize: '11px' }}>Dismiss</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
