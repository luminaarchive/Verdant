'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Sidebar } from '@/components/verdant/Sidebar'
import { TopBar } from '@/components/verdant/TopBar'
import { SearchBox } from '@/components/verdant/SearchBox'

// ─── Category content map ─────────────────────────────────────────────────────
const categoryContent: Record<string, {
  featured: { title: string; desc: string }
  cards: { icon: string; title: string; desc: string }[]
}> = {
  all: {
    featured: {
      title: 'The Intelligence of Slime Molds',
      desc: 'Recent studies suggest Physarum polycephalum can solve mazes and anticipate periodic events without a central nervous system.',
    },
    cards: [
      { icon: 'thermostat', title: 'Climate modeling', desc: 'Predictive patterns for equatorial flora.' },
      { icon: 'landscape', title: 'Javanese land-use', desc: 'Historical agricultural shifts in the region.' },
      { icon: 'menu_book', title: 'Dutch records', desc: 'Colonial botanical archives analysis.' },
    ],
  },
  ecology: {
    featured: {
      title: 'The Intelligence of Slime Molds',
      desc: 'Recent studies suggest Physarum polycephalum can solve mazes and anticipate periodic events without a central nervous system.',
    },
    cards: [
      { icon: 'hub', title: 'Mycorrhizal Networks', desc: 'Underground fungal communication systems.' },
      { icon: 'co2', title: 'Forest Carbon', desc: 'Carbon sequestration dynamics in tropical biomes.' },
      { icon: 'diversity_3', title: 'Biodiversity Hotspots', desc: 'Critical zones of endemism under threat.' },
    ],
  },
  biodiversity: {
    featured: {
      title: 'Species Distribution Modeling',
      desc: 'Machine learning approaches to predict habitat ranges using climate envelope models and citizen science datasets.',
    },
    cards: [
      { icon: 'dataset', title: 'GBIF Data Analysis', desc: 'Global occurrence records and gap analysis.' },
      { icon: 'format_list_bulleted', title: 'Red List Updates', desc: 'IUCN threat assessments for 2024.' },
      { icon: 'broken_image', title: 'Habitat Fragmentation', desc: 'Corridor connectivity and edge effects.' },
    ],
  },
  botany: {
    featured: {
      title: 'Javanese Land-use: Historical Agricultural Shifts',
      desc: 'Dutch colonial land surveys reveal dramatic transformations from mixed agroforestry to monoculture across Java from 1850–1950.',
    },
    cards: [
      { icon: 'menu_book', title: 'Dutch Records', desc: 'Colonial land registers and botanical surveys.' },
      { icon: 'archive', title: 'Colonial Botanical Archives', desc: 'Herbarium specimens and field notes digitized.' },
      { icon: 'article', title: 'Reinwardtia Journal', desc: 'Historical taxonomy publications from Bogor.' },
    ],
  },
  mycology: {
    featured: {
      title: 'Mycorrhizal Symbiosis Networks',
      desc: 'New tracer studies quantify phosphorus and carbon exchange rates between ectomycorrhizal fungi and old-growth host trees.',
    },
    cards: [
      { icon: 'hub', title: 'Fungal Networks', desc: 'Wood wide web architecture and topology.' },
      { icon: 'compost', title: 'Soil Microbiome', desc: 'Bacterial-fungal community assemblages.' },
      { icon: 'forest', title: 'Canopy Dynamics', desc: 'Light partitioning and understory competition.' },
    ],
  },
  geology: {
    featured: {
      title: 'Tectonic History of the Sunda Arc',
      desc: 'New geochronological data refines the subduction chronology of the Indo-Australian plate beneath the Eurasian plate margin.',
    },
    cards: [
      { icon: 'terrain', title: 'Volcanic Soil Composition', desc: 'Andosol fertility and mineralogy profiles.' },
      { icon: 'map', title: 'Mineral Mapping', desc: 'Remote sensing of metallogeny in Kalimantan.' },
      { icon: 'graphic_eq', title: 'Seismic Patterns', desc: 'Hazard modeling along the Sumatran fault.' },
    ],
  },
  oceanography: {
    featured: {
      title: 'Coral Reef Dynamics in the Coral Triangle',
      desc: 'Decadal bleaching records show accelerating thermal stress events correlated with ENSO intensity and warming baseline temperatures.',
    },
    cards: [
      { icon: 'thermostat', title: 'Sea Surface Temperature', desc: 'MODIS SST trends over the Banda Sea.' },
      { icon: 'water_drop', title: 'Ocean Acidification', desc: 'pH decline rates in carbonate-rich ecosystems.' },
      { icon: 'diversity_3', title: 'Marine Biodiversity', desc: 'Fish assemblage surveys in reef corridors.' },
    ],
  },
}

