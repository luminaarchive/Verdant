'use client'

import React, { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'

export function PaywallModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [source, setSource] = useState<string>('')

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent
      setSource(customEvent.detail?.source || '')
      setIsOpen(true)
    }
    
    window.addEventListener('verdant_paywall_open', handleOpen)
    return () => window.removeEventListener('verdant_paywall_open', handleOpen)
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,47,35,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="card-premium" style={{ width: '100%', maxWidth: '800px', padding: '0', overflow: 'hidden', animation: 'slideUp 0.3s ease-out' }}>
        
        {/* Header */}
        <div style={{ padding: '32px 32px 24px', background: 'var(--bg-main)', borderBottom: '1px solid var(--border)', position: 'relative' }}>
          <button 
            onClick={() => setIsOpen(false)}
            style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--green-mid)' }}>workspace_premium</span>
            <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green-mid)' }}>Verdant Premium</span>
          </div>
          
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', marginBottom: '8px', fontWeight: '400', color: '#1A2F23' }}>
            {source === 'analytica' ? 'Unlock Analytica & Unlimited Research' : 'Upgrade your intelligence infrastructure'}
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '500px' }}>
            {source === 'analytica' 
              ? 'You have reached the limit for free Analytica queries. Upgrade to continue generating institutional-grade reports.'
              : 'Deploy the full power of Verdant\'s 8-agent network for your institutional research needs.'}
          </p>
        </div>

        {/* Tiers */}
        <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', background: 'var(--bg-surface)' }}>
          
          {/* Free Tier */}
          <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>Observer</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '16px' }}>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#1A2F23' }}>$0</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'var(--text-muted)' }}>/mo</span>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: 0, padding: 0, listStyle: 'none', flex: 1, marginBottom: '24px' }}>
              <li style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}><Check size={14} style={{ color: 'var(--green-mid)', flexShrink: 0, marginTop: '2px' }} /> 3 Deep Researches/mo</li>
              <li style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}><Check size={14} style={{ color: 'var(--green-mid)', flexShrink: 0, marginTop: '2px' }} /> 1 Active Watchlist</li>
              <li style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}><span style={{ width: '14px', height: '1px', background: 'var(--text-muted)', marginTop: '8px', flexShrink: 0 }} /> No Analytica Reports</li>
            </ul>
            <button className="btn w-full" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'default' }}>Current Plan</button>
          </div>

          {/* Pro Tier */}
          <div style={{ background: '#1A2F23', border: '1px solid #2E5D3E', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 10px', background: 'var(--green-mid)', color: '#1A2F23', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottomLeftRadius: '8px' }}>Most Popular</div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>Analyst</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '16px' }}>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#FFFFFF' }}>$49</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>/mo</span>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: 0, padding: 0, listStyle: 'none', flex: 1, marginBottom: '24px' }}>
              <li style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.9)', fontFamily: "'Inter', sans-serif" }}><Check size={14} style={{ color: '#34D399', flexShrink: 0, marginTop: '2px' }} /> Unlimited Deep Research</li>
              <li style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.9)', fontFamily: "'Inter', sans-serif" }}><Check size={14} style={{ color: '#34D399', flexShrink: 0, marginTop: '2px' }} /> 10 Analytica Reports/mo</li>
              <li style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.9)', fontFamily: "'Inter', sans-serif" }}><Check size={14} style={{ color: '#34D399', flexShrink: 0, marginTop: '2px' }} /> 15 Watchlists</li>
              <li style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.9)', fontFamily: "'Inter', sans-serif" }}><Check size={14} style={{ color: '#34D399', flexShrink: 0, marginTop: '2px' }} /> Custom Evidence Weights</li>
            </ul>
            <button className="btn w-full" style={{ background: '#34D399', border: 'none', color: '#1A2F23', fontWeight: '600' }}>Upgrade to Analyst</button>
          </div>

          {/* Institutional Tier */}
          <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>Partner</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '16px' }}>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#1A2F23' }}>Custom</span>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: 0, padding: 0, listStyle: 'none', flex: 1, marginBottom: '24px' }}>
              <li style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}><Check size={14} style={{ color: 'var(--green-mid)', flexShrink: 0, marginTop: '2px' }} /> Unlimited Analytica Reports</li>
              <li style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}><Check size={14} style={{ color: 'var(--green-mid)', flexShrink: 0, marginTop: '2px' }} /> API Access</li>
              <li style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}><Check size={14} style={{ color: 'var(--green-mid)', flexShrink: 0, marginTop: '2px' }} /> Private Knowledge Base Integration</li>
              <li style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', fontFamily: "'Inter', sans-serif" }}><Check size={14} style={{ color: 'var(--green-mid)', flexShrink: 0, marginTop: '2px' }} /> Dedicated Intelligence Agent</li>
            </ul>
            <button className="btn w-full" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)' }}>Contact Sales</button>
          </div>

        </div>
      </div>
    </div>
  )
}
