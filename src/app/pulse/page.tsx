'use client'

import React from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'
import { getPlanetPulse, DIRECTION_COLORS } from '@/features/intelligence/pulse'
import { getWorldNatureIndex, TREND_LABELS } from '@/features/intelligence/nature-index'

export default function PulsePage() {
  const pulse = getPlanetPulse()
  const indices = getWorldNatureIndex()

  return (
    <AppLayout>
      <div style={{ padding: '36px 32px 60px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }} className="slide-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--green-mid)' }}>satellite_alt</span>
              <h1 className="heading-page">Planet Pulse</h1>
            </div>
            <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '14px', color: 'var(--text-muted)', maxWidth: '560px' }}>
              Real-time environmental signals from authoritative monitoring systems. The state of the planet, at a glance.
            </p>
          </div>

          {/* Live Metrics */}
          <div style={{ marginBottom: '36px' }} className="slide-up stagger-1">
            <div className="section-frame">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>vital_signs</span>
                <h3 className="heading-section" style={{ margin: 0 }}>Environmental Vital Signs</h3>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {pulse.map(p => (
                <Link key={p.id} href={`/research?q=${encodeURIComponent(p.metric + ' ' + p.region + ' current status analysis')}`} style={{ textDecoration: 'none' }}>
                  <div className="card-premium" style={{ padding: '18px', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1A2F23'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(26,47,35,0.06)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = ''; (e.currentTarget as HTMLElement).style.boxShadow = '' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: DIRECTION_COLORS[p.direction] }}>{p.icon}</span>
                      <span className="label-system">{p.metric}</span>
                    </div>
                    <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '32px', color: '#1A2F23', lineHeight: '1', marginBottom: '6px' }}>
                      {p.value}<span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-muted)', marginLeft: '4px' }}>{p.unit}</span>
                    </p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11.5px', color: DIRECTION_COLORS[p.direction], fontWeight: '600', marginBottom: '8px' }}>{p.change}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: 'var(--text-muted)' }}>{p.source}</span>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: 'var(--text-muted)' }}>{p.region}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Nature Index */}
          <div style={{ marginBottom: '36px' }} className="slide-up stagger-2">
            <div className="section-frame">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>public</span>
                <h3 className="heading-section" style={{ margin: 0 }}>Verdant Nature Index</h3>
              </div>
            </div>
            <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
              Proprietary environmental indices computed from global monitoring data. Each index aggregates multiple indicators into a single actionable score.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {indices.map(idx => (
                <Link key={idx.id} href={`/research?q=${encodeURIComponent(idx.name + ' detailed analysis')}`} style={{ textDecoration: 'none' }}>
                  <div className="card-premium" style={{ padding: '20px', display: 'flex', gap: '20px', alignItems: 'center', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#1A2F23'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = ''}
                  >
                    <div style={{ flexShrink: 0, width: '64px', textAlign: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '22px', color: idx.color, display: 'block', marginBottom: '4px' }}>{idx.icon}</span>
                      <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '32px', color: idx.color, lineHeight: '1' }}>{idx.score}</p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px', color: 'var(--text-muted)' }}>/{idx.maxScore}</p>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <p className="heading-card" style={{ fontSize: '18px', color: '#1A2F23' }}>{idx.name}</p>
                        <span className="label-system" style={{ color: idx.color }}>{TREND_LABELS[idx.trend]}</span>
                      </div>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '8px' }}>{idx.description}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'rgba(26,47,35,0.08)' }}>
                          <div style={{ width: `${(idx.score / idx.maxScore) * 100}%`, height: '100%', borderRadius: '2px', background: idx.color }} />
                        </div>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', color: 'var(--text-muted)' }}>Change: {idx.change > 0 ? '+' : ''}{idx.change}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Signal Forecasting */}
          <div className="card-premium slide-up stagger-3" style={{ padding: '24px', marginBottom: '20px' }}>
            <p className="heading-card" style={{ fontSize: '18px', marginBottom: '16px' }}>Nature Signal Forecasting</p>
            <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
              Projected environmental signals based on current trajectories and historical patterns.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { signal: 'Arctic ice minimum likely to set new record low by September 2026', confidence: 78, icon: 'ac_unit', color: '#1D4ED8' },
                { signal: 'Coral Triangle mass bleaching event probable within 6 months', confidence: 65, icon: 'scuba_diving', color: '#C0392B' },
                { signal: 'Amazon fire season expected to be 15-20% above 10-year average', confidence: 72, icon: 'local_fire_department', color: '#B45309' },
                { signal: 'Southeast Asian peatland emissions likely to exceed 2024 levels', confidence: 58, icon: 'cloud', color: '#7C3AED' },
                { signal: 'Global insect biomass decline expected to accelerate in agricultural zones', confidence: 61, icon: 'pest_control', color: '#92400E' },
              ].map((f, i) => (
                <Link key={i} href={`/research?q=${encodeURIComponent(f.signal)}`} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '8px', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: f.color }}>{f.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#1A2F23', lineHeight: '1.4' }}>{f.signal}</p>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '20px', color: f.color }}>{f.confidence}%</p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Confidence</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Conservation Opportunity Radar */}
          <div className="card-premium slide-up stagger-4" style={{ padding: '24px' }}>
            <p className="heading-card" style={{ fontSize: '18px', marginBottom: '16px' }}>Conservation Opportunity Radar</p>
            <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
              High-leverage intervention opportunities detected from current environmental intelligence.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { opportunity: 'Kalimantan peat restoration: 2.1M hectares newly available under KLHK decree', impact: 'Very High', icon: 'eco', region: 'Indonesia' },
                { opportunity: 'Mekong giant catfish breeding program expandable to 5 additional sites', impact: 'High', icon: 'water_drop', region: 'Thailand' },
                { opportunity: 'EU Nature Restoration Law creates €4.2B funding corridor for wetland projects', impact: 'Very High', icon: 'gavel', region: 'Europe' },
                { opportunity: 'Community-managed marine areas in Coral Triangle showing 3x recovery rates', impact: 'High', icon: 'scuba_diving', region: 'Indo-Pacific' },
              ].map((o, i) => (
                <Link key={i} href={`/research?q=${encodeURIComponent(o.opportunity + ' analysis')}`} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(46,93,62,0.1)', background: 'rgba(209,250,229,0.08)', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#2E5D3E'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(46,93,62,0.1)'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2E5D3E' }}>{o.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#1A2F23', lineHeight: '1.4', marginBottom: '2px' }}>{o.opportunity}</p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '10.5px', color: 'var(--text-muted)' }}>{o.region}</p>
                    </div>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: '600', color: '#2E5D3E', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>{o.impact}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
