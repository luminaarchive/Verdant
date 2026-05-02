'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/components/verdant/AppLayout'
import { SearchBox } from '@/components/verdant/SearchBox'
import { ArrowRight } from 'lucide-react'
import { TEMPLATES, TEMPLATE_CATEGORIES, type EnvironmentalTemplate, type TemplateDomain } from '@/lib/research/templates'
import { PRESETS } from '@/lib/research/presets'
import { getReturnVisitSummary } from '@/lib/retention/signals'
import { getWatchlists } from '@/lib/retention/watchlists'
import { getPlanetPulse, DIRECTION_COLORS } from '@/lib/intelligence/pulse'
import { getWorldNatureIndex, TREND_LABELS } from '@/lib/intelligence/nature-index'
import { getMemory } from '@/lib/intelligence/memory'

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

// ─── Intelligence Signals per domain ────────────────────────────────────────
const DOMAIN_SIGNALS: Record<string, { icon: string; text: string; tag: string }[]> = {
  all: [
    { icon: 'warning', text: 'IUCN Red List updated — 3,291 species moved to higher threat categories', tag: 'Biodiversity Alert' },
    { icon: 'thermostat', text: 'Global ocean temperatures exceeded 1.5°C above pre-industrial baseline for 12 consecutive months', tag: 'Climate Signal' },
    { icon: 'gavel', text: 'EU Deforestation Regulation enforcement begins — supply chain compliance deadline approaching', tag: 'Regulatory' },
    { icon: 'eco', text: 'Amazon tipping point study: deforestation threshold revised downward to 20-25% forest loss', tag: 'Ecosystem Risk' },
  ],
  ecology: [
    { icon: 'eco', text: 'Amazon tipping point study: deforestation threshold revised downward to 20-25% forest loss', tag: 'Ecosystem Risk' },
    { icon: 'forest', text: 'Global Forest Watch reports 4.1M hectares of primary forest lost in 2024', tag: 'Deforestation' },
  ],
  biodiversity: [
    { icon: 'warning', text: 'IUCN Red List updated — 3,291 species moved to higher threat categories', tag: 'Species Crisis' },
    { icon: 'pest_control', text: 'Global insect biomass declined 27% in monitored regions over past decade', tag: 'Invertebrate Alert' },
  ],
  botany: [
    { icon: 'grass', text: 'Kew Gardens State of the World\'s Plants: 2 in 5 plant species now face extinction', tag: 'Flora Alert' },
    { icon: 'park', text: 'New study identifies 7,000+ undescribed plant species awaiting formal taxonomy', tag: 'Discovery' },
  ],
  mycology: [
    { icon: 'hub', text: 'Mycorrhizal network mapping reveals "mother tree" networks span up to 30 hectares', tag: 'Network Science' },
    { icon: 'science', text: 'New fungal species discovered with potential to break down microplastics', tag: 'Mycoremediation' },
  ],
  geology: [
    { icon: 'landslide', text: 'USGS updated seismic hazard maps — 43 regions reclassified to higher risk zones', tag: 'Seismic Alert' },
    { icon: 'thermostat', text: 'Permafrost thaw accelerating: methane emissions 40% higher than 2020 projections', tag: 'Cryosphere' },
  ],
  oceanography: [
    { icon: 'scuba_diving', text: 'Great Barrier Reef mass bleaching event confirmed — 5th in 8 years', tag: 'Coral Crisis' },
    { icon: 'water_drop', text: 'Ocean acidification reaching levels unseen in 14 million years — pH 8.04 average', tag: 'Acidification' },
  ],
}

// Valid domain names from TopBar category pills
const DOMAIN_NAMES = ['ecology', 'biodiversity', 'botany', 'mycology', 'geology', 'oceanography']

