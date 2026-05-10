'use client'

import React from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'

const PRINCIPLES = [
  {
    id: 'no-hallucination',
    title: 'No Hallucination Doctrine',
    icon: 'shield',
    body: 'Every claim must be traceable to a verifiable source. If Verdant cannot substantiate a statement, it will say so explicitly. We do not generate plausible-sounding falsehoods. The absence of an answer is always preferable to a fabricated one.',
  },
  {
    id: 'evidence-first',
    title: 'Evidence-First Architecture',
    icon: 'science',
    body: 'Our intelligence pipeline begins with evidence, not hypotheses. Each research thread starts by gathering verifiable data points from authoritative environmental monitoring systems before any synthesis or analysis takes place. Data leads. Narrative follows.',
  },
  {
    id: 'contradiction-before-confidence',
    title: 'Contradiction Before Confidence',
    icon: 'compare',
    body: 'We actively search for disagreement in the scientific literature. Every research report includes a Contradiction Index — a measure of scientific consensus and dissent. High confidence without examined contradiction is intellectual negligence.',
  },
  {
    id: 'truth-over-fluency',
    title: 'Truth > Fluency',
    icon: 'gavel',
    body: 'We will never sacrifice accuracy for readability. If environmental data is uncertain, our language reflects that uncertainty. Hedged claims are stated as hedged. Preliminary findings are marked as preliminary. The reader always knows the epistemic status of what they are reading.',
  },
  {
    id: 'environmental-sovereignty',
    title: 'Environmental Sovereignty',
    icon: 'public',
    body: 'Environmental intelligence should not be locked behind paywalls or institutional access barriers. Critical ecosystem data — species threat status, deforestation alerts, climate thresholds — is a matter of planetary survival. We believe access to this information is a right, not a privilege.',
  },
  {
    id: 'multi-agent-rigor',
    title: 'Multi-Agent Verification',
    icon: 'hub',
    body: 'No single AI model produces our reports. Verdant deploys a network of 8 specialized environmental agents — each with distinct expertise in marine biology, climate science, policy analysis, and more. These agents cross-verify each other, creating a system of checks that no single-model architecture can match.',
  },
  {
    id: 'living-intelligence',
    title: 'Living Intelligence',
    icon: 'update',
    body: 'Environmental conditions change by the hour. A research report from last week may already be outdated. Verdant reports are living documents — they track changes in underlying data, flag new evidence, and alert you when confidence levels shift. Static PDFs are artifacts of a slower world.',
  },
  {
    id: 'source-transparency',
    title: 'Radical Source Transparency',
    icon: 'visibility',
    body: 'Every source we cite is rated for reliability. We distinguish between peer-reviewed research (A+), government monitoring data (A), institutional reports (B), and unverified sources (C). You always know the quality of the evidence behind our conclusions.',
  },
]

export default function ProtocolPage() {
  return (
    <AppLayout>
      <div style={{ padding: '48px 32px 80px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }} className="slide-up">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '20px' }}>
              <div style={{ height: '1px', width: '40px', background: 'linear-gradient(90deg, transparent, var(--border-strong))' }} />
              <span className="label-system" style={{ color: 'var(--green-mid)', letterSpacing: '0.14em' }}>How Verdant Thinks</span>
              <div style={{ height: '1px', width: '40px', background: 'linear-gradient(90deg, var(--border-strong), transparent)' }} />
            </div>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '48px', fontWeight: '400', color: '#1A2F23', letterSpacing: '-2px', lineHeight: '1.05', marginBottom: '18px' }}>
              The Verdant Protocol
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.7', maxWidth: '520px', margin: '0 auto' }}>
              The principles that govern how Verdant gathers, verifies, and delivers environmental intelligence. These are not guidelines — they are constraints.
            </p>
          </div>

          {/* Version Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px' }} className="slide-up stagger-1">
            <div className="protocol-stamp">
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--green-mid)' }}>verified</span>
              <div>
                <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Verdant Intelligence Protocol v3.2</span>
                <span style={{ display: 'block', fontSize: '10px', marginTop: '2px' }}>Last updated May 2026 · 8-agent architecture</span>
              </div>
            </div>
          </div>

          {/* Principles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {PRINCIPLES.map((p, i) => (
              <div key={p.id} className="slide-up" style={{ animationDelay: `${0.1 + i * 0.05}s` }}>
                <div style={{ display: 'flex', gap: '20px', padding: '28px 0', borderTop: i === 0 ? '1px solid var(--border)' : 'none', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flexShrink: 0, width: '44px', textAlign: 'center' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '12px',
                      background: 'rgba(209,250,229,0.2)',
                      border: '1px solid rgba(46,93,62,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--green-mid)' }}>{p.icon}</span>
                    </div>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '9px', color: 'var(--text-faint)', display: 'block', marginTop: '6px', fontWeight: '600' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '20px', fontWeight: '400', color: '#1A2F23', marginBottom: '10px', letterSpacing: '-0.3px' }}>
                      {p.title}
                    </h3>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.75' }}>
                      {p.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Closing */}
          <div style={{ textAlign: 'center', marginTop: '56px' }} className="slide-up stagger-8">
            <div className="rule-line" style={{ marginBottom: '28px' }} />
            <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '22px', color: '#1A2F23', lineHeight: '1.4', marginBottom: '16px', letterSpacing: '-0.3px' }}>
              Environmental intelligence is not a product.<br />
              It is an obligation.
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.7', maxWidth: '480px', margin: '0 auto 28px' }}>
              The state of the planet cannot wait for peer review cycles or policy committee schedules. Verdant exists to make the world&apos;s environmental knowledge accessible, verifiable, and actionable — now.
            </p>
            <Link
              href="/"
              className="btn btn-primary"
              style={{ textDecoration: 'none', display: 'inline-flex' }}
            >
              Begin Researching →
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
