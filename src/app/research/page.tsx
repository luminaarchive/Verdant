'use client'

import React, { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/components/verdant/AppLayout'
import { SearchBox } from '@/components/verdant/SearchBox'
import { useToast } from '@/components/verdant/Toast'
import { ArrowLeft, RotateCcw, Copy, BookmarkPlus, CheckCircle2, Download, ThumbsUp, ThumbsDown, Share2, ChevronDown, ChevronUp, Shield, AlertTriangle, ArrowRight, Eye } from 'lucide-react'
import { TEMPLATES } from '@/lib/research/templates'
import { addWatchlistItem } from '@/lib/retention/watchlists'
import { recordActivity } from '@/lib/streak/client'
import { recordQuery, getRelatedPriorWork } from '@/lib/intelligence/memory'
import { computeReportScores, computeProofOfWork } from '@/lib/intelligence/scores'
import { getReportFreshness, recordReportView, getReportDeltas } from '@/lib/intelligence/living-reports'
import { getSourceReliability } from '@/lib/intelligence/source-reliability'

interface ExecSummary {
  whatMattersMost?: string
  hiddenRisks?: string
  strategicImplications?: string
  recommendedNextAction?: string
  whyThisMattersNow?: string
}

interface ResearchResult {
  ok?: boolean
  runId?: string
  title?: string
  executiveSummary?: ExecSummary | string
  findings?: string[]
  decisionRecommendations?: { recommendation: string; rationale: string; evidenceRefs?: number[]; riskLevel?: string; urgency?: string }[]
  sources?: { title: string; url?: string; year?: string; author?: string }[]
  outline?: { heading: string; body: string }[]
  stats?: { label: string; value: string }[]
  evidenceItems?: { claim: string; evidence: string; sourceIndex: number; strength?: string; confidence?: number }[]
  contradictions?: { conflict: string; sourceA: string; sourceB: string; implication: string }[]
  confidenceScore?: number
  uncertaintyNotes?: ({ uncertainty: string; reason: string; whatWouldResolveIt: string } | string)[]
  strategicFollowUps?: string[]
  costBreakdown?: { model: string; inputTokens: number; outputTokens: number; costUsd: number }
  pipelineSource?: string
  durationMs?: number
  raw?: string
  error?: string
  message?: string
}

const LOADING_STEPS = [
  { icon: 'travel_explore', label: 'Scanning global archives...' },
  { icon: 'fact_check',     label: 'Verifying data integrity...' },
  { icon: 'menu_book',      label: 'Cross-referencing sources...' },
  { icon: 'auto_awesome',   label: 'Synthesizing findings...' },
]

function LoadingState({ asyncStage, asyncProgress, etaSeconds }: { asyncStage?: string; asyncProgress?: number; etaSeconds?: number }) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % LOADING_STEPS.length), 2500)
    return () => clearInterval(id)
  }, [])
  const current = LOADING_STEPS[step]
  const isAsync = !!asyncStage

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '28px', padding: '80px 24px' }}>
      <div style={{ position: 'relative', width: '72px', height: '72px' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba(26,47,35,0.12)', animation: 'pulse 2s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', inset: '10px', borderRadius: '50%', border: '1.5px solid rgba(26,47,35,0.20)', animation: 'pulse 2s ease-in-out infinite 0.3s' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span key={step} className="material-symbols-outlined fade-in" style={{ fontSize: '26px', color: '#1A2F23' }}>{current.icon}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <p className="fade-in" style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'var(--text-muted)' }}>
          {isAsync ? asyncStage : current.label}
        </p>
        {isAsync && typeof asyncProgress === 'number' && (
          <div style={{ width: '240px', height: '4px', borderRadius: '2px', background: 'rgba(26,47,35,0.08)', overflow: 'hidden', marginTop: '4px' }}>
            <div style={{ height: '100%', width: `${asyncProgress}%`, borderRadius: '2px', background: '#1A2F23', transition: 'width 0.5s ease' }} />
          </div>
        )}
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11.5px', color: 'var(--text-muted)', opacity: 0.6 }}>
          {isAsync && etaSeconds ? `Estimated ${Math.ceil(etaSeconds / 60)} min remaining` : 'Analysis may take up to 60 seconds'}
        </p>
        {isAsync && (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: 'var(--green-mid)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600', marginTop: '4px' }}>Analytica — International-Grade Intelligence</p>
        )}
      </div>
      {!isAsync && (
        <div style={{ display: 'flex', gap: '6px' }}>
          {LOADING_STEPS.map((_, i) => (
            <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: i === step ? '#1A2F23' : 'rgba(26,47,35,0.15)', transition: 'background 0.3s' }} />
          ))}
        </div>
      )}
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
        <p className="heading-card" style={{ marginBottom: '8px' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '16px', padding: '60px 24px', textAlign: 'center' }}>
      <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--green-mid)' }}>eco</span>
      <p className="heading-card" style={{ marginBottom: '4px' }}>No results returned</p>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13.5px', color: 'var(--text-muted)', maxWidth: '400px', lineHeight: '1.6' }}>
        The intelligence pipeline returned an empty response. Try an environmental research template or rephrase your query.
      </p>
      <Link href="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', marginTop: '8px' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>science</span>
        Browse Environmental Templates
      </Link>
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

