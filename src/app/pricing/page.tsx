'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/verdant/AppLayout'
import { useToast } from '@/components/verdant/Toast'
import { Check, Shield, Zap, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const PLANS = [
  {
    id: 'seeds',
    name: 'Seeds',
    description: 'For curious researchers exploring the basics.',
    price: '$0',
    features: [
      'Focus Research Mode (Unlimited)',
      'Deep Research Mode (3/day)',
      'Basic Journal Storage',
      'Standard Export (PDF)',
    ],
    cta: 'Current Plan',
    highlight: false,
  },
  {
    id: 'sapling',
    name: 'Sapling',
    description: 'For professionals needing deeper intelligence.',
    price: '$12',
    period: '/mo',
    features: [
      'Everything in Seeds',
      'Analytica Mode (Unlimited)',
      'Evidence Integrity Scoring',
      'Scientific Disagreement Radar',
      'Priority Research Pipeline',
    ],
    cta: 'Upgrade to Sapling',
    highlight: true,
  },
  {
    id: 'forest_keeper',
    name: 'Forest Keeper',
    description: 'For institutions and high-stakes research.',
    price: '$29',
    period: '/mo',
    features: [
      'Everything in Sapling',
      'Multi-Model Consensus',
      'Infinite Environmental Memory',
      'API Access (Beta)',
      'Dedicated Support',
    ],
    cta: 'Join the Forest',
    highlight: false,
  },
]

export default function PricingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = React.useState<string | null>(null)
  const [currentTier, setCurrentTier] = React.useState('seeds')

  React.useEffect(() => {
    const supabase = createClient()
    if (!supabase) return
    supabase.auth.getUser().then(({ data: { user } }: any) => {
      if (user) {
        supabase.from('user_profiles').select('subscription_tier').eq('id', user.id).single()
          .then(({ data }: any) => {
            if (data) setCurrentTier(data.subscription_tier || 'seeds')
          })
      }
    }).catch(() => {})
  }, [])

  const handleUpgrade = async (planId: string) => {
    if (planId === currentTier) return
    setLoading(planId)
    
    try {
      const supabase = createClient()
      if (!supabase) {
        router.push(`/auth?redirect=/pricing`)
        return
      }
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push(`/auth?redirect=/pricing`)
        return
      }

      // Minimal P1 Monetization: Mock update for demonstration
      // In production, this would redirect to Stripe
      const { error } = await supabase.from('user_profiles').update({ 
        subscription_tier: planId 
      }).eq('id', user.id)

      if (error) throw error
      
      setCurrentTier(planId)
      toast(`Welcome to the ${planId.replace('_', ' ')} tier!`, { icon: 'verified' })
      setTimeout(() => router.push('/profile'), 1500)
    } catch (err) {
      toast('Upgrade failed. Please try again.', { type: 'error' })
    } finally {
      setLoading(null)
    }
  }

  return (
    <AppLayout>
      <div style={{ padding: '60px 24px 80px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }} className="slide-up">
          <h1 className="heading-display" style={{ fontSize: '48px', marginBottom: '12px' }}>
            Elevate Your Research
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Choose the plan that fits your environmental intelligence needs. Join a community of researchers committed to zero-hallucination accuracy.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {PLANS.map((plan, i) => (
            <div 
              key={plan.id}
              className={`card-premium slide-up stagger-${i + 1}`}
              style={{ 
                padding: '40px 32px', 
                display: 'flex', 
                flexDirection: 'column', 
                position: 'relative',
                borderColor: plan.highlight ? 'var(--green-dark)' : 'var(--border)',
                boxShadow: plan.highlight ? '0 20px 40px rgba(26,47,35,0.08)' : 'none',
                transform: plan.highlight ? 'scale(1.02)' : 'none',
                zIndex: plan.highlight ? 1 : 0
              }}
            >
              {plan.highlight && (
                <span style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--green-dark)', color: '#FFFFFF', fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Recommended
                </span>
              )}
              
              <h2 className="heading-card" style={{ fontSize: '24px', marginBottom: '8px' }}>{plan.name}</h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', height: '40px' }}>{plan.description}</p>
              
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '32px' }}>
                <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: '48px', color: '#1A2F23' }}>{plan.price}</span>
                {plan.period && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'var(--text-muted)' }}>{plan.period}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '40px', flex: 1 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <Check size={16} style={{ color: 'var(--green-mid)', flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13.5px', color: 'var(--text-secondary)' }}>{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={!!loading || currentTier === plan.id}
                className={plan.highlight ? 'btn btn-primary' : 'btn btn-ghost'}
                style={{ 
                  width: '100%', 
                  height: '48px', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  background: currentTier === plan.id ? 'var(--bg-elevated)' : (plan.highlight ? '#1A2F23' : 'transparent'),
                  color: currentTier === plan.id ? 'var(--text-muted)' : (plan.highlight ? '#FFFFFF' : '#1A2F23'),
                  borderColor: currentTier === plan.id ? 'var(--border)' : '#1A2F23'
                }}
              >
                {loading === plan.id ? 'Processing...' : (currentTier === plan.id ? 'Current Plan' : plan.cta)}
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }} className="slide-up">
          <div style={{ textAlign: 'center' }}>
            <Shield size={24} style={{ color: 'var(--green-mid)', marginBottom: '12px' }} />
            <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: '600', color: '#1A2F23', marginBottom: '8px' }}>Secure Research</h3>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>Your research data is encrypted and never sold to third parties.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Zap size={24} style={{ color: 'var(--green-mid)', marginBottom: '12px' }} />
            <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: '600', color: '#1A2F23', marginBottom: '8px' }}>Lightning Fast</h3>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>Proprietary pre-processing ensures results in seconds, not minutes.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Globe size={24} style={{ color: 'var(--green-mid)', marginBottom: '12px' }} />
            <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: '600', color: '#1A2F23', marginBottom: '8px' }}>Global Coverage</h3>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>Access academic archives from institutions across every continent.</p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
