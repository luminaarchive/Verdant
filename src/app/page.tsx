'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/components/verdant/AppLayout'
import { SearchBox } from '@/components/verdant/SearchBox'
import { ArrowRight } from 'lucide-react'
import { TEMPLATES, TEMPLATE_CATEGORIES, type EnvironmentalTemplate } from '@/lib/research/templates'
import { PRESETS } from '@/lib/research/presets'
import { getReturnVisitSummary } from '@/lib/retention/signals'
import { getWatchlists } from '@/lib/retention/watchlists'

// ─── Template Card ──────────────────────────────────────────────────────────
function TemplateCard({ t }: { t: EnvironmentalTemplate }) {
  return (
    <Link
      href={`/research?q=${encodeURIComponent(t.prompt)}&tpl=${t.id}`}
      className="card card-lift"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        textDecoration: 'none',
        minHeight: '130px',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <span className="material-symbols-outlined" style={{ color: 'var(--green-mid)', marginBottom: '10px', fontSize: '20px', display: 'block' }}>{t.icon}</span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '5px', lineHeight: '1.3', display: 'block' }}>{t.title}</span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.5', display: 'block' }}>{t.subtitle}</span>
      </div>
      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontFamily: "'Inter', sans-serif", fontWeight: '600', color: 'var(--green-mid)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Run Analysis <ArrowRight size={12} />
      </div>
    </Link>
  )
}

// ─── Preset Pill ────────────────────────────────────────────────────────────
function PresetPill({ preset, selected, onClick }: { preset: typeof PRESETS[0]; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '7px 14px', borderRadius: '20px', cursor: 'pointer',
        fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: '500',
        border: selected ? '1px solid #1A2F23' : '1px solid var(--border)',
        background: selected ? '#1A2F23' : 'var(--bg-card)',
        color: selected ? '#FFFFFF' : 'var(--text-secondary)',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{preset.icon}</span>
      {preset.label}
    </button>
  )
}

// ─── Intelligence Signal ────────────────────────────────────────────────────
const SIGNALS = [
  { icon: 'warning', text: 'IUCN Red List updated — 3,291 species moved to higher threat categories', tag: 'Biodiversity Alert' },
  { icon: 'thermostat', text: 'Global ocean temperatures exceeded 1.5°C above pre-industrial baseline for 12 consecutive months', tag: 'Climate Signal' },
  { icon: 'gavel', text: 'EU Deforestation Regulation enforcement begins — supply chain compliance deadline approaching', tag: 'Regulatory' },
  { icon: 'eco', text: 'Amazon tipping point study: deforestation threshold revised downward to 20-25% forest loss', tag: 'Ecosystem Risk' },
]

