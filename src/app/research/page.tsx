'use client'

import React, { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/components/verdant/AppLayout'
import { SearchBox } from '@/components/verdant/SearchBox'
import { useToast } from '@/components/verdant/Toast'
import { ArrowLeft, RotateCcw, Copy, BookmarkPlus, CheckCircle2 } from 'lucide-react'

interface ResearchResult {
  title?: string
  executiveSummary?: string
  findings?: string[]
  sources?: { title: string; url?: string; year?: string; author?: string }[]
  outline?: { heading: string; body: string }[]
  stats?: { label: string; value: string }[]
  discussionStarters?: string[]
  raw?: string
  error?: string
}

const LOADING_STEPS = [
  { icon: 'travel_explore', label: 'Scanning global archives...' },
  { icon: 'fact_check',     label: 'Verifying data integrity...' },
  { icon: 'menu_book',      label: 'Cross-referencing sources...' },
  { icon: 'auto_awesome',   label: 'Synthesizing findings...' },
]

function LoadingState() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % LOADING_STEPS.length), 2500)
    return () => clearInterval(id)
  }, [])
  const current = LOADING_STEPS[step]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '28px', padding: '80px 24px' }}>
      <div style={{ position: 'relative', width: '72px', height: '72px' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba(26,47,35,0.12)', animation: 'pulse 2s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', inset: '10px', borderRadius: '50%', border: '1.5px solid rgba(26,47,35,0.20)', animation: 'pulse 2s ease-in-out infinite 0.3s' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span
            key={step}
            className="material-symbols-outlined fade-in"
            style={{ fontSize: '26px', color: '#1A2F23' }}
          >
            {current.icon}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <p key={step} className="fade-in" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '14px', color: 'var(--text-muted)' }}>
          {current.label}
        </p>
        <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '11.5px', color: 'var(--text-muted)', opacity: 0.6 }}>
          Analysis may take up to 60 seconds
        </p>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {LOADING_STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              width: '5px', height: '5px', borderRadius: '50%',
              background: i === step ? '#1A2F23' : 'rgba(26,47,35,0.15)',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  )
}

function ErrorState({ onRetry, message }: { onRetry: () => void; message?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '20px', padding: '80px 24px' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(192,57,43,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#C0392B' }}>error_outline</span>
      </div>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: 'var(--text-main)', marginBottom: '8px' }}>
          Research pipeline unreachable
        </p>
        <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          {message ?? "Couldn't connect to the analysis service. Please check your connection and try again."}
        </p>
      </div>
      <button
        onClick={onRetry}
        className="btn btn-primary"
        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <RotateCcw size={14} />
        Retry Analysis
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '16px', padding: '80px 24px', textAlign: 'center' }}>
      <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--text-muted)' }}>hourglass_empty</span>
      <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: 'var(--text-main)' }}>No results returned</p>
      <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13.5px', color: 'var(--text-muted)', maxWidth: '360px', lineHeight: '1.6' }}>
        The research pipeline returned an empty response. Try rephrasing your query or selecting a different research mode.
      </p>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="section-label">{children}</p>
  )
}

function ResultCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="card" style={{ padding: '24px', ...style }}>
      {children}
    </div>
  )
}

