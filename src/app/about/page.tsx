'use client'

import React from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/verdant/AppLayout'
import { Leaf, Globe, BookOpen, Users } from 'lucide-react'
import { VERDANT_AGENTS, AGENT_NETWORK_DESCRIPTION } from '@/lib/intelligence/agents'

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

          {/* EOS Vision */}
          <div className="card" style={{ padding: '36px', marginBottom: '20px', background: 'linear-gradient(135deg, rgba(26,47,35,0.04) 0%, rgba(209,250,229,0.2) 50%, #FFFFFF 100%)', borderLeft: '3px solid #1A2F23' }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: '700', color: 'var(--green-mid)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>Earth Operating System</p>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '400', color: '#1A2F23', lineHeight: '1.5', marginBottom: '16px' }}>
              Verdant is infrastructure for environmental intelligence — a decision-grade operating system for understanding, protecting, and restoring the natural world.
            </p>
            <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
              We are building the intelligence layer that governments, researchers, NGOs, and conservation organizations need to make evidence-based decisions at the speed the environmental crisis demands. Not another AI chatbot — an Environmental Intelligence Authority.
            </p>
          </div>

          {/* Scientific Sovereign AI */}
          <div className="card" style={{ padding: '28px', marginBottom: '20px' }}>
            <p className="section-label">Scientific Sovereign AI</p>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '400', color: '#1A2F23', lineHeight: '1.6', marginBottom: '12px' }}>
              Built from Indonesia. Built for the world.
            </p>
            <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
              Verdant is one of the first environmental AI systems developed with deep Southeast Asian ecological context — from Indonesian peatland dynamics to Coral Triangle biodiversity. We prioritize local scientific authority and indigenous ecological knowledge alongside global research infrastructure. Environmental intelligence should not be imported — it should be sovereign.
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

          {/* Agent Network */}
          <div className="card" style={{ padding: '28px', marginBottom: '20px' }}>
            <p className="section-label">Autonomous Research Agent Network</p>
            <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '20px' }}>
              {AGENT_NETWORK_DESCRIPTION}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {VERDANT_AGENTS.map(agent => (
                <div key={agent.id} style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-main)', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,47,35,0.2)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--green-mid)' }}>{agent.icon}</span>
                    <div>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12.5px', fontWeight: '600', color: '#1A2F23' }}>{agent.name}</p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '10.5px', color: 'var(--text-muted)' }}>{agent.domain}</p>
                    </div>
                  </div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '10px' }}>{agent.description}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {agent.sources.map(s => (
                      <span key={s} style={{ fontFamily: "'Inter', sans-serif", fontSize: '9.5px', background: 'rgba(209,250,229,0.4)', color: '#1A2F23', padding: '2px 7px', borderRadius: '8px' }}>{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Sources */}
          <div className="card" style={{ padding: '28px', marginBottom: '20px' }}>
            <p className="section-label">Data Sources</p>
            <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
              Verdant&apos;s AI pipeline is trained to synthesize from authoritative scientific sources:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['GBIF', 'IUCN Red List', 'NOAA', 'FAO', 'KLHK', 'arXiv', 'PubMed', 'KITLV', 'Nature', 'Science', 'IPCC', 'CBD', 'UNEP', 'Copernicus', 'Global Forest Watch'].map(src => (
                <span key={src} className="badge badge-green" style={{ fontSize: '12px', padding: '4px 10px' }}>{src}</span>
              ))}
            </div>
          </div>

          {/* Coming Soon */}
          <div className="card" style={{ padding: '24px', marginBottom: '20px', borderLeft: '3px solid #B8860B' }}>
            <p className="section-label" style={{ color: '#B8860B' }}>Coming Soon</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {[
                { icon: 'map', label: 'Global Environmental Map Layer', desc: 'Geographic intelligence overlays' },
                { icon: 'groups', label: 'Institutional Workspaces', desc: 'Team-based research environments' },
                { icon: 'share', label: 'Collaborative Intelligence', desc: 'Shared reports and team review' },
                { icon: 'verified_user', label: 'Trust Recovery Protocol', desc: 'Automated correction flows' },
                { icon: 'auto_awesome', label: 'Policy Simulation Engine', desc: 'Predict intervention outcomes' },
                { icon: 'hub', label: 'Open Nature Network', desc: 'Community research contributions' },
              ].map(f => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#B8860B', flexShrink: 0, marginTop: '2px' }}>{f.icon}</span>
                  <div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: '500', color: '#1A2F23', marginBottom: '2px' }}>{f.label}</p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'var(--text-muted)' }}>{f.desc}</p>
                  </div>
                </div>
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