function HomeContent() {
  const searchParams = useSearchParams()
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [selectedDomain, setSelectedDomain] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [returnSummary, setReturnSummary] = useState<{ urgentCount: number; importantCount: number; totalSignals: number; staleReports: number; message: string } | null>(null)

  // Sync domain from URL param (TopBar pushes ?category=ecology etc.)
  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat && DOMAIN_NAMES.includes(cat)) {
      setSelectedDomain(cat)
      setSelectedCategory('all') // Reset template-type filter when switching domain
    } else if (!cat) {
      setSelectedDomain('all')
    }
  }, [searchParams])

  useState(() => {
    if (typeof window !== 'undefined') {
      const wl = getWatchlists()
      if (wl.length > 0) setReturnSummary(getReturnVisitSummary())
    }
  })

  // Dual filtering: TopBar domain + inline template-type category
  const filteredTemplates = TEMPLATES
    .filter(t => selectedDomain === 'all' || t.domain.includes(selectedDomain as TemplateDomain))
    .filter(t => selectedCategory === 'all' || t.category === selectedCategory)

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

  // Domain-specific signal
  const domainSignals = DOMAIN_SIGNALS[selectedDomain] || DOMAIN_SIGNALS.all
  const signal = domainSignals[Math.floor(Math.random() * domainSignals.length)]

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

      {/* ─── Planet Pulse Strip ─── */}
      <div style={{ width: '100%', maxWidth: '760px', marginTop: '36px' }} className="fade-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--green-mid)' }}>satellite_alt</span>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: '600', color: 'var(--green-mid)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Planet Pulse</h3>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: 'var(--text-muted)', marginLeft: 'auto' }}>Real-time environmental signals</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }} className="hide-scrollbar">
          {getPlanetPulse().slice(0, 6).map(p => (
            <Link key={p.id} href={`/research?q=${encodeURIComponent(p.metric + ' ' + p.region + ' analysis')}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
              <div className="card" style={{ padding: '12px 16px', minWidth: '155px', transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#1A2F23'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = ''}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: DIRECTION_COLORS[p.direction] }}>{p.icon}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '500' }}>{p.metric}</span>
                </div>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#1A2F23', lineHeight: '1', marginBottom: '4px' }}>{p.value}<span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '2px' }}>{p.unit}</span></p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '10.5px', color: DIRECTION_COLORS[p.direction], fontWeight: '600' }}>{p.change} · {p.source}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── World Nature Index ─── */}
      <div style={{ width: '100%', maxWidth: '760px', marginTop: '28px' }} className="fade-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>public</span>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Verdant Nature Index</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
          {getWorldNatureIndex().slice(0, 4).map(idx => (
            <Link key={idx.id} href={`/research?q=${encodeURIComponent(idx.name + ' current status')}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '16px', transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#1A2F23'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = ''}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: idx.color }}>{idx.icon}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '9.5px', fontWeight: '600', color: idx.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{TREND_LABELS[idx.trend]}</span>
                </div>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: '#1A2F23', lineHeight: '1', marginBottom: '4px' }}>{idx.score}<span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/{idx.maxScore}</span></p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '4px' }}>{idx.name}</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{idx.description.slice(0, 80)}...</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── Personal Intelligence Feed ─── */}
      {(() => {
        const mem = typeof window !== 'undefined' ? getMemory() : null
        if (!mem || mem.topics.length === 0) return null
        const topTopics = [...mem.topics].sort((a, b) => b.count - a.count).slice(0, 3)
        return (
          <div style={{ width: '100%', maxWidth: '760px', marginTop: '28px' }} className="fade-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>psychology</span>
              <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Your Research Memory</h3>
              {mem.specialization && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: 'var(--green-mid)', marginLeft: 'auto', fontWeight: '500' }}>Specialization: {mem.specialization}</span>}
            </div>
            <div className="card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {topTopics.map(t => (
                  <Link key={t.topic} href={`/research?q=${encodeURIComponent(t.relatedQueries[0] || t.topic)}`} style={{ textDecoration: 'none', flex: '1 1 180px' }}>
                    <div style={{ padding: '10px', borderRadius: '8px', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12.5px', fontWeight: '500', color: '#1A2F23', marginBottom: '4px' }}>{t.topic}</p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'var(--text-muted)' }}>{t.count} session{t.count !== 1 ? 's' : ''} · Resume →</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Trust Footer */}
      <div style={{ width: '100%', maxWidth: '760px', marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border)', textAlign: 'center' }} className="fade-up">
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Verdant is an Environmental Intelligence Authority. Every claim is source-traced. Every recommendation is evidence-backed.
          <br />Powered by a network of 8 specialized environmental AI agents.
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