function StructuredResult({ result, query }: { result: ResearchResult; query: string }) {
  const { toast } = useToast()
  const router = useRouter()

  const saveToJournal = () => {
    const entries = JSON.parse(localStorage.getItem('verdant-journal') ?? '[]')
    const entry = {
      id: Date.now(),
      query,
      title: result.title ?? query,
      summary: result.executiveSummary ?? result.raw,
      savedAt: new Date().toISOString(),
    }
    entries.unshift(entry)
    localStorage.setItem('verdant-journal', JSON.stringify(entries.slice(0, 50)))
    toast('Saved to Journal', { icon: 'bookmark_added' })
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast('Link copied to clipboard', { icon: 'link' })
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} className="fade-up">
      {/* Action bar */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginBottom: '4px' }}>
        <button
          onClick={copyLink}
          className="btn btn-subtle"
          style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', height: '32px', padding: '0 12px' }}
        >
          <Copy size={13} /> Copy Link
        </button>
        <button
          onClick={saveToJournal}
          className="btn btn-subtle"
          style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', height: '32px', padding: '0 12px' }}
        >
          <BookmarkPlus size={13} /> Save
        </button>
      </div>

      {/* Row 1: Synthesis + Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '14px' }}>
        <ResultCard>
          <SectionLabel>The Synthesis</SectionLabel>
          {result.executiveSummary && (
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', lineHeight: '1.8', color: 'var(--text-main)', marginBottom: result.findings?.length ? '20px' : 0 }}>
              {result.executiveSummary}
            </p>
          )}
          {result.findings && result.findings.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {result.findings.map((f, i) => (
                <li key={i} style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13.5px', lineHeight: '1.65', color: 'var(--text-secondary)' }}>
                  {f}
                </li>
              ))}
            </ul>
          )}
          {!result.executiveSummary && !result.findings?.length && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13.5px', color: 'var(--text-muted)' }}>
              No summary data was returned for this query.
            </p>
          )}
        </ResultCard>

        <ResultCard>
          <SectionLabel>Data Snapshot</SectionLabel>
          {result.stats && result.stats.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {result.stats.map((stat, i) => (
                <div key={i}>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: '400', color: '#1A2F23', lineHeight: '1', marginBottom: '4px' }}>{stat.value}</p>
                  <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{stat.label}</p>
                  {i < result.stats!.length - 1 && <div style={{ height: '1px', background: 'var(--border)', marginTop: '14px' }} />}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', color: 'var(--text-muted)' }}>
              No statistical data returned for this query.
            </p>
          )}
        </ResultCard>
      </div>

      {/* Outline */}
      {result.outline && result.outline.length > 0 && (
        <ResultCard>
          <SectionLabel>Research Outline</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {result.outline.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '14px' }}>
                <div style={{ flexShrink: 0, width: '24px', height: '24px', borderRadius: '50%', background: '#1A2F23', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontFamily: "'Inter', sans-serif", fontWeight: '700', marginTop: '2px' }}>{i + 1}</div>
                <div>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '14.5px', color: '#1A2F23', marginBottom: '4px' }}>{item.heading}</p>
                  <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </ResultCard>
      )}

      {/* Sources + Discussion */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        <ResultCard>
          <SectionLabel>Sources &amp; Citations</SectionLabel>
          {result.sources && result.sources.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {result.sources.map((src, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, width: '20px', height: '20px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontFamily: "'Inter', sans-serif", color: 'var(--text-muted)', fontWeight: '600', marginTop: '1px' }}>{i + 1}</span>
                  <div>
                    {src.url
                      ? <a href={src.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', color: 'var(--green-mid)', textDecoration: 'none', lineHeight: '1.5', display: 'block' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.textDecoration = 'underline'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.textDecoration = 'none'}>{src.title}</a>
                      : <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.5' }}>{src.title}</p>
                    }
                    {(src.author || src.year) && (
                      <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {[src.author, src.year].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', color: 'var(--text-muted)' }}>No sources returned.</p>
          )}
        </ResultCard>

        <ResultCard>
          <SectionLabel>Continue Exploring</SectionLabel>
          {result.discussionStarters && result.discussionStarters.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {result.discussionStarters.map((q, i) => (
                <button
                  key={i}
                  onClick={() => router.push(`/research?q=${encodeURIComponent(q)}`)}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                  onMouseEnter={e => {
                    ;(e.currentTarget as HTMLElement).style.background = '#1A2F23'
                    ;(e.currentTarget as HTMLElement).style.borderColor = '#1A2F23'
                    ;(e.currentTarget as HTMLElement).style.color = '#FFFFFF'
                  }}
                  onMouseLeave={e => {
                    ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                    ;(e.currentTarget as HTMLElement).style.color = ''
                  }}
                >
                  <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', lineHeight: '1.5', margin: 0 }}>{q}</p>
                  <ArrowLeft size={13} style={{ flexShrink: 0, transform: 'rotate(180deg)' }} />
                </button>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', color: 'var(--text-muted)' }}>No discussion prompts returned.</p>
          )}
        </ResultCard>
      </div>

      {/* Success badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '4px' }}>
        <CheckCircle2 size={13} style={{ color: 'var(--green-mid)' }} />
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11.5px', color: 'var(--text-muted)' }}>
          Analysis complete
        </p>
      </div>
    </div>
  )
}

function RawResult({ text, query }: { text: string; query: string }) {
  const { toast } = useToast()
  const saveToJournal = () => {
    const entries = JSON.parse(localStorage.getItem('verdant-journal') ?? '[]')
    entries.unshift({ id: Date.now(), query, title: query, summary: text, savedAt: new Date().toISOString() })
    localStorage.setItem('verdant-journal', JSON.stringify(entries.slice(0, 50)))
    toast('Saved to Journal', { icon: 'bookmark_added' })
  }

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
        <button onClick={saveToJournal} className="btn btn-subtle" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', height: '32px', padding: '0 12px' }}>
          <BookmarkPlus size={13} /> Save
        </button>
      </div>
      <div className="card" style={{ padding: '28px' }}>
        <SectionLabel>Research Output</SectionLabel>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '16px', lineHeight: '1.85', color: 'var(--text-main)', maxWidth: '680px', whiteSpace: 'pre-wrap' }}>
          {text}
        </div>
      </div>
    </div>
  )
}

function ResearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryString = searchParams.get('q') ?? ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [result, setResult] = useState<ResearchResult | null>(null)

  const runFetch = useCallback(async () => {
    if (!queryString) { router.replace('/'); return }
    setStatus('loading')
    setResult(null)
    try {
      const searchMode = typeof window !== 'undefined'
        ? (localStorage.getItem('verdant-search-mode') || 'focus')
        : 'focus'
      const response = await fetch('/api/n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryString, mode: searchMode, timestamp: new Date().toISOString() }),
      })
      let data: unknown
      try { data = await response.json() } catch { data = { raw: await response.text() } }
      let parsed: ResearchResult
      try { parsed = typeof data === 'string' ? { raw: data } : (data as ResearchResult) } catch { parsed = { raw: String(data) } }
      setResult(parsed)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }, [queryString, router])

  useEffect(() => { runFetch() }, [runFetch])

  const hasContent = result && (
    result.raw || result.executiveSummary || result.findings?.length ||
    result.outline?.length || result.sources?.length
  )

  return (
    <div style={{ padding: '28px 32px 60px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Search box */}
        <div style={{ marginBottom: '24px' }}>
          <SearchBox compact />
        </div>

        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Inter', system-ui, sans-serif", fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#1A2F23'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
          >
            Home
          </Link>
          <span>›</span>
          <span>Research</span>
          <span>›</span>
          <span style={{ color: 'var(--text-main)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{queryString}</span>
        </nav>

        {/* Query title */}
        <h1
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '30px',
            fontWeight: '400',
            color: '#1A2F23',
            lineHeight: '1.3',
            letterSpacing: '-0.5px',
            marginBottom: '28px',
            maxWidth: '760px',
          }}
        >
          {queryString}
        </h1>

        {status === 'loading' && <LoadingState />}
        {status === 'error'   && <ErrorState onRetry={runFetch} />}
        {status === 'success' && !hasContent && <EmptyState />}
        {status === 'success' && result && hasContent && (
          result.raw
            ? <RawResult text={result.raw} query={queryString} />
            : <StructuredResult result={result} query={queryString} />
        )}

        {status !== 'loading' && (
          <div style={{ marginTop: '36px' }}>
            <Link
              href="/"
              className="btn btn-ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
            >
              <ArrowLeft size={14} />
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ResearchPage() {
  return (
    <AppLayout>
      <Suspense
        fallback={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-muted)' }}>Loading...</p>
          </div>
        }
      >
        <ResearchContent />
      </Suspense>
    </AppLayout>
  )
}
