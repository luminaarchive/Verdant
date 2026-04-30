'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/verdant/AppLayout'

const filters = ['Recommended', 'Trending', 'New Papers', 'By Region']

const allCards = [
  { label: "EDITOR'S PICK", labelColor: '#B45309', tag: 'Recommended', title: 'Deep Ocean Vents and Extremophile Evolution', body: 'Newly discovered extremophiles mapped near the Mariana Trench reveal unexpected biochemistry.', papers: '3 New Papers', query: 'Deep Ocean Vents Extremophile Evolution' },
  { label: 'NEW RESEARCH',  labelColor: '#2E5D3E', tag: 'New Papers',  title: 'Borneo Peatland Carbon Stocks Reassessed',    body: 'Updated satellite imagery reveals underestimated carbon reserves in Indonesian peatlands.', papers: '5 New Papers', query: 'Borneo Peatland Carbon Stocks' },
  { label: 'REGIONAL',      labelColor: '#1D4ED8', tag: 'By Region',   title: 'Wallace Line Biodiversity Gradient Study',    body: 'New genomic data challenges existing species distribution models along the Wallace Line.', papers: '12 New Papers', query: 'Wallace Line Biodiversity Gradient' },
  { label: 'TRENDING',      labelColor: '#6D28D9', tag: 'Trending',    title: 'Global Soil Depletion: Silent Crisis',        body: 'Recent studies reveal a 15% increase in topsoil erosion rates across equatorial farming belts.', papers: '7 New Papers', query: 'Global Soil Depletion Crisis' },
  { label: 'ARCHIVE',       labelColor: '#737870', tag: 'Recommended', title: 'KITLV Colonial Natural History Records',      body: 'Digitized Dutch colonial botanical surveys from 1880–1920 now fully indexed.', papers: 'Historical', query: 'KITLV Colonial Natural History Records' },
  { label: 'NEW RESEARCH',  labelColor: '#2E5D3E', tag: 'Trending',    title: 'Coral Triangle Thermal Stress Events',       body: 'Accelerating bleaching events correlated with ENSO intensity over the past decade.', papers: '9 New Papers', query: 'Coral Triangle Thermal Stress' },
]

export default function DiscoverPage() {
  const [activeFilter, setActiveFilter] = useState('Recommended')

  const filteredCards = activeFilter === 'Recommended'
    ? allCards
    : allCards.filter(c => c.tag === activeFilter)

  return (
    <AppLayout>
      <div style={{ padding: '36px 32px 60px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '34px', fontWeight: '400', color: '#1A2F23', marginBottom: '6px' }}>Discover</h1>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Explore verified research streams and emerging ecological trends.
          </p>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
            {filters.map(f => {
              const active = f === activeFilter
              return (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{
                    background: active ? '#1A2F23' : '#FFFFFF',
                    color: active ? '#FFFFFF' : 'var(--text-secondary)',
                    border: active ? '1px solid #1A2F23' : '1px solid var(--border-strong)',
                    borderRadius: '20px',
                    padding: '6px 16px',
                    fontSize: '13px',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: active ? '600' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.borderColor = '#1A2F23'; (e.currentTarget as HTMLElement).style.color = '#1A2F23' } }}
                  onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)' } }}
                >
                  {f}
                </button>
              )
            })}
          </div>

          {/* Featured Banner */}
          <Link href="/research?q=Global+Soil+Depletion+Crisis" style={{ textDecoration: 'none', display: 'block', marginBottom: '20px' }}>
            <div
              className="card card-lift"
              style={{
                padding: '28px 32px',
                display: 'flex',
                gap: '28px',
                alignItems: 'stretch',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
            >
              <div style={{ flex: '0 0 65%', minWidth: 0 }}>
                <p style={{ fontSize: '10px', fontFamily: "'Inter', system-ui, sans-serif", textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--green-mid)', fontWeight: '600', marginBottom: '10px' }}>TRENDING</p>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '400', color: '#1A2F23', lineHeight: '1.3', marginBottom: '12px' }}>Global Soil Depletion: The Silent Crisis Beneath Our Feet</h2>
                <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>Recent studies reveal a 15% increase in topsoil erosion rates across equatorial farming belts, threatening global food security.</p>
                <span style={{ fontSize: '12.5px', fontFamily: "'Inter', system-ui, sans-serif", color: '#1A2F23', textDecoration: 'none', fontWeight: '600', letterSpacing: '0.03em' }}>Begin Research →</span>
              </div>
              <div style={{ flex: 1, background: 'linear-gradient(135deg, #D1FAE5 0%, #1A2F23 100%)', borderRadius: '10px', minHeight: '140px' }} />
            </div>
          </Link>

          {/* Grid */}
          {filteredCards.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontSize: '14px' }}>
              No results for this filter. Try another category.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px', paddingBottom: '24px' }}>
              {filteredCards.map(card => (
                <Link key={card.title} href={`/research?q=${encodeURIComponent(card.query)}`} style={{ textDecoration: 'none' }}>
                  <div
                    className="card card-lift"
                    style={{ padding: '22px', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}
                  >
                    <p style={{ fontSize: '10px', fontFamily: "'Inter', system-ui, sans-serif", textTransform: 'uppercase', letterSpacing: '0.1em', color: card.labelColor, fontWeight: '600', marginBottom: '10px' }}>{card.label}</p>
                    <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: '400', color: '#1A2F23', lineHeight: '1.4', marginBottom: '10px', flex: 1 }}>{card.title}</h3>
                    <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>{card.body}</p>
                    <span style={{ fontSize: '11.5px', background: 'rgba(26,47,35,0.07)', color: 'var(--green-mid)', borderRadius: '10px', padding: '3px 10px', alignSelf: 'flex-start', fontFamily: "'Inter', sans-serif", fontWeight: '500' }}>{card.papers}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