function StructuredResult({ result, query, onRetry }: { result: ResearchResult; query: string; onRetry: () => void }) {
  const { toast } = useToast()
  const router = useRouter()
  const [showEvidence, setShowEvidence] = useState(false)
  const [showUncertainty, setShowUncertainty] = useState(false)
  const [feedbackSent, setFeedbackSent] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [simplify, setSimplify] = useState(false)

  const saveToJournal = () => {
    const entries = JSON.parse(localStorage.getItem('verdant-journal') ?? '[]')
    const localSummary = typeof result.executiveSummary === 'object' ? (result.executiveSummary?.whatMattersMost ?? '') : (result.executiveSummary ?? result.raw ?? '')
    const hasActionable = result.decisionRecommendations && result.decisionRecommendations.length > 0
    const entry = { id: Date.now(), query, title: result.title ?? query, summary: localSummary, confidenceScore: result.confidenceScore || 85, hasActionable, savedAt: new Date().toISOString() }
    entries.unshift(entry)
    localStorage.setItem('verdant-journal', JSON.stringify(entries.slice(0, 50)))
    const summaryStr = typeof result.executiveSummary === 'object' ? (result.executiveSummary?.whatMattersMost ?? '') : (result.executiveSummary ?? '')
    if (result.runId) { fetch('/api/journal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, title: result.title ?? query, summary: summaryStr, runId: result.runId }) }).catch(() => {}) }
    toast('Saved to Journal', { icon: 'bookmark_added' })
  }

  const copyLink = () => { navigator.clipboard.writeText(window.location.href).then(() => toast('Link copied', { icon: 'link' })) }
  const copySummary = () => {
    const text = typeof result.executiveSummary === 'object'
      ? Object.entries(result.executiveSummary).map(([k, v]) => `${k}: ${v}`).join('\n\n')
      : (result.executiveSummary ?? '')
    navigator.clipboard.writeText(text).then(() => toast('Summary copied', { icon: 'content_copy' }))
  }

  const downloadDocx = async () => {
    if (!result.runId) { toast('Export requires a run ID', { type: 'error' }); return }
    setExporting(true)
    try {
      const res = await fetch('/api/export', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ runId: result.runId, format: 'docx' }) })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `verdant-${result.runId}.docx`; a.click()
      URL.revokeObjectURL(url)
      toast('DOCX downloaded', { icon: 'download' })
      // Track export count for profile stats
      try { const c = parseInt(localStorage.getItem('verdant-exports-count') ?? '0', 10); localStorage.setItem('verdant-exports-count', String(c + 1)) } catch { /* ignore */ }
    } catch { toast('Export failed. Try again.', { type: 'error' }) }
    setExporting(false)
  }

  const sendFeedback = async (rating: 'positive' | 'negative') => {
    if (!result.runId) return
    setFeedbackSent(rating)
    fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ runId: result.runId, rating }) }).catch(() => {})
    toast(rating === 'positive' ? 'Thanks for the feedback!' : 'We\'ll improve this', { icon: rating === 'positive' ? 'thumb_up' : 'thumb_down' })
  }

  const abStyle = { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', height: '30px', padding: '0 10px' } as const

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} className="fade-up">
      {/* Living Report Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Living report badge */}
          <span className="badge-live" style={{ fontSize: '9px' }}>Living Report</span>
          {/* Version Badge */}
          {(() => {
            if (typeof window === 'undefined') return null
            let v = 1
            try {
              const versionsStr = localStorage.getItem('verdant-query-versions') || '{}'
              const versions = JSON.parse(versionsStr)
              v = versions[query] || 1
            } catch {}
            return <span className="chip" style={{ fontWeight: '600' }}>v{v}.0</span>
          })()}
          {/* Confidence badge */}
          {result.confidenceScore !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: result.confidenceScore >= 70 ? 'rgba(209,250,229,0.4)' : 'rgba(255,193,7,0.12)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <Shield size={12} style={{ color: result.confidenceScore >= 70 ? '#1A2F23' : '#B8860B' }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11.5px', fontWeight: '600', color: '#1A2F23' }}>Confidence: {result.confidenceScore}/100</span>
            </div>
          )}
          {result.pipelineSource && <span className="chip">{result.pipelineSource}</span>}
          {result.durationMs && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: 'var(--text-muted)' }}>{(result.durationMs / 1000).toFixed(1)}s</span>}
        </div>
        
        {/* Simplify Report Toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: 'var(--bg-elevated)', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--border)', transition: 'all 0.2s' }}>
          <input 
            type="checkbox" 
            checked={simplify} 
            onChange={(e) => setSimplify(e.target.checked)}
            style={{ width: '14px', height: '14px', accentColor: 'var(--green-dark)', cursor: 'pointer' }}
          />
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11.5px', fontWeight: '500', color: simplify ? 'var(--green-dark)' : 'var(--text-secondary)' }}>
            Simplify for Executives
          </span>
        </label>
      </div>

      {/* What Changed Since Last Visit */}
      {(() => {
        if (typeof window === 'undefined') return null
        const deltas = getReportDeltas(query)
        if (deltas.length === 0) return null
        return (
          <div className="card-editorial" style={{ padding: '14px 18px' }}>
            <p className="label-system" style={{ color: 'var(--green-mid)', marginBottom: '10px' }}>Since Your Last Visit</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {deltas.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: d.color }}>{d.icon}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'var(--text-secondary)' }}>{d.text}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Environmental Scores */}
      {(() => {
        const scores = computeReportScores({ query, findings: result.findings || [], sources: result.sources || [], contradictions: result.contradictions, uncertaintyNotes: result.uncertaintyNotes, evidenceItems: result.evidenceItems, confidenceScore: result.confidenceScore })
        const pow = computeProofOfWork({ sources: result.sources, findings: result.findings, contradictions: result.contradictions, uncertaintyNotes: result.uncertaintyNotes, evidenceItems: result.evidenceItems, durationMs: result.durationMs })
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }} className="hide-scrollbar">
              {scores.slice(0, 4).map(s => (
                <div key={s.id} style={{ flexShrink: 0, padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: '#FFFFFF', minWidth: '130px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '13px', color: s.color }}>{s.icon}</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '500' }}>{s.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: s.color, lineHeight: '1' }}>{s.score}</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: 'var(--text-muted)' }}>/{s.maxScore}</span>
                  </div>
                  <div style={{ width: '100%', height: '3px', borderRadius: '2px', background: 'rgba(26,47,35,0.08)' }}>
                    <div style={{ width: `${(s.score / s.maxScore) * 100}%`, height: '100%', borderRadius: '2px', background: s.color, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              ))}
            </div>
            {/* Proof of Work */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>verified</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10.5px', color: 'var(--text-muted)' }}>
                {pow.sourcesAnalyzed} sources · {pow.claimsVerified} claims · {pow.contradictionsDetected} contradictions · {pow.uncertaintiesNoted} uncertainties · {pow.methodologySteps.length}-step methodology
              </span>
            </div>
          </div>
        )
      })()}

      {/* Related Prior Work */}
      {(() => {
        if (typeof window === 'undefined') return null
        const related = getRelatedPriorWork(query)
        if (related.length === 0) return null
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(209,250,229,0.2)', border: '1px solid rgba(46,93,62,0.1)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--green-mid)' }}>psychology</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'var(--text-secondary)', flex: 1 }}>
              Related to your prior research on <strong>{related[0].topic}</strong>
            </span>
            {related[0].priorQueries.slice(0, 1).map((pq, i) => (
              <Link key={i} href={`/research?q=${encodeURIComponent(pq)}`} style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'var(--green-mid)', textDecoration: 'none', fontWeight: '500' }}>
                Compare →
              </Link>
            ))}
          </div>
        )
      })()}

      {/* Action bar */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end', marginBottom: '4px' }}>
        <button onClick={downloadDocx} disabled={exporting || !result.runId} className="btn btn-subtle" style={abStyle}><Download size={12} /> {exporting ? '...' : 'DOCX'}</button>
        <button onClick={copySummary} className="btn btn-subtle" style={abStyle}><Copy size={12} /> Summary</button>
        <button onClick={copyLink} className="btn btn-subtle" style={abStyle}><Share2 size={12} /> Link</button>
        <button onClick={saveToJournal} className="btn btn-subtle" style={abStyle}><BookmarkPlus size={12} /> Save</button>
        <button onClick={() => { addWatchlistItem({ type: 'research', title: result.title || query, description: query, query, priority: 'medium' }); toast('Added to Watchlist', { icon: 'visibility' }) }} className="btn btn-subtle" style={abStyle}><Eye size={12} /> Watch</button>
        <button onClick={onRetry} className="btn btn-subtle" style={abStyle}><RotateCcw size={12} /> Redo</button>
        {!feedbackSent && result.runId && <>
          <button onClick={() => sendFeedback('positive')} className="btn btn-subtle" style={abStyle}><ThumbsUp size={12} /></button>
          <button onClick={() => sendFeedback('negative')} className="btn btn-subtle" style={abStyle}><ThumbsDown size={12} /></button>
        </>}
        {feedbackSent && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12} /> Sent</span>}
      </div>

      {/* Row 1: Synthesis + Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '14px' }}>
        <ResultCard>
          <SectionLabel>Executive Intelligence Briefing</SectionLabel>
          {typeof result.executiveSummary === 'object' && result.executiveSummary ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {result.executiveSummary.whatMattersMost && (
                <div><p style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1A2F23', marginBottom: '6px', opacity: 0.6 }}>What Matters Most</p><p style={{ fontFamily: 'Georgia, serif', fontSize: '15.5px', lineHeight: '1.75', color: 'var(--text-main)' }}>{result.executiveSummary.whatMattersMost}</p></div>
              )}
              {result.executiveSummary.hiddenRisks && (
                <div style={{ borderLeft: '3px solid #B8860B', paddingLeft: '14px' }}><p style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#B8860B', marginBottom: '6px' }}>Hidden Risks</p><p style={{ fontFamily: 'Georgia, serif', fontSize: '14px', lineHeight: '1.75', color: 'var(--text-secondary)' }}>{result.executiveSummary.hiddenRisks}</p></div>
              )}
              {result.executiveSummary.strategicImplications && (
                <div><p style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1A2F23', marginBottom: '6px', opacity: 0.6 }}>Strategic Implications</p><p style={{ fontFamily: 'Georgia, serif', fontSize: '14px', lineHeight: '1.75', color: 'var(--text-secondary)' }}>{result.executiveSummary.strategicImplications}</p></div>
              )}
              {result.executiveSummary.recommendedNextAction && (
                <div style={{ background: 'rgba(209,250,229,0.25)', borderRadius: '8px', padding: '14px 16px', border: '1px solid rgba(46,93,62,0.15)' }}><p style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2E5D3E', marginBottom: '6px' }}>Recommended Action</p><p style={{ fontFamily: 'Georgia, serif', fontSize: '14px', lineHeight: '1.75', color: '#1A2F23' }}>{result.executiveSummary.recommendedNextAction}</p></div>
              )}
              {result.executiveSummary.whyThisMattersNow && (
                <div><p style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1A2F23', marginBottom: '6px', opacity: 0.6 }}>Why This Matters Now</p><p style={{ fontFamily: 'Georgia, serif', fontSize: '14px', lineHeight: '1.75', color: 'var(--text-secondary)' }}>{result.executiveSummary.whyThisMattersNow}</p></div>
              )}
            </div>
          ) : typeof result.executiveSummary === 'string' && result.executiveSummary ? (
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', lineHeight: '1.8', color: 'var(--text-main)' }}>{result.executiveSummary}</p>
          ) : null}
          {result.findings && result.findings.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1A2F23', marginBottom: '10px', opacity: 0.6 }}>Key Findings</p>
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {result.findings.map((f, i) => (
                  <li key={i} style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13.5px', lineHeight: '1.65', color: 'var(--text-secondary)' }}>{f}</li>
                ))}
              </ul>
            </div>
          )}
          {!result.executiveSummary && !result.findings?.length && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13.5px', color: 'var(--text-muted)' }}>No summary data was returned for this query.</p>
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

      {/* Decision Recommendations */}
      {result.decisionRecommendations && result.decisionRecommendations.length > 0 && (
        <ResultCard>
          <SectionLabel>Decision Recommendations</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {result.decisionRecommendations.map((rec, i) => {
              const riskColors: Record<string, string> = { low: '#2E5D3E', medium: '#B8860B', high: '#C0392B', critical: '#8B0000' }
              const urgColors: Record<string, string> = { low: 'var(--text-muted)', medium: '#B8860B', high: '#C0392B', immediate: '#8B0000' }
              return (
                <div key={i} style={{ borderLeft: `3px solid ${riskColors[rec.riskLevel ?? 'medium'] ?? '#B8860B'}`, paddingLeft: '16px' }}>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '14.5px', color: '#1A2F23', marginBottom: '6px', fontWeight: '400' }}>{rec.recommendation}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.65', marginBottom: '8px' }}>{rec.rationale}</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {rec.riskLevel && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '3px 8px', borderRadius: '4px', background: `${riskColors[rec.riskLevel]}15`, color: riskColors[rec.riskLevel] }}>Risk: {rec.riskLevel}</span>}
                    {rec.urgency && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '3px 8px', borderRadius: '4px', background: `${urgColors[rec.urgency]}15`, color: urgColors[rec.urgency] }}>Urgency: {rec.urgency}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </ResultCard>
      )}

      {/* Sources + Strategic Follow-ups */}
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
          <SectionLabel>Strategic Follow-ups</SectionLabel>
          {result.strategicFollowUps && result.strategicFollowUps.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {result.strategicFollowUps.map((q, i) => (
                <button key={i} onClick={() => router.push(`/research?q=${encodeURIComponent(q)}`)} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', cursor: 'pointer', transition: 'all 0.15s ease', textAlign: 'left', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1A2F23'; (e.currentTarget as HTMLElement).style.borderColor = '#1A2F23'; (e.currentTarget as HTMLElement).style.color = '#FFFFFF' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = '' }}
                >
                  <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', lineHeight: '1.5', margin: 0 }}>{q}</p>
                  <ArrowLeft size={13} style={{ flexShrink: 0, transform: 'rotate(180deg)' }} />
                </button>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', color: 'var(--text-muted)' }}>No strategic follow-ups generated.</p>
          )}
        </ResultCard>
      </div>

      {/* Evidence Panel */}
      {!simplify && result.evidenceItems && result.evidenceItems.length > 0 && (
        <ResultCard>
          <button onClick={() => setShowEvidence(!showEvidence)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <SectionLabel>Evidence Panel ({result.evidenceItems.length})</SectionLabel>
            {showEvidence ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
          </button>
          {showEvidence && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
              {result.evidenceItems.map((ev, i) => (
                <div key={i} style={{ borderLeft: '3px solid #2E5D3E', paddingLeft: '14px', paddingTop: '4px', paddingBottom: '4px' }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: '600', color: '#1A2F23', marginBottom: '4px' }}>{ev.claim}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{ev.evidence}</p>
                  {result.sources?.[ev.sourceIndex] && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Source [{ev.sourceIndex + 1}]: {result.sources[ev.sourceIndex].title} {ev.strength && `· ${ev.strength}`}</p>}
                </div>
              ))}
            </div>
          )}
        </ResultCard>
      )}

      {/* Contradictions */}
      {!simplify && result.contradictions && result.contradictions.length > 0 && (
        <ResultCard>
          <SectionLabel>Contradictions Detected ({result.contradictions.length})</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {result.contradictions.map((c, i) => (
              <div key={i} style={{ background: 'rgba(184,134,11,0.06)', borderRadius: '8px', padding: '14px 16px', border: '1px solid rgba(184,134,11,0.15)' }}>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '14px', color: '#1A2F23', marginBottom: '8px' }}>{c.conflict}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}><strong style={{ color: '#2E5D3E' }}>Position A:</strong> {c.sourceA}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}><strong style={{ color: '#B8860B' }}>Position B:</strong> {c.sourceB}</p>
                </div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', fontStyle: 'italic' }}>Implication: {c.implication}</p>
              </div>
            ))}
          </div>
        </ResultCard>
      )}

      {/* Uncertainty Notes */}
      {!simplify && result.uncertaintyNotes && result.uncertaintyNotes.length > 0 && (
        <ResultCard>
          <button onClick={() => setShowUncertainty(!showUncertainty)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <SectionLabel>Uncertainty &amp; Limitations ({result.uncertaintyNotes.length})</SectionLabel>
            {showUncertainty ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
          </button>
          {showUncertainty && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
              {result.uncertaintyNotes.map((note, i) => {
                const isObj = typeof note === 'object'
                return (
                  <div key={i} style={{ borderLeft: '2px solid rgba(184,134,11,0.4)', paddingLeft: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <AlertTriangle size={13} style={{ color: '#B8860B', flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.6', fontWeight: '500' }}>{isObj ? note.uncertainty : String(note)}</p>
                        {isObj && note.reason && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5', marginTop: '4px' }}>{note.reason}</p>}
                        {isObj && note.whatWouldResolveIt && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'var(--green-mid)', lineHeight: '1.5', marginTop: '4px' }}>→ Resolution: {note.whatWouldResolveIt}</p>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ResultCard>
      )}


      {/* Source Reliability Rankings */}
      {result.sources && result.sources.length > 0 && (
        <ResultCard>
          <SectionLabel>Source Reliability Index</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {result.sources.slice(0, 8).map((src, i) => {
              const rel = getSourceReliability(src.title, src.url)
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 8px', borderRadius: '6px', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: '700', color: rel.color, background: rel.bgColor, padding: '2px 7px', borderRadius: '4px', flexShrink: 0, minWidth: '28px', textAlign: 'center' }}>{rel.tier}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12.5px', color: 'var(--text-secondary)', flex: 1 }}>
                    {src.url ? <a href={src.url} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}>{src.title}</a> : src.title}
                  </span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: 'var(--text-faint)' }}>{rel.label}</span>
                </div>
              )
            })}
          </div>
        </ResultCard>
      )}

      {/* Contradiction Radar */}
      {!simplify && result.contradictions && result.contradictions.length > 0 && (
        <div className="card-signal" style={{ padding: '20px 22px', borderColor: 'rgba(184,134,11,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <AlertTriangle size={16} style={{ color: '#B8860B' }} />
            <span className="label-system" style={{ color: '#B8860B' }}>Scientific Disagreement Detected</span>
            <span className="badge-gold" style={{ marginLeft: 'auto' }}>{result.contradictions.length} conflict{result.contradictions.length > 1 ? 's' : ''}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {result.contradictions.map((c, i) => (
              <div key={i} style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(184,134,11,0.03)', border: '1px solid rgba(184,134,11,0.1)' }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: '500', color: 'var(--text-main)', marginBottom: '6px' }}>{c.conflict}</p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'var(--text-muted)' }}>Source A: {c.sourceA}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'var(--text-muted)' }}>Source B: {c.sourceB}</span>
                </div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{c.implication}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Signature */}
      <div className="protocol-stamp" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--green-mid)' }}>verified</span>
          <div>
            <span style={{ fontWeight: '600', color: 'var(--text-secondary)', fontSize: '11px' }}>Verdant Intelligence Protocol v3.2</span>
            <span style={{ display: 'block', fontSize: '9.5px', marginTop: '1px', color: 'var(--text-faint)' }}>Evidence Integrity Score: {result.confidenceScore ?? '—'} · Multi-agent verified</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {result.costBreakdown && (
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: 'var(--text-faint)' }}>${result.costBreakdown.costUsd.toFixed(6)} · {result.costBreakdown.inputTokens + result.costBreakdown.outputTokens} tokens</span>
          )}
          <Link href="/protocol" style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: 'var(--green-mid)', textDecoration: 'none', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Protocol →</Link>
        </div>
      </div>
    </div>
  )
}

function RawResult({ text, query }: { text: string; query: string }) {
  const { toast } = useToast()
  const saveToJournal = () => {
    const entries = JSON.parse(localStorage.getItem('verdant-journal') ?? '[]')
    entries.unshift({ id: Date.now(), query, title: query, summary: text, confidenceScore: 60, hasActionable: false, savedAt: new Date().toISOString() })
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
  const templateId = searchParams.get('tpl') ?? ''
  const presetId = searchParams.get('preset') ?? ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [result, setResult] = useState<ResearchResult | null>(null)
  const [asyncStage, setAsyncStage] = useState<string | undefined>()
  const [asyncProgress, setAsyncProgress] = useState<number | undefined>()
  const [asyncEta, setAsyncEta] = useState<number | undefined>()
  const isFetchingRef = React.useRef(false)

  // Get template-specific follow-ups
  const activeTemplate = templateId ? TEMPLATES.find(t => t.id === templateId) : null

  const runFetch = useCallback(async () => {
    if (!queryString) { router.replace('/'); return }
    if (isFetchingRef.current) return
    
    isFetchingRef.current = true
    setStatus('loading')
    setResult(null)
    setAsyncStage(undefined)
    setAsyncProgress(undefined)

    const searchMode = typeof window !== 'undefined'
      ? (localStorage.getItem('verdant-search-mode') || 'focus')
      : 'focus'
    const idempotencyKey = `${queryString}-${Date.now()}`

    try {
      // ─── Use async job system ────────────────────────────────────────
      const startRes = await fetch('/api/research/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryString, mode: searchMode, idempotencyKey, presetId: presetId || undefined }),
      })
      const startData = await startRes.json()

      if (!startData.ok && startData.message) {
        setResult({ error: startData.message })
        setStatus('error')
        isFetchingRef.current = false
        return
      }

      // Focus/Deep: result returned immediately
      if (startData.result) {
        const data = startData.result as ResearchResult
        if (data.ok === false && (data.message || data.error)) {
          setResult({ error: data.message || data.error, raw: data.message || data.error })
        } else {
          setResult(data)
          recordActivity()
          if (queryString) { 
            recordQuery(queryString)
            recordReportView(queryString) 
            try {
              const vs = JSON.parse(localStorage.getItem('verdant-query-versions') || '{}')
              vs[queryString] = (vs[queryString] || 0) + 1
              localStorage.setItem('verdant-query-versions', JSON.stringify(vs))
            } catch {}
          }
        }
        setStatus('success')
        return
      }

      // Failed inline
      if (startData.status === 'failed') {
        setResult({ error: startData.errorReason || 'Analysis failed' })
        setStatus('error')
        isFetchingRef.current = false
        return
      }

      // ─── Analytica: poll for status ──────────────────────────────────
      if (startData.async && startData.jobId) {
        const jobId = startData.jobId
        setAsyncStage(startData.stage || 'Queued for processing')
        setAsyncProgress(startData.progress || 5)
        setAsyncEta(startData.etaSeconds || 180)

        const pollInterval = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/research/status/${jobId}`)
            const statusData = await statusRes.json()

            setAsyncStage(statusData.stage)
            setAsyncProgress(statusData.progress)

            if (statusData.ready) {
              clearInterval(pollInterval)
              // Fetch full result
              const resultRes = await fetch(`/api/research/result/${jobId}`)
              const resultData = await resultRes.json()
              if (resultData.ok && resultData.result) {
                setResult(resultData.result as ResearchResult)
                recordActivity()
                if (queryString) {
                  recordQuery(queryString)
                  recordReportView(queryString)
                  try {
                    const vs = JSON.parse(localStorage.getItem('verdant-query-versions') || '{}')
                    vs[queryString] = (vs[queryString] || 0) + 1
                    localStorage.setItem('verdant-query-versions', JSON.stringify(vs))
                  } catch {}
                }
              } else {
                setResult({ error: 'Failed to retrieve completed report', raw: '' })
              }
              setAsyncStage(undefined)
              setAsyncProgress(undefined)
              setStatus('success')
            } else if (statusData.failed) {
              clearInterval(pollInterval)
              setResult({ error: statusData.errorReason || 'Analysis failed after retries' })
              setAsyncStage(undefined)
              setAsyncProgress(undefined)
              setStatus('error')
            }
          } catch {
            // Silently retry polling on network errors
          }
        }, 5000)

        // Safety: stop polling after 10 minutes
        setTimeout(() => {
          clearInterval(pollInterval)
          if (status === 'loading') {
            setResult({ error: 'Analysis timed out. Analytica reports may take several minutes — please try again.', raw: 'Timeout' })
            setAsyncStage(undefined)
            setStatus('success')
          }
        }, 600000)
        return
      }

      // Fallback: unexpected response
      setResult({ error: 'Unexpected response from research engine' })
      setStatus('error')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setResult({ error: 'Request timed out. Please try again.' })
        setStatus('error')
      } else {
        setResult({ error: (err as Error).message || 'An unknown error occurred.' })
        setStatus('error')
      }
    } finally {
      isFetchingRef.current = false
    }
  }, [queryString, router, presetId])

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
          className="heading-display"
          style={{
            fontSize: '30px',
            lineHeight: '1.3',
            letterSpacing: '-0.5px',
            marginBottom: '28px',
            maxWidth: '760px',
          }}
        >
          {queryString}
        </h1>

        {status === 'loading' && <LoadingState asyncStage={asyncStage} asyncProgress={asyncProgress} etaSeconds={asyncEta} />}
        {status === 'error'   && <ErrorState onRetry={() => { isFetchingRef.current = false; runFetch(); }} message={result?.error} />}
        {status === 'success' && !hasContent && <EmptyState />}
        {status === 'success' && result && hasContent && (
          result.raw && !result.executiveSummary
            ? <RawResult text={result.raw} query={queryString} />
            : <StructuredResult result={result} query={queryString} onRetry={runFetch} />
        )}

        {/* Template-specific Follow-up Paths */}
        {status === 'success' && activeTemplate && activeTemplate.followUps.length > 0 && (
          <div style={{ marginTop: '20px' }} className="fade-up">
            <div className="card" style={{ padding: '20px' }}>
              <p className="section-label">Environmental Follow-up Paths</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeTemplate.followUps.map((fu, i) => (
                  <button
                    key={i}
                    onClick={() => router.push(`/research?q=${encodeURIComponent(fu)}${presetId ? `&preset=${presetId}` : ''}`)}
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', cursor: 'pointer', transition: 'all 0.15s ease', textAlign: 'left', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1A2F23'; (e.currentTarget as HTMLElement).style.borderColor = '#1A2F23'; (e.currentTarget as HTMLElement).style.color = '#FFFFFF' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = '' }}
                  >
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', lineHeight: '1.5', margin: 0 }}>{fu}</p>
                    <ArrowRight size={13} style={{ flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {status !== 'loading' && (
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
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
