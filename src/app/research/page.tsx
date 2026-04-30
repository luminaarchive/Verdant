'use client'

import React, { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sidebar } from '@/components/verdant/Sidebar'
import { TopBar } from '@/components/verdant/TopBar'
import { SearchBox } from '@/components/verdant/SearchBox'

interface ResearchResult {
  title?: string
  executiveSummary?: string
  findings?: string[]
  sources?: { title: string; url?: string; year?: string; author?: string }[]
  outline?: { heading: string; body: string }[]
  stats?: { label: string; value: string }[]
  discussionStarters?: string[]
  raw?: string
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
    const id = setInterval(() => setStep((s) => (s + 1) % LOADING_STEPS.length), 2500)
    return () => clearInterval(id)
  }, [])
  const current = LOADING_STEPS[step]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '24px', padding: '64px 24px' }}>
      <style>{`
        @keyframes vPulse { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.08);opacity:1} }
        @keyframes vFade  { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <div style={{ position: 'relative', width: '72px', height: '72px' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(26,46,26,0.12)', animation: 'vPulse 2s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', inset: '8px', borderRadius: '50%', border: '1.5px solid rgba(26,46,26,0.2)', animation: 'vPulse 2s ease-in-out infinite 0.3s' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span key={step} className="material-symbols-outlined" style={{ fontSize: '28px', color: '#3D6B3D', animation: 'vFade 0.4s ease' }}>{current.icon}</span>
        </div>
      </div>
      <p key={step} style={{ fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#747871', animation: 'vFade 0.4s ease' }}>{current.label}</p>
      <div style={{ display: 'flex', gap: '6px' }}>
        {LOADING_STEPS.map((_, i) => (
          <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === step ? '#1A2E1A' : 'rgba(26,46,26,0.15)', transition: 'background 0.3s' }} />
        ))}
      </div>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '16px', padding: '64px 24px' }}>
      <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#747871' }}>error_outline</span>
      <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '15px', color: '#434841', textAlign: 'center' }}>
        Couldn&apos;t reach the research pipeline. Please try again.
      </p>
      <button onClick={onRetry} style={{ background: '#1A2E1A', color: '#F5F2EB', border: 'none', borderRadius: '2px', padding: '8px 20px', fontSize: '13px', fontFamily: 'system-ui, sans-serif', fontWeight: '500', cursor: 'pointer' }}>
        Retry
      </button>
    </div>
  )
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#F5F2EB', border: '1px solid rgba(26,46,26,0.12)', borderRadius: '4px', padding: '24px', ...style }}>
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: '10px', fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#747871', fontWeight: '600', marginBottom: '12px' }}>
      {children}
    </p>
  )
}

function RawResult({ text }: { text: string }) {
  return (
    <Card>
      <SectionLabel>Research Output</SectionLabel>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: '16px', lineHeight: '1.8', color: '#1b1c1a', maxWidth: '680px', whiteSpace: 'pre-wrap' }}>
        {text}
      </div>
    </Card>
  )
}

function StructuredResult({ result }: { result: ResearchResult }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Row 1: Synthesis 2/3 + Stats 1/3 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        <Card>
          <SectionLabel>The Synthesis</SectionLabel>
          {result.executiveSummary && (
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', lineHeight: '1.8', color: '#1b1c1a', marginBottom: result.findings?.length ? '20px' : 0 }}>
              {result.executiveSummary}
            </p>
          )}
          {result.findings && result.findings.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {result.findings.map((f, i) => (
                <li key={i} style={{ fontFamily: 'system-ui, sans-serif', fontSize: '14px', lineHeight: '1.6', color: '#434841' }}>{f}</li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <SectionLabel>Data Snapshot</SectionLabel>
          {result.stats && result.stats.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {result.stats.map((stat, i) => (
                <div key={i}>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '400', color: '#1A2E1A', lineHeight: '1', marginBottom: '4px' }}>{stat.value}</p>
                  <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '12px', color: '#747871', lineHeight: '1.4' }}>{stat.label}</p>
                  {i < result.stats!.length - 1 && <div style={{ height: '1px', background: 'rgba(26,46,26,0.08)', marginTop: '14px' }} />}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#747871' }}>No statistical data returned.</p>
          )}
        </Card>
      </div>

      {/* Row 2: Outline */}
      {result.outline && result.outline.length > 0 && (
        <Card>
          <SectionLabel>The Outline</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {result.outline.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flexShrink: 0, width: '24px', height: '24px', borderRadius: '50%', background: '#1A2E1A', color: '#F5F2EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontFamily: 'system-ui, sans-serif', fontWeight: '600', marginTop: '2px' }}>{i + 1}</div>
                <div>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '15px', color: '#1A2E1A', marginBottom: '4px' }}>{item.heading}</p>
                  <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#434841', lineHeight: '1.6' }}>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Row 3: Sources + Discussion */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Card>
          <SectionLabel>Sources &amp; Citations</SectionLabel>
          {result.sources && result.sources.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {result.sources.map((src, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, width: '20px', height: '20px', borderRadius: '2px', background: 'rgba(26,46,26,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontFamily: 'system-ui, sans-serif', color: '#747871', fontWeight: '600', marginTop: '1px' }}>{i + 1}</span>
                  <div>
                    {src.url
                      ? <a href={src.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#3D6B3D', textDecoration: 'none', lineHeight: '1.5', display: 'block' }}>{src.title}</a>
                      : <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#1b1c1a', lineHeight: '1.5' }}>{src.title}</p>
                    }
                    {(src.author || src.year) && (
                      <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '11px', color: '#747871', marginTop: '2px' }}>
                        {[src.author, src.year].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#747871' }}>No sources returned.</p>
          )}
        </Card>
        <Card>
          <SectionLabel>Discussion Starters</SectionLabel>
          {result.discussionStarters && result.discussionStarters.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {result.discussionStarters.map((q, i) => (
                <div key={i} style={{ background: '#FAFAF7', border: '1px solid rgba(26,46,26,0.08)', borderRadius: '4px', padding: '10px 14px', cursor: 'pointer', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#1A2E1A'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,46,26,0.08)'}
                >
                  <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#434841', lineHeight: '1.5' }}>{q}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#747871' }}>No discussion prompts returned.</p>
          )}
        </Card>
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
      // Always parse the response — the proxy normalises errors to JSON
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

  return (
    <main style={{ flex: 1, overflowY: 'auto', padding: '32px 32px 48px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}><SearchBox /></div>

        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'system-ui, sans-serif', fontSize: '12px', color: '#747871', marginBottom: '16px' }}>
          <Link href="/" style={{ color: '#747871', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#1A2E1A'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#747871'}
          >Home</Link>
          <span>›</span>
          <span>Research</span>
          <span>›</span>
          <span style={{ color: '#1b1c1a', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{queryString}</span>
        </nav>

        {/* Query title */}
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '400', color: '#1A2E1A', lineHeight: '1.25', letterSpacing: '-0.5px', marginBottom: '32px', maxWidth: '760px' }}>
          {queryString}
        </h1>

        {status === 'loading' && <LoadingState />}
        {status === 'error'   && <ErrorState onRetry={runFetch} />}
        {status === 'success' && result && (result.raw ? <RawResult text={result.raw} /> : <StructuredResult result={result} />)}

        {status !== 'loading' && (
          <div style={{ marginTop: '40px' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#747871', textDecoration: 'none', border: '1px solid rgba(26,46,26,0.15)', borderRadius: '2px', padding: '6px 14px', background: '#F5F2EB', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#1A2E1A'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,46,26,0.15)'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}

export default function ResearchPage() {
  return (
    <div style={{ background: '#FAFAF7', display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <TopBar />
        <Suspense fallback={
          <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#747871' }}>Loading...</p>
          </main>
        }>
          <ResearchContent />
        </Suspense>
      </div>
    </div>
  )
}
