'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/components/verdant/AppLayout'
import { SearchBox } from '@/components/verdant/SearchBox'
import { ArrowRight } from 'lucide-react'

// ─── Category content map ─────────────────────────────────────────────────────
const categoryContent: Record<string, {
  featured: { title: string; desc: string; tag: string }
  cards: { icon: string; title: string; desc: string }[]
}> = {
  all: {
    featured: {
      title: 'The Intelligence of Slime Molds',
      desc: 'Recent studies suggest Physarum polycephalum can solve mazes and anticipate periodic events without a central nervous system.',
      tag: 'Editor\'s Pick',
    },
    cards: [
      { icon: 'thermostat', title: 'Climate Modeling', desc: 'Predictive patterns for equatorial flora shifts.' },
      { icon: 'landscape',  title: 'Javanese Land-use', desc: 'Historical agricultural transformations.' },
      { icon: 'menu_book',  title: 'Dutch Colonial Records', desc: 'Botanical archive cross-referenced with KITLV.' },
      { icon: 'terrain',    title: 'Mining Impact', desc: 'Ecological degradation metrics in Kalimantan.' },
    ],
  },
  ecology: {
    featured: {
      title: 'The Intelligence of Slime Molds',
      desc: 'Recent studies suggest Physarum polycephalum can solve mazes and anticipate periodic events without a central nervous system.',
      tag: 'Trending',
    },
    cards: [
      { icon: 'hub',        title: 'Mycorrhizal Networks', desc: 'Underground fungal communication systems.' },
      { icon: 'co2',        title: 'Forest Carbon',        desc: 'Carbon sequestration in tropical biomes.' },
      { icon: 'diversity_3',title: 'Biodiversity Hotspots',desc: 'Critical zones of endemism under threat.' },
      { icon: 'compost',    title: 'Soil Microbiome',      desc: 'Bacterial-fungal community assemblages.' },
    ],
  },
  biodiversity: {
    featured: {
      title: 'Species Distribution Modeling',
      desc: 'Machine learning approaches to predict habitat ranges using climate envelope models and citizen science datasets.',
      tag: 'New Research',
    },
    cards: [
      { icon: 'dataset',    title: 'GBIF Data Analysis',    desc: 'Global occurrence records and gap analysis.' },
      { icon: 'format_list_bulleted', title: 'IUCN Red List', desc: 'Threat assessments updated for 2024.' },
      { icon: 'broken_image',title: 'Habitat Fragmentation', desc: 'Corridor connectivity and edge effects.' },
      { icon: 'biotech',    title: 'Genomic Diversity',     desc: 'Population genetics and endemism patterns.' },
    ],
  },
  botany: {
    featured: {
      title: 'Javanese Land-use: Historical Agricultural Shifts',
      desc: 'Dutch colonial surveys reveal dramatic transformations from mixed agroforestry to monoculture across Java from 1850–1950.',
      tag: 'Historical',
    },
    cards: [
      { icon: 'menu_book',  title: 'Dutch Records',         desc: 'Colonial land registers and botanical surveys.' },
      { icon: 'archive',    title: 'Herbarium Archives',    desc: 'Digitized specimens and field notes.' },
      { icon: 'article',    title: 'Reinwardtia Journal',   desc: 'Historical taxonomy from Bogor, 1950–2024.' },
      { icon: 'forest',     title: 'Canopy Dynamics',       desc: 'Light partitioning and understory competition.' },
    ],
  },
  mycology: {
    featured: {
      title: 'Mycorrhizal Symbiosis Networks',
      desc: 'New tracer studies quantify phosphorus and carbon exchange rates between ectomycorrhizal fungi and old-growth host trees.',
      tag: 'Breakthrough',
    },
    cards: [
      { icon: 'hub',        title: 'Fungal Networks',       desc: 'Wood wide web architecture and topology.' },
      { icon: 'compost',    title: 'Soil Microbiome',       desc: 'Bacterial-fungal community assemblages.' },
      { icon: 'forest',     title: 'Canopy Dynamics',       desc: 'Light partitioning in understory.' },
      { icon: 'science',    title: 'Spore Dispersal',       desc: 'Wind and vector-based dispersal modeling.' },
    ],
  },
  geology: {
    featured: {
      title: 'Tectonic History of the Sunda Arc',
      desc: 'New geochronological data refines the subduction chronology of the Indo-Australian plate beneath the Eurasian plate margin.',
      tag: 'Peer Reviewed',
    },
    cards: [
      { icon: 'terrain',    title: 'Volcanic Soil',         desc: 'Andosol fertility and mineralogy profiles.' },
      { icon: 'map',        title: 'Mineral Mapping',       desc: 'Remote sensing of metallogeny in Kalimantan.' },
      { icon: 'graphic_eq', title: 'Seismic Patterns',      desc: 'Hazard modeling along the Sumatran fault.' },
      { icon: 'layers',     title: 'Stratigraphic Analysis', desc: 'Rock formation and sediment dating.' },
    ],
  },
  oceanography: {
    featured: {
      title: 'Coral Reef Dynamics in the Coral Triangle',
      desc: 'Decadal bleaching records show accelerating thermal stress events correlated with ENSO intensity and warming baseline temperatures.',
      tag: 'Climate Alert',
    },
    cards: [
      { icon: 'thermostat', title: 'Sea Surface Temperature', desc: 'MODIS SST trends over the Banda Sea.' },
      { icon: 'water_drop', title: 'Ocean Acidification',    desc: 'pH decline rates in carbonate ecosystems.' },
      { icon: 'diversity_3',title: 'Marine Biodiversity',    desc: 'Fish assemblage surveys in reef corridors.' },
      { icon: 'waves',      title: 'Current Patterns',       desc: 'Upwelling zones and nutrient cycling.' },
    ],
  },
}

