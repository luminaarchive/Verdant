'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

export function OnboardingModal() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    setMounted(true)
    const hasOnboarded = localStorage.getItem('verdant_onboarded')
    if (!hasOnboarded) {
      setIsOpen(true)
    }
  }, [])

  if (!mounted || !isOpen) return null

  const handleComplete = () => {
    if (!agreed) return
    localStorage.setItem('verdant_onboarded', 'true')
    setIsOpen(false)
  }

  const handleGuidedExample = () => {
    if (!agreed) return
    localStorage.setItem('verdant_onboarded', 'true')
    setIsOpen(false)
    router.push('/research?q=coral+reef+collapse+risk+in+Indonesia&mode=deep')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,47,35,0.4)', backdropFilter: 'blur(4px)' }}>
      <div className="card-premium" style={{ width: '100%', maxWidth: '520px', padding: '0', overflow: 'hidden', animation: 'slideUp 0.3s ease-out' }}>
        
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1A2F23, #2E5D3E)', padding: '32px 32px 24px', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#34D399' }}>verified_user</span>
            <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#34D399' }}>Verdant Intelligence Protocol</span>
          </div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', marginBottom: '8px', fontWeight: '400' }}>
            {step === 1 ? 'Welcome to Verdant' : 'Protocol Agreement'}
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
            {step === 1 
              ? 'The institution-grade environmental intelligence operating system.'
              : 'Please acknowledge our operating principles before proceeding.'}
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {step === 1 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(52,211,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--green-dark)' }}>bolt</span>
                </div>
                <div>
                  <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: '600', color: '#1A2F23', marginBottom: '4px' }}>Fast Answers</h4>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>Quick decision briefs using real-time global monitoring data.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(52,211,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--green-dark)' }}>travel_explore</span>
                </div>
                <div>
                  <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: '600', color: '#1A2F23', marginBottom: '4px' }}>Deep Research</h4>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>Consulting-grade research synthesizing multiple scientific sources.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(52,211,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--green-dark)' }}>library_books</span>
                </div>
                <div>
                  <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: '600', color: '#1A2F23', marginBottom: '4px' }}>Journal-Grade Analysis</h4>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>Comprehensive institutional reports with contradiction resolution.</p>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', fontFamily: "'Inter', sans-serif", color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li>Verdant provides evidence-based intelligence, not legal or financial advice.</li>
                  <li>Critical decisions must be verified independently.</li>
                  <li>Do not use Verdant to falsify scientific evidence or claims.</li>
                  <li>The system enforces strict zero-hallucination policies.</li>
                </ul>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '4px' }}>
                <input 
                  type="checkbox" 
                  checked={agreed} 
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--green-dark)' }}
                />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#1A2F23', fontWeight: '500' }}>
                  I understand and agree to the operating principles
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 32px', background: 'var(--bg-main)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {step === 1 ? (
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <button onClick={() => setStep(2)} className="btn w-full btn-primary" style={{ height: '40px' }}>
                Continue
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <button 
                onClick={handleGuidedExample} 
                disabled={!agreed}
                className="btn w-full" 
                style={{ background: 'transparent', border: '1px solid var(--border)', color: agreed ? 'var(--text-main)' : 'var(--text-muted)', height: '40px' }}
              >
                Start Guided Example
              </button>
              <button 
                onClick={handleComplete} 
                disabled={!agreed}
                className="btn btn-primary w-full" 
                style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                Enter Verdant <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
