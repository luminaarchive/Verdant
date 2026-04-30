'use client'

import React, { use, useEffect, useState } from 'react'
import Link from 'next/link'

interface ShareResult {
  title: string
  executiveSummary: string
  findings: string[]
  sources: { title: string; url?: string; author?: string; year?: string }[]
  confidenceScore: number
  query: string
  createdAt: string
}

export default function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [result, setResult] = useState<ShareResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchShare() {
      try {
        const res = await fetch(`/api/research?shareToken=${token}`)
        const data = await res.json()
        if (data.ok) {
          setResult(data)
        } else {
          setError(data.message ?? 'Share link expired or not found')
        }
      } catch {
        setError('Failed to load shared report')
      } finally {
        setLoading(false)
      }
    }
    fetchShare()
  }, [token])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9F8F4', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <p style={{ color: '#737870', fontSize: '14px' }}>Loading shared report...</p>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F9F8F4', fontFamily: "'Inter', system-ui, sans-serif", gap: '16px', padding: '24px', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(192,57,43,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '28px', color: '#C0392B' }}>⚠</span>
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', color: '#1A2F23' }}>Link Expired or Invalid</h1>
        <p style={{ fontSize: '14px', color: '#737870', maxWidth: '400px' }}>{error}</p>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', background: '#1A2F23', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '500', marginTop: '8px' }}>
          Go to Verdant
        </Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9F8F4', padding: '48px 24px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#1A2F23', letterSpacing: '-0.3px' }}>verdant</span>
          <span style={{ fontSize: '10px', background: 'rgba(209,250,229,0.5)', color: '#1A2F23', padding: '2px 8px', borderRadius: '10px', fontFamily: "'Inter', sans-serif", fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Shared Report</span>
        </div>

        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '400', color: '#1A2F23', marginBottom: '8px', lineHeight: '1.3' }}>{result.title}</h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#737870', marginBottom: '28px' }}>
          Confidence: {result.confidenceScore}/100 · Generated {new Date(result.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>

        {/* Summary */}
        <div style={{ background: '#fff', border: '1px solid rgba(26,47,35,0.1)', borderRadius: '8px', padding: '24px', marginBottom: '16px' }}>
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#737870', fontWeight: '600', marginBottom: '12px', fontFamily: "'Inter', sans-serif" }}>Executive Summary</p>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', lineHeight: '1.8', color: '#1A2F23' }}>{result.executiveSummary}</p>
        </div>

        {/* Findings */}
        {result.findings.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid rgba(26,47,35,0.1)', borderRadius: '8px', padding: '24px', marginBottom: '16px' }}>
            <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#737870', fontWeight: '600', marginBottom: '12px', fontFamily: "'Inter', sans-serif" }}>Key Findings</p>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              {result.findings.map((f, i) => (
                <li key={i} style={{ fontFamily: "'Inter', sans-serif", fontSize: '13.5px', lineHeight: '1.65', color: '#434841', marginBottom: '8px' }}>{f}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Sources */}
        {result.sources.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid rgba(26,47,35,0.1)', borderRadius: '8px', padding: '24px', marginBottom: '16px' }}>
            <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#737870', fontWeight: '600', marginBottom: '12px', fontFamily: "'Inter', sans-serif" }}>Sources</p>
            {result.sources.map((s, i) => (
              <p key={i} style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#434841', marginBottom: '6px' }}>
                [{i + 1}] {s.title}{s.author ? ` · ${s.author}` : ''}{s.year ? ` · ${s.year}` : ''}
              </p>
            ))}
          </div>
        )}

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Link href={`/research?q=${encodeURIComponent(result.query)}`} style={{ display: 'inline-flex', alignItems: 'center', background: '#1A2F23', color: '#fff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '500', fontFamily: "'Inter', sans-serif" }}>
            Run This Research on Verdant
          </Link>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: '#737870', marginTop: '12px' }}>
            Powered by <a href="https://verdantai.vercel.app" style={{ color: '#2E5D3E', textDecoration: 'none' }}>Verdant AI</a>
          </p>
        </div>
      </div>
    </div>
  )
}
