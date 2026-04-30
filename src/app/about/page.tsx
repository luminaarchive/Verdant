'use client'

import React from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/verdant/AppLayout'
import { Leaf, Globe, BookOpen, Users } from 'lucide-react'

const pillars = [
  { icon: Leaf, title: 'Environmental Focus', desc: 'Built specifically for ecology, biodiversity, geology, and oceanography research — not a generic AI.' },
  { icon: Globe, title: 'Global Archives', desc: 'Cross-references GBIF, IUCN Red List, NOAA, FAO, KITLV, arXiv, and PubMed in every analysis.' },
  { icon: BookOpen, title: 'Academic Rigor', desc: 'Every result includes sources, citations, and structured findings — not vague summaries.' },
  { icon: Users, title: 'Researcher-First', desc: 'Designed for environmental researchers, ecologists, and academics who need depth, not breadth.' },
]

export default function AboutPage() {
  return (
    <AppLayout>
      <div style={{ padding: '36px 32px 80px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          {/* Hero */}
          <div style={{ marginBottom: '56px' }}>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '40px', fontWeight: '400', color: '#1A2F23', lineHeight: '1.2', marginBottom: '16px', letterSpacing: '-0.5px' }}>
              About Verdant
            </h1>
            <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.7', maxWidth: '600px' }}>
              Verdant is an AI-powered environmental research platform built for depth, accuracy, and academic rigor. We believe the natural world deserves better tools for understanding it.
            </p>
          </div>

          {/* Mission */}
          <div className="card" style={{ padding: '32px', marginBottom: '20px', background: 'linear-gradient(135deg, rgba(209,250,229,0.3) 0%, #FFFFFF 60%)' }}>
            <p className="section-label">Our Mission</p>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '400', color: '#1A2F23', lineHeight: '1.6' }}>
              To make environmental knowledge accessible, verifiable, and actionable — connecting researchers, students, and conservationists with the data they need to protect our planet.
            </p>
          </div>

          {/* Pillars */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px', marginBottom: '40px' }}>
            {pillars.map(p => {
              const Icon = p.icon
              return (
                <div key={p.title} className="card" style={{ padding: '24px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(209,250,229,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                    <Icon size={20} strokeWidth={1.5} style={{ color: '#1A2F23' }} />
                  </div>
                  <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#1A2F23', marginBottom: '8px' }}>{p.title}</h3>
                  <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{p.desc}</p>
                </div>
              )
            })}
          </div>

          {/* Data Sources */}
          <div className="card" style={{ padding: '28px', marginBottom: '20px' }}>
            <p className="section-label">Data Sources</p>
            <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
              Verdant&apos;s AI pipeline is trained to synthesize from authoritative scientific sources:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['GBIF', 'IUCN Red List', 'NOAA', 'FAO', 'KLHK', 'arXiv', 'PubMed', 'KITLV', 'Nature', 'Science'].map(src => (
                <span key={src} className="badge badge-green" style={{ fontSize: '12px', padding: '4px 10px' }}>{src}</span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              Start Researching
            </Link>
            <Link href="/help" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
              View Help Center
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