function PathwayCard({ icon, title, desc, query }: { icon: string; title: string; desc: string; query: string }) {
  return (
    <Link
      href={`/research?q=${encodeURIComponent(query)}`}
      className="card card-lift"
      style={{
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        textDecoration: 'none',
        minHeight: '120px',
      }}
    >
      <span
        className="material-symbols-outlined"
        style={{ color: 'var(--text-muted)', marginBottom: '10px', fontSize: '20px' }}
      >
        {icon}
      </span>
      <span
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: '14px',
          fontWeight: '600',
          color: 'var(--text-main)',
          marginBottom: '5px',
          lineHeight: '1.3',
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: '12.5px',
          color: 'var(--text-muted)',
          lineHeight: '1.5',
        }}
      >
        {desc}
      </span>
    </Link>
  )
}

function HomeContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')?.toLowerCase() ?? 'all'
  const content = categoryContent[categoryParam] ?? categoryContent['all']

  return (
    <div
      style={{
        padding: '40px 32px 48px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100%',
      }}
    >
      {/* Hero */}
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '32px',
        }}
        className="fade-up"
      >
        <p
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: '12.5px',
            color: 'var(--text-muted)',
            marginBottom: '12px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontWeight: '500',
          }}
        >
          Good morning, Naturalist
        </p>
        <h2
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '42px',
            fontWeight: '400',
            letterSpacing: '-1.5px',
            lineHeight: '1.1',
            color: '#1A2F23',
            marginBottom: '10px',
          }}
        >
          verdant
        </h2>
        <p
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: '15px',
            lineHeight: '1.6',
            color: 'var(--text-muted)',
            maxWidth: '480px',
          }}
        >
          Ask anything academic about ecology, biodiversity, and the natural world.
        </p>
      </div>

      {/* Search Box */}
      <div style={{ width: '100%', maxWidth: '680px', marginBottom: '48px' }} className="fade-up">
        <SearchBox autoFocus />
      </div>

      {/* Suggested Pathways */}
      <div style={{ width: '100%', maxWidth: '760px' }} className="fade-up">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--text-muted)' }}>auto_awesome</span>
            <h3
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Suggested Pathways
            </h3>
          </div>
          <Link
            href="/discover"
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: '12.5px',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#1A2F23'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
          >
            See all <ArrowRight size={13} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {/* Featured — spans full width on small, 2 cols on large */}
          <Link
            href={`/research?q=${encodeURIComponent(content.featured.title)}`}
            className="card card-lift"
            style={{
              gridColumn: 'span 2',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              textDecoration: 'none',
              minHeight: '180px',
            }}
          >
            <div
              style={{
                position: 'absolute',
                right: 0, top: 0,
                width: '35%', height: '100%',
                background: 'linear-gradient(to left, rgba(241,240,236,0.6), transparent)',
                pointerEvents: 'none',
              }}
            />
            <div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: '10px',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#1A2F23',
                  background: 'rgba(209,250,229,0.5)',
                  border: '1px solid rgba(26,47,35,0.15)',
                  borderRadius: '20px',
                  padding: '2px 8px',
                  marginBottom: '14px',
                }}
              >
                {content.featured.tag}
              </span>
              <h4
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '22px',
                  fontWeight: '400',
                  color: '#1A2F23',
                  marginBottom: '12px',
                  lineHeight: '1.3',
                  maxWidth: '500px',
                }}
              >
                {content.featured.title}
              </h4>
              <p
                style={{
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: '13.5px',
                  color: 'var(--text-secondary)',
                  maxWidth: '420px',
                  lineHeight: '1.6',
                }}
              >
                {content.featured.desc}
              </p>
            </div>
            <div
              style={{
                marginTop: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontFamily: "'Inter', system-ui, sans-serif",
                fontWeight: '600',
                color: '#1A2F23',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Begin Research <ArrowRight size={14} />
            </div>
          </Link>

          {content.cards.map(card => (
            <PathwayCard
              key={card.title}
              icon={card.icon}
              title={card.title}
              desc={card.desc}
              query={card.title}
            />
          ))}
        </div>
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
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-muted)' }}>
              Loading...
            </p>
          </div>
        }
      >
        <HomeContent />
      </Suspense>
    </AppLayout>
  )
}