// ─── Inner component — uses useSearchParams, must live inside <Suspense> ──────
function HomeContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')?.toLowerCase() ?? 'all'
  const content = categoryContent[categoryParam] ?? categoryContent['all']

  return (
    <main style={{
      flex: 1,
      overflowY: 'auto',
      padding: '48px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Hero */}
      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '48px' }}>
        <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', lineHeight: '1.4', color: '#747871', marginBottom: '8px' }}>Good morning, Naturalist.</p>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '40px', fontWeight: '400', letterSpacing: '-1px', lineHeight: '1.2', color: '#1A2E1A', marginBottom: '4px' }}>verdant</h2>
        <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '15px', lineHeight: '1.6', color: '#747871' }}>Ask anything academic...</p>
      </div>

      <SearchBox />

      {/* Suggested Pathways */}
      <div style={{ width: '100%', maxWidth: '660px' }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#747871' }}>auto_awesome</span>
          <h3 style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', fontWeight: '500', color: '#747871', letterSpacing: '0.02em' }}>Suggested Pathways</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {/* Featured — col-span-2 */}
          <Link
            href={`/research?q=${encodeURIComponent(content.featured.title)}`}
            style={{
              gridColumn: 'span 2',
              background: '#F5F2EB',
              border: '1px solid rgba(45,74,45,0.12)',
              borderRadius: '4px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              transition: 'border-color 0.15s',
              textDecoration: 'none',
            }}
            className="group"
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#1A2E1A'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(45,74,45,0.12)'}
          >
            <div style={{ position: 'absolute', right: 0, top: 0, width: '33%', height: '100%', background: 'linear-gradient(to left, rgba(229,226,219,0.3), transparent)' }} />
            <div>
              <span style={{ fontSize: '11px', fontFamily: 'system-ui, sans-serif', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#747871', display: 'block', marginBottom: '8px' }}>Featured Study</span>
              <h4 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '400', color: '#1A2E1A', marginBottom: '12px', lineHeight: '1.3' }}>{content.featured.title}</h4>
              <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#434841', maxWidth: '400px', lineHeight: '1.5' }}>{content.featured.desc}</p>
            </div>
            <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontFamily: 'system-ui, sans-serif', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1A2E1A', borderBottom: '1px solid #1A2E1A', paddingBottom: '2px' }}>Begin Research</span>
              <span className="material-symbols-outlined" style={{ color: '#747871', fontSize: '20px' }}>arrow_forward</span>
            </div>
          </Link>

          <PathwayCard icon={content.cards[0].icon} title={content.cards[0].title} desc={content.cards[0].desc} query={content.cards[0].title} />
          <PathwayCard icon={content.cards[1].icon} title={content.cards[1].title} desc={content.cards[1].desc} query={content.cards[1].title} />
          <PathwayCard icon={content.cards[2].icon} title={content.cards[2].title} desc={content.cards[2].desc} query={content.cards[2].title} />
          <PathwayCard icon="terrain" title="Mining impact" desc="Ecological degradation metrics." query="Mining Impact and Ecological Degradation" />
        </div>
      </div>
    </main>
  )
}

// ─── Page shell — stable, prerender-safe ─────────────────────────────────────
export default function VerdantHome() {
  return (
    <div style={{ background: '#FAFAF7', color: '#1b1c1a', display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <TopBar />
        <Suspense fallback={
          <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#747871' }}>Loading...</p>
          </main>
        }>
          <HomeContent />
        </Suspense>
      </div>
    </div>
  )
}

function PathwayCard({ icon, title, desc, query }: { icon: string; title: string; desc: string; query: string }) {
  return (
    <Link
      href={`/research?q=${encodeURIComponent(query)}`}
      style={{
        background: '#F5F2EB',
        border: '1px solid rgba(45,74,45,0.12)',
        borderRadius: '4px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
        textDecoration: 'none',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#1A2E1A'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(45,74,45,0.12)'}
    >
      <span className="material-symbols-outlined" style={{ color: '#747871', marginBottom: '8px', fontSize: '22px' }}>{icon}</span>
      <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '15px', fontWeight: '500', color: '#1b1c1a', marginBottom: '4px' }}>{title}</span>
      <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#747871', lineHeight: '1.4' }}>{desc}</span>
    </Link>
  )
}
