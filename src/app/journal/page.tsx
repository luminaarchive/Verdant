'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/verdant/AppLayout'
import { useToast } from '@/components/verdant/Toast'
import { Trash2, ExternalLink, BookOpen } from 'lucide-react'

interface JournalEntry {
  id: number
  query: string
  title: string
  summary?: string
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
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '34px', fontWeight: '400', color: '#1A2F23', marginBottom: '6px' }}>Journal</h1>
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
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <BookOpen size={28} style={{ color: 'var(--text-muted)' }} />
              </div>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#1A2F23', marginBottom: '10px' }}>Your journal is empty</p>
              <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '380px', margin: '0 auto 24px' }}>
                Save research results to your journal from the research page. Use the &quot;Save&quot; button after completing an analysis.
              </p>
              <Link href="/" className="btn btn-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
                Start Researching
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {entries.map(entry => (
                <div key={entry.id} className="card" style={{ padding: '20px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                    <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#1A2F23', lineHeight: '1.4' }}>{entry.title}</h3>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
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
                    <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {entry.summary}
                    </p>
                  )}
                  <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '11px', color: 'var(--text-muted)' }}>
                    Saved {formatDate(entry.savedAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
