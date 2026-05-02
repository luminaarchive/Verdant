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
import { getDailyBrief } from '@/lib/intelligence/daily-brief'
import { getStatusInsights } from '@/lib/intelligence/status'
import { getPrestigeLevel } from '@/lib/intelligence/prestige'
import { getStreak } from '@/lib/streak/client'

function TemplateCard({ t }: { t: EnvironmentalTemplate }) {
  return (
    <Link
      href={`/research?q=${encodeURIComponent(t.prompt)}&tpl=${t.id}`}
      className="card-premium"
      style={{ padding: '20px', display: 'flex', flexDirection: 'column', cursor: 'pointer', textDecoration: 'none', minHeight: '140px', justifyContent: 'space-between' }}
    >
      <div>
        <span className="material-symbols-outlined" style={{ color: 'var(--green-mid)', marginBottom: '10px', fontSize: '20px', display: 'block' }}>{t.icon}</span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13.5px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '5px', lineHeight: '1.3', display: 'block' }}>{t.title}</span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', display: 'block' }}>{t.subtitle}</span>
      </div>
      <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontFamily: "'Inter', sans-serif", fontWeight: '600', color: 'var(--green-mid)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Run Analysis <ArrowRight size={11} />
      </div>
    </Link>
  )
}

function PresetPill({ preset, selected, onClick }: { preset: typeof PRESETS[0]; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={selected ? 'chip chip-active' : 'chip'}
      style={{ padding: '7px 14px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{preset.icon}</span>
      {preset.label}
    </button>
  )
}

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

const DOMAIN_NAMES = ['ecology', 'biodiversity', 'botany', 'mycology', 'geology', 'oceanography']

function HomeContent() {
  const searchParams = useSearchParams()
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [selectedDomain, setSelectedDomain] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [returnSummary, setReturnSummary] = useState<{ urgentCount: number; importantCount: number; totalSignals: number; staleReports: number; message: string } | null>(null)

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat && DOMAIN_NAMES.includes(cat)) {
      setSelectedDomain(cat)
      setSelectedCategory('all')
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

  const filteredTemplates = TEMPLATES
    .filter(t => selectedDomain === 'all' || t.domain.includes(selectedDomain as TemplateDomain))
    .filter(t => selectedCategory === 'all' || t.category === selectedCategory)

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

  const domainSignals = DOMAIN_SIGNALS[selectedDomain] || DOMAIN_SIGNALS.all
  const signal = domainSignals[Math.floor(Math.random() * domainSignals.length)]

  // Phase 4: Daily Brief + Status
  const daily = typeof window !== 'undefined' ? getDailyBrief() : null
  const streak = typeof window !== 'undefined' ? getStreak() : { days: 0 }
  const journalCount = typeof window !== 'undefined' ? (() => { try { return JSON.parse(localStorage.getItem('verdant-journal') ?? '[]').length } catch { return 0 } })() : 0
  const watchlistCount = typeof window !== 'undefined' ? (() => { try { return JSON.parse(localStorage.getItem('verdant-watchlists') ?? '[]').length } catch { return 0 } })() : 0
  const statusInsights = typeof window !== 'undefined' ? getStatusInsights(journalCount, streak.days, journalCount, watchlistCount) : []
  const prestige = typeof window !== 'undefined' ? getPrestigeLevel(journalCount, streak.days) : null

  return (
    <div style={{ padding: '36px 32px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100%' }}>
      {/* Hero */}
      <div style={{ width: '100%', maxWidth: '680px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }} className="slide-up">
        <div className="section-frame" style={{ marginBottom: '16px', width: '100%', maxWidth: '320px', justifyContent: 'center' }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: 'var(--green-mid)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: '600' }}>
            Environmental Intelligence Platform
          </span>
        </div>
        <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '52px', fontWeight: '400', letterSpacing: '-2px', lineHeight: '1.0', color: '#1A2F23', marginBottom: '14px' }}>
          verdant
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14.5px', lineHeight: '1.7', color: 'var(--text-muted)', maxWidth: '500px' }}>
          Decision-grade environmental research. Species risk, climate intelligence, conservation strategy — powered by executive-level AI analysis.
        </p>
        {prestige && prestige.id !== 'observer' && (
          <div className="prestige-badge" style={{ marginTop: '12px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>{prestige.icon}</span>
            {prestige.title}
          </div>
        )}
      </div>

      {/* Search */}
      <div style={{ width: '100%', maxWidth: '680px', marginBottom: '16px' }} className="slide-up stagger-1">
        <SearchBox autoFocus />
      </div>

      {/* Guided Example Prompts (Phase 0.3) */}
      <div style={{ width: '100%', maxWidth: '680px', marginBottom: '28px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }} className="slide-up stagger-1">
        {[
          { text: 'Coral reef collapse risk in Indonesia', mode: 'deep' },
          { text: 'Orangutan extinction impact', mode: 'focus' },
          { text: 'Mangrove restoration funding opportunities', mode: 'deep' },
          { text: 'Climate adaptation strategy for coastal regions', mode: 'analytica' }
        ].map((example, i) => (
          <Link
            key={i}
            href={`/research?q=${encodeURIComponent(example.text)}&mode=${example.mode}`}
            className="chip"
            style={{ fontSize: '11px', padding: '4px 10px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(26,47,35,0.03)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '12px', color: 'var(--green-mid)' }}>lightbulb</span>
            {example.text}
          </Link>
        ))}
      </div>

      {/* Status Layer */}
      {statusInsights.length > 0 && (
        <div style={{ width: '100%', maxWidth: '760px', marginBottom: '16px' }} className="slide-up stagger-2">
          {statusInsights.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: '10px', background: 'rgba(209,250,229,0.15)', border: '1px solid rgba(46,93,62,0.08)', marginBottom: i < statusInsights.length - 1 ? '6px' : '0' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: s.color }}>{s.icon}</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12.5px', color: 'var(--text-secondary)', flex: 1 }}>{s.text}</span>
              <span className="chip" style={{ fontSize: '9.5px' }}>{s.metric}</span>
            </div>
          ))}
        </div>
      )}

      {/* Daily Intelligence Ritual */}
      {daily && (
        <div style={{ width: '100%', maxWidth: '760px', marginBottom: '16px' }} className="slide-up stagger-2">
          <Link
            href={`/research?q=${encodeURIComponent(daily.query)}`}
            className="card-signal"
            style={{ display: 'block', padding: '18px 20px', textDecoration: 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <span className="badge-live" style={{ fontSize: '9px', padding: '2px 10px 2px 18px' }}>Today&apos;s Brief</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: 'var(--text-faint)' }}>{daily.date}</span>
            </div>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: daily.color, flexShrink: 0, marginTop: '2px' }}>{daily.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '17px', color: '#1A2F23', lineHeight: '1.35', marginBottom: '6px' }}>{daily.headline}</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.55' }}>{daily.detail}</p>
                {daily.watchlistImpact && (
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'var(--warning)', marginTop: '6px', fontWeight: '500' }}>{daily.watchlistImpact}</p>
                )}
              </div>
              <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '4px' }} />
            </div>
          </Link>
        </div>
      )}

      {/* Return Visit Intelligence */}
      {returnSummary && returnSummary.totalSignals > 0 && (
        <div style={{ width: '100%', maxWidth: '760px', marginBottom: '14px' }} className="slide-up stagger-3">
          <Link href="/digest" className="card-editorial" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', textDecoration: 'none' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: returnSummary.urgentCount > 0 ? '#C0392B' : 'var(--green-mid)' }}>
              {returnSummary.urgentCount > 0 ? 'error' : 'notifications_active'}
            </span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-secondary)', flex: 1 }}>{returnSummary.message}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: '600', color: 'var(--green-mid)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View Digest <ArrowRight size={11} />
            </span>
          </Link>
        </div>
      )}

      {/* Intelligence Signal */}
      <div style={{ width: '100%', maxWidth: '760px', marginBottom: '28px' }} className="slide-up stagger-3">
        <Link
          href={`/research?q=${encodeURIComponent(signal.text)}`}
          className="card-signal"
          style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', textDecoration: 'none' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--green-mid)', flexShrink: 0 }}>{signal.icon}</span>
          <div style={{ flex: 1 }}>
            <span className="label-system" style={{ color: 'var(--green-mid)', display: 'block', marginBottom: '3px', fontSize: '9.5px' }}>{signal.tag}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{signal.text}</span>
          </div>
          <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        </Link>
      </div>

      {/* Domain Presets */}
      <div style={{ width: '100%', maxWidth: '760px', marginBottom: '24px' }} className="slide-up stagger-4">
        <div className="section-frame">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>tune</span>
            <h3 className="heading-section" style={{ margin: 0 }}>I&apos;m researching as</h3>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {PRESETS.map(p => (
            <PresetPill key={p.id} preset={p} selected={selectedPreset === p.id} onClick={() => setSelectedPreset(selectedPreset === p.id ? null : p.id)} />
          ))}
        </div>
        {selectedPreset && (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.5' }}>
            {PRESETS.find(p => p.id === selectedPreset)?.description}
          </p>
        )}
      </div>

      {/* Template Categories */}
      <div style={{ width: '100%', maxWidth: '760px', marginBottom: '16px' }} className="slide-up stagger-5">
        <div className="section-frame">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>science</span>
            <h3 className="heading-section" style={{ margin: 0 }}>Environmental Intelligence Templates</h3>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {TEMPLATE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={selectedCategory === cat.id ? 'chip chip-active' : 'chip'}
              style={{ cursor: 'pointer' }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      <div style={{ width: '100%', maxWidth: '760px' }} className="slide-up stagger-5">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
          {displayTemplates.map(t => (
            <TemplateCard key={t.id} t={t} />
          ))}
        </div>
      </div>

      {/* Planet Pulse Strip */}
      <div style={{ width: '100%', maxWidth: '760px', marginTop: '36px' }} className="slide-up stagger-6">
        <div className="section-frame">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--green-mid)' }}>satellite_alt</span>
            <h3 className="heading-section" style={{ margin: 0, color: 'var(--green-mid)' }}>Planet Pulse</h3>
          </div>
        </div>
        <div className="data-strip">
          {getPlanetPulse().slice(0, 6).map(p => (
            <Link key={p.id} href={`/research?q=${encodeURIComponent(p.metric + ' ' + p.region + ' analysis')}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
              <div className="card-data" style={{ padding: '14px 16px', minWidth: '160px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: DIRECTION_COLORS[p.direction] }}>{p.icon}</span>
                  <span className="label-data">{p.metric}</span>
                </div>
                <p className="value-data" style={{ marginBottom: '4px', fontSize: '22px' }}>{p.value}<span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '2px', fontFamily: "'Inter', sans-serif" }}>{p.unit}</span></p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '10.5px', color: DIRECTION_COLORS[p.direction], fontWeight: '600' }}>{p.change} · {p.source}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* World Nature Index */}
      <div style={{ width: '100%', maxWidth: '760px', marginTop: '28px' }} className="slide-up stagger-7">
        <div className="section-frame">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>public</span>
            <h3 className="heading-section" style={{ margin: 0 }}>Verdant Nature Index</h3>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
          {getWorldNatureIndex().slice(0, 4).map(idx => (
            <Link key={idx.id} href={`/research?q=${encodeURIComponent(idx.name + ' current status')}`} style={{ textDecoration: 'none' }}>
              <div className="card-data" style={{ padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: idx.color }}>{idx.icon}</span>
                  <span className="label-system" style={{ color: idx.color, fontSize: '9px' }}>{TREND_LABELS[idx.trend]}</span>
                </div>
                <p className="value-data" style={{ marginBottom: '6px' }}>{idx.score}<span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>/{idx.maxScore}</span></p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '4px' }}>{idx.name}</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{idx.description.slice(0, 80)}...</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Personal Intelligence Feed */}
      {(() => {
        const mem = typeof window !== 'undefined' ? getMemory() : null
        if (!mem || mem.topics.length === 0) return null
        const topTopics = [...mem.topics].sort((a, b) => b.count - a.count).slice(0, 3)
        return (
          <div style={{ width: '100%', maxWidth: '760px', marginTop: '28px' }} className="slide-up stagger-8">
            <div className="section-frame">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>psychology</span>
                <h3 className="heading-section" style={{ margin: 0 }}>Your Research Memory</h3>
              </div>
            </div>
            <div className="card" style={{ padding: '18px 22px' }}>
              {mem.specialization && (
                <div style={{ marginBottom: '14px' }}>
                  <span className="badge-green" style={{ fontSize: '10px' }}>Specialization: {mem.specialization}</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                {topTopics.map(t => (
                  <Link key={t.topic} href={`/research?q=${encodeURIComponent(t.relatedQueries[0] || t.topic)}`} style={{ textDecoration: 'none', flex: '1 1 180px' }}>
                    <div style={{ padding: '12px', borderRadius: '10px', transition: 'background 0.15s', border: '1px solid var(--border-section)' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: '500', color: '#1A2F23', marginBottom: '4px' }}>{t.topic}</p>
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
      <div style={{ width: '100%', maxWidth: '760px', marginTop: '40px', textAlign: 'center' }} className="slide-up stagger-8">
        <div className="rule-line" style={{ marginBottom: '20px' }} />
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'var(--text-faint)', lineHeight: '1.7' }}>
          Verdant is an Environmental Intelligence Authority. Every claim is source-traced. Every recommendation is evidence-backed.
          <br />Powered by a network of 8 specialized environmental AI agents.
        </p>
        <Link href="/protocol" style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: 'var(--green-mid)', textDecoration: 'none', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'inline-block', marginTop: '8px' }}>
          Read the Verdant Protocol →
        </Link>
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
