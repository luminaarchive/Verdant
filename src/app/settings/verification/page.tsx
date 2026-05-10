'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { useToast } from '@/components/ui/Toast'
import { ShieldCheck, Upload, AlertCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@/services/supabase/client'
import { submitVerificationRequest } from '@/features/reputation/verification'

export default function VerificationSettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<string | null>(null)
  
  const [institutionName, setInstitutionName] = useState('')
  const [institutionEmail, setInstitutionEmail] = useState('')
  const [orcidId, setOrcidId] = useState('')
  const [documentsUrl, setDocumentsUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadStatus() {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      // Check verification request status
      const { data: req } = await sb
        .from('verification_requests')
        .select('status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (req) {
        setStatus(req.status)
      }
      setLoading(false)
    }
    loadStatus()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const result = await submitVerificationRequest({
        institutionName,
        institutionEmail,
        orcidId,
        documentsUrl
      })

      if (result.success) {
        toast('Verification request submitted', { type: 'success' })
        setStatus('pending')
      } else {
        toast(result.error || 'Failed to submit request', { type: 'error' })
      }
    } catch {
      toast('An unexpected error occurred', { type: 'error' })
    }
    setSubmitting(false)
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg-elevated)',
    fontFamily: "'Inter', system-ui, sans-serif", fontSize: '14px', color: 'var(--text-main)',
    outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box' as const,
  }

  return (
    <AppLayout>
      <div style={{ padding: '36px 32px 60px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }} className="slide-up">
            <h1 className="heading-page" style={{ marginBottom: '8px' }}>Institutional Verification</h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'var(--text-muted)' }}>
              Apply for the "Verified Institutional Researcher" badge to increase your reputation score and unlock publishing features.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-muted)' }}>Loading status...</p>
            </div>
          ) : status === 'approved' ? (
            <div className="card-premium slide-up stagger-1" style={{ padding: '32px', textAlign: 'center', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <ShieldCheck size={48} style={{ color: '#10B981', margin: '0 auto 16px' }} />
              <h2 className="heading-card" style={{ fontSize: '20px', color: 'var(--text-main)', marginBottom: '8px' }}>You are Verified</h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'var(--text-secondary)' }}>
                Your institutional researcher status is active. Your public reports now display the verified badge, and your base reputation score has been upgraded.
              </p>
            </div>
          ) : status === 'pending' ? (
            <div className="card-premium slide-up stagger-1" style={{ padding: '32px', textAlign: 'center', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <AlertCircle size={48} style={{ color: '#F59E0B', margin: '0 auto 16px' }} />
              <h2 className="heading-card" style={{ fontSize: '20px', color: 'var(--text-main)', marginBottom: '8px' }}>Verification Pending</h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'var(--text-secondary)' }}>
                Our team is currently reviewing your institutional credentials. This process typically takes 1-2 business days.
              </p>
            </div>
          ) : (
            <div className="card-premium slide-up stagger-1" style={{ padding: '32px' }}>
              {status === 'rejected' && (
                <div style={{ padding: '16px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', marginBottom: '24px' }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#EF4444', margin: 0 }}>
                    <strong>Your previous application was declined.</strong> Please ensure you provide a valid institutional email and correct ORCID ID.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Institution Name</label>
                  <input
                    type="text"
                    required
                    value={institutionName}
                    onChange={e => setInstitutionName(e.target.value)}
                    placeholder="e.g. Stanford University, WWF"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Institutional Email</label>
                  <input
                    type="email"
                    required
                    value={institutionEmail}
                    onChange={e => setInstitutionEmail(e.target.value)}
                    placeholder="e.g. yourname@stanford.edu"
                    style={inputStyle}
                  />
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Must end in .edu, .org, .gov, or a known institution domain.</p>
                </div>

                <div>
                  <label style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>ORCID iD (Optional)</label>
                  <input
                    type="text"
                    value={orcidId}
                    onChange={e => setOrcidId(e.target.value)}
                    placeholder="e.g. 0000-0001-2345-6789"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Supporting Documents URL (Optional)</label>
                  <input
                    type="url"
                    value={documentsUrl}
                    onChange={e => setDocumentsUrl(e.target.value)}
                    placeholder="Link to your faculty page, LinkedIn, or publications"
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginTop: '12px' }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{ width: '100%', height: '44px', opacity: submitting ? 0.7 : 1 }}
                  >
                    {submitting ? 'Submitting Application...' : 'Submit Verification Request'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
