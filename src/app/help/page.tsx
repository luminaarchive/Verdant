'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/verdant/AppLayout'
import { ChevronDown, ChevronUp } from 'lucide-react'

const faqs = [
  {
    q: 'How does Verdant work?',
    a: 'Verdant uses an AI research pipeline connected to an n8n workflow that queries multiple scientific databases and synthesizes findings into structured reports. You simply type your research question, choose a mode (Focus, Deep, or Analytica), and the system returns organized findings with citations.',
  },
  {
    q: 'What research modes are available?',
    a: 'Focus Mode provides fast, concise analysis. Deep Research performs thorough multi-source synthesis for complex topics. Analytica generates statistical and data-heavy structured output. Choose your mode in the search box or in Settings.',
  },
  {
    q: 'What topics does Verdant cover?',
    a: 'Verdant specializes in environmental science: Ecology, Biodiversity, Botany, Mycology, Geology, and Oceanography. It draws from authoritative sources including GBIF, IUCN Red List, NOAA, FAO, arXiv, PubMed, and KITLV archives.',
  },
  {
    q: 'How do I save my research?',
    a: 'After running a research query, you\'ll see a "Save" button at the top of the results. This saves the analysis to your Journal (stored locally in your browser). Access saved entries any time from the Journal page in the sidebar.',
  },
  {
    q: 'What are Spaces?',
    a: 'Spaces are collections that help you organize related research threads. For example, you might create a "Coral Reef Dynamics" Space to group all your research about reef ecosystems. Click "New Space" on the Spaces page to create one.',
  },
  {
    q: 'How does the streak system work?',
    a: 'Your research streak tracks how many consecutive days you\'ve used Verdant. Each research session counts as daily activity. Maintain your streak to grow your virtual Sapling — visible in the sidebar.',
  },
  {
    q: 'Why is the analysis slow sometimes?',
    a: 'Deep Research and Analytica modes involve querying multiple data sources and synthesizing complex information. Analyses may take up to 60 seconds for thorough results. A progress indicator keeps you informed.',
  },
  {
    q: 'Can I export my research?',
    a: 'You can copy the research page link using the "Copy Link" button. Journal entries can be accessed at any time. Full PDF export is on our roadmap for a future update.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="card"
      style={{ padding: '0', overflow: 'hidden', transition: 'box-shadow 0.2s ease' }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: '18px 22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
      >
        <span style={{ fontFamily: 'Georgia, serif', fontSize: '15.5px', color: '#1A2F23', lineHeight: '1.4' }}>{q}</span>
        {open
          ? <ChevronUp size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          : <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        }
      </button>
      {open && (
        <div style={{ padding: '0 22px 18px', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.7', paddingTop: '16px' }}>{a}</p>
        </div>
      )}
    </div>
  )
}

export default function HelpPage() {
  return (
    <AppLayout>
      <div style={{ padding: '36px 32px 80px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '34px', fontWeight: '400', color: '#1A2F23', marginBottom: '6px' }}>Help Center</h1>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>
            Frequently asked questions about Verdant.
          </p>

          {/* Quick actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '36px' }}>
            {[
              { label: 'Start a Research', href: '/', icon: 'search' },
              { label: 'View Journal', href: '/journal', icon: 'menu_book' },
              { label: 'Manage Spaces', href: '/spaces', icon: 'folder_open' },
              { label: 'Account Settings', href: '/settings', icon: 'settings' },
            ].map(a => (
              <Link
                key={a.label}
                href={a.href}
                style={{ textDecoration: 'none' }}
              >
                <div
                  className="card"
                  style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(209,250,229,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#1A2F23' }}>{a.icon}</span>
                  </div>
                  <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', fontWeight: '500', color: '#1A2F23' }}>{a.label}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* FAQs */}
          <p className="section-label" style={{ marginBottom: '16px' }}>Frequently Asked Questions</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {faqs.map(f => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>

          {/* Contact footer */}
          <div className="card" style={{ padding: '24px', marginTop: '28px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#1A2F23', marginBottom: '8px' }}>Still have questions?</p>
            <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Contact us at{' '}
              <a href="mailto:support@verdantai.app" style={{ color: 'var(--green-mid)', textDecoration: 'none' }}>support@verdantai.app</a>
            </p>
            <Link href="/about" style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}>
              Learn more about Verdant →
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