function HomeContent() {
  const searchParams = useSearchParams()
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [signalIndex] = useState(() => Math.floor(Math.random() * SIGNALS.length))
  const [returnSummary, setReturnSummary] = useState<{ urgentCount: number; importantCount: number; totalSignals: number; staleReports: number; message: string } | null>(null)

  // Sync category from URL param (TopBar pushes ?category=X)
  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat && TEMPLATE_CATEGORIES.some(c => c.id === cat)) {
      setSelectedCategory(cat)
    }
  }, [searchParams])

  useState(() => {
    if (typeof window !== 'undefined') {
      const wl = getWatchlists()
      if (wl.length > 0) setReturnSummary(getReturnVisitSummary())
    }
  })

  const filteredTemplates = selectedCategory === 'all'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === selectedCategory)

  // If a preset is selected, prioritize its suggested templates
  const displayTemplates = selectedPreset
    ? (() => {
        const preset = PRESETS.find(p => p.id === selectedPreset)
        if (!preset) return filteredTemplates
        const suggested = preset.suggestedTemplates
        const prioritized = [...filteredTemplates].sort((a, b) => {
          const aIdx = suggested.indexOf(a.id)
          const bIdx = suggested.indexOf(b.id)
          if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
          if (aIdx !== -1) return -1
          if (bIdx !== -1) return 1
          return 0
        })
        return prioritized
      })()
    : filteredTemplates

  const signal = SIGNALS[signalIndex]

  return (
    <div style={{ padding: '40px 32px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100%' }}>
      {/* Hero */}
      <div style={{ width: '100%', maxWidth: '680px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '28px' }} className="fade-up">
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '10.5px', color: 'var(--green-mid)', marginBottom: '14px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: '600' }}>
          Environmental Intelligence Platform
        </p>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '42px', fontWeight: '400', letterSpacing: '-1.5px', lineHeight: '1.1', color: '#1A2F23', marginBottom: '12px' }}>
          verdant
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px', lineHeight: '1.6', color: 'var(--text-muted)', maxWidth: '520px' }}>
          Decision-grade environmental research. Species risk, climate intelligence, conservation strategy, policy impact — powered by executive-level AI analysis.
        </p>
      </div>

      {/* Search */}
      <div style={{ width: '100%', maxWidth: '680px', marginBottom: '32px' }} className="fade-up">
        <SearchBox autoFocus />
      </div>

      {/* Return Visit Intelligence */}
      {returnSummary && returnSummary.totalSignals > 0 && (
        <div style={{ width: '100%', maxWidth: '760px', marginBottom: '16px' }} className="fade-up">
          <Link
            href="/digest"
            className="card"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', textDecoration: 'none', borderLeft: `3px solid ${returnSummary.urgentCount > 0 ? '#C0392B' : returnSummary.importantCount > 0 ? '#B8860B' : 'var(--green-mid)'}` }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: returnSummary.urgentCount > 0 ? '#C0392B' : 'var(--green-mid)' }}>
              {returnSummary.urgentCount > 0 ? 'error' : 'notifications_active'}
            </span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-secondary)', flex: 1 }}>
              {returnSummary.message}
            </span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: '600', color: 'var(--green-mid)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View Digest <ArrowRight size={12} />
            </span>
          </Link>
        </div>
      )}

      {/* Intelligence Signal */}
      <div style={{ width: '100%', maxWidth: '760px', marginBottom: '28px' }} className="fade-up">
        <Link
          href={`/research?q=${encodeURIComponent(signal.text)}`}
          className="card"
          style={{
            display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px',
            textDecoration: 'none', transition: 'border-color 0.15s',
            borderLeft: '3px solid var(--green-mid)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--green-mid)', flexShrink: 0 }}>{signal.icon}</span>
          <div style={{ flex: 1 }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--green-mid)', display: 'block', marginBottom: '3px' }}>{signal.tag}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{signal.text}</span>
          </div>
          <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        </Link>
      </div>

      {/* Domain Presets */}
      <div style={{ width: '100%', maxWidth: '760px', marginBottom: '24px' }} className="fade-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>tune</span>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            I&apos;m researching as
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {PRESETS.map(p => (
            <PresetPill
              key={p.id}
              preset={p}
              selected={selectedPreset === p.id}
              onClick={() => setSelectedPreset(selectedPreset === p.id ? null : p.id)}
            />
          ))}
        </div>
        {selectedPreset && (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.5' }}>
            {PRESETS.find(p => p.id === selectedPreset)?.description}
          </p>
        )}
      </div>

      {/* Template Categories */}
      <div style={{ width: '100%', maxWidth: '760px', marginBottom: '16px' }} className="fade-up">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>science</span>
            <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Environmental Intelligence Templates
            </h3>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {TEMPLATE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '5px 12px', borderRadius: '16px', cursor: 'pointer',
                fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: '500',
                border: selectedCategory === cat.id ? '1px solid #1A2F23' : '1px solid var(--border)',
                background: selectedCategory === cat.id ? '#1A2F23' : 'transparent',
                color: selectedCategory === cat.id ? '#FFFFFF' : 'var(--text-muted)',
                transition: 'all 0.15s ease',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      <div style={{ width: '100%', maxWidth: '760px' }} className="fade-up">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
          {displayTemplates.map(t => (
            <TemplateCard key={t.id} t={t} />
          ))}
        </div>
      </div>

      {/* Trust Footer */}
      <div style={{ width: '100%', maxWidth: '760px', marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border)', textAlign: 'center' }} className="fade-up">
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Verdant produces executive intelligence reports with evidence mapping, contradiction detection, and uncertainty analysis.
          <br />Every claim is source-traced. Every recommendation is evidence-backed.
        </p>
      </div>
    </div>
  )
}

export default function VerdantHome() {
  return (
    <AppLayout>
      <Suspense
        fallback={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-muted)' }}>Loading...</p>
          </div>
        }
      >
        <HomeContent />
      </Suspense>
    </AppLayout>
  )
}
