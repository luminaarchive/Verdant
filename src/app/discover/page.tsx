'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Sidebar } from '@/components/verdant/Sidebar'
import { TopBar } from '@/components/verdant/TopBar'

const filters = ['Recommended', 'Trending', 'New Papers', 'By Region']

const gridCards = [
  { label: "EDITOR'S PICK", labelColor: '#C49A3A', title: 'Deep Ocean Vents and Extremophile Evolution', body: 'Newly discovered extremophiles mapped near the Mariana Trench.', papers: '3 New Papers' },
  { label: 'NEW RESEARCH',  labelColor: '#3D6B3D', title: 'Borneo Peatland Carbon Stocks Reassessed',    body: 'Updated satellite imagery reveals underestimated carbon reserves.', papers: '5 New Papers' },
  { label: 'REGIONAL',      labelColor: '#6B8FAF', title: 'Wallace Line Biodiversity Gradient Study',    body: 'New genomic data challenges existing species distribution models.', papers: '12 New Papers' },
  { label: 'ARCHIVE',       labelColor: '#8A9288', title: 'KITLV Colonial Natural History Records',      body: 'Digitized Dutch colonial botanical surveys now fully indexed.', papers: 'Historical' },
]

export default function DiscoverPage() {
  const [activeFilter, setActiveFilter] = useState('Recommended')
  return (
    <div style={{ background: '#FAFAF7', display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '400', color: '#1A2E1A', marginBottom: '6px' }}>Discover</h1>
            <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#8A9288', marginBottom: '20px' }}>Explore verified research streams and emerging ecological trends.</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              {filters.map((f) => {
                const active = f === activeFilter
                return (
                  <button key={f} onClick={() => setActiveFilter(f)} style={{ background: active ? '#1A2E1A' : '#F5F2EB', color: active ? '#F5F2EB' : '#4A5248', border: active ? 'none' : '1px solid rgba(45,74,45,0.2)', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', fontFamily: 'system-ui, sans-serif', cursor: 'pointer' }}>
                    {f}
                  </button>
                )
              })}
            </div>
            <Link href="/research?q=Global+Soil+Depletion" style={{ textDecoration: 'none' }}>
              <div style={{ background: '#F5F2EB', border: '1px solid rgba(45,74,45,0.15)', borderRadius: '12px', padding: '24px', display: 'flex', gap: '24px', marginBottom: '16px', transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#1A2E1A'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(45,74,45,0.15)'}
              >
                <div style={{ flex: '0 0 70%' }}>
                  <p style={{ fontSize: '10px', fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#7AAF6A', fontWeight: '500', marginBottom: '8px' }}>TRENDING</p>
                  <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '400', color: '#1A2E1A', lineHeight: '1.35', marginBottom: '12px' }}>Global Soil Depletion: The Silent Crisis Beneath Our Feet</h2>
                  <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#4A5248', lineHeight: '1.6', marginBottom: '20px' }}>Recent studies reveal a 15% increase in topsoil erosion rates across equatorial farming belts.</p>
                  <span style={{ fontSize: '13px', fontFamily: 'system-ui, sans-serif', color: '#3D6B3D', textDecoration: 'none', fontWeight: '500' }}>Begin Research →</span>
                </div>
                <div style={{ flex: '0 0 30%', background: 'linear-gradient(135deg, #A8C99A, #3D6B3D)', borderRadius: '8px', minHeight: '120px' }} />
              </div>
            </Link>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingBottom: '32px' }}>
              {gridCards.map((card) => (
                <Link key={card.title} href={`/research?q=${encodeURIComponent(card.title)}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#F5F2EB', border: '1px solid rgba(45,74,45,0.12)', borderRadius: '10px', padding: '20px', cursor: 'pointer', height: '100%', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#1A2E1A'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(45,74,45,0.12)'}
                  >
                    <p style={{ fontSize: '10px', fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase', letterSpacing: '0.8px', color: card.labelColor, fontWeight: '500', marginBottom: '8px' }}>{card.label}</p>
                    <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: '400', color: '#1A2E1A', lineHeight: '1.4', marginBottom: '8px' }}>{card.title}</h3>
                    <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#4A5248', lineHeight: '1.5', marginBottom: '14px' }}>{card.body}</p>
                    <span style={{ fontSize: '12px', background: 'rgba(45,74,45,0.08)', color: '#3D6B3D', borderRadius: '10px', padding: '4px 10px' }}>{card.papers}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
