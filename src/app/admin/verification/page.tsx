'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/verdant/AppLayout'
import { useToast } from '@/components/verdant/Toast'
import { CheckCircle, XCircle, ExternalLink, Clock, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface VerificationRequest {
  id: string
  user_id: string
  status: 'pending' | 'approved' | 'rejected'
  institution_name: string
  institution_email: string
  orcid_id: string | null
  documents_url: string | null
  created_at: string
  user: {
    display_name: string | null
    email: string
  } | null
}

export default function AdminVerificationPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function loadRequests() {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      // Check if user is admin (simplified check: email domain or specific email)
      // In a real app, this should be a role check in the DB
      if (user.email !== 'admin@verdantai.com' && !user.email?.endsWith('@verdantai.com')) {
        toast('Unauthorized access', { type: 'error' })
        router.push('/')
        return
      }

      setIsAdmin(true)

      // Fetch pending requests
      const { data, error } = await sb
        .from('verification_requests')
        .select(`
          *,
          user_profiles!user_id ( display_name )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

      if (data && !error) {
        const formattedData = data.map((d: any) => ({
          ...d,
          user: {
            display_name: d.user_profiles?.display_name || 'Unknown',
            email: 'hidden@email.com' // Not directly available without auth admin privileges
          }
        }))
        setRequests(formattedData)
      }
      setLoading(false)
    }
    loadRequests()
  }, [router, toast])

  const handleReview = async (id: string, userId: string, action: 'approved' | 'rejected') => {
    try {
      const sb = createClient()
      
      // Update request status
      const { error: reqError } = await sb
        .from('verification_requests')
        .update({
          status: action,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await sb.auth.getUser()).data.user?.id
        })
        .eq('id', id)

      if (reqError) throw reqError

      // If approved, update user profile and reputation
      if (action === 'approved') {
        const { error: profError } = await sb
          .from('public_profiles')
          .update({ verified_status: 'approved' })
          .eq('user_id', userId)
          
        if (profError) throw profError

        // Give a reputation boost for being verified
        // In a full implementation, we would call the recalculate API
        const { data: rep } = await sb
          .from('user_reputation_scores')
          .select('score')
          .eq('user_id', userId)
          .single()

        if (rep) {
          await sb
            .from('user_reputation_scores')
            .update({ score: rep.score + 25, rank: 'Verified Analyst' })
            .eq('user_id', userId)
        }
      }

      toast(`Request ${action}`, { type: 'success' })
      setRequests(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      toast('Failed to update request', { type: 'error' })
    }
  }

  return (
    <AppLayout>
      <div style={{ padding: '36px 32px 60px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="slide-up">
            <div>
              <h1 className="heading-page" style={{ marginBottom: '8px' }}>Admin / Verification Review</h1>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'var(--text-muted)' }}>
                Review institutional credentials and approve verification badges.
              </p>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-muted)' }}>Loading requests...</p>
            </div>
          ) : !isAdmin ? null : requests.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-elevated)', border: '1px dashed var(--border-strong)' }}>
              <ShieldCheck size={32} style={{ color: 'var(--green-mid)', marginBottom: '16px', opacity: 0.5 }} />
              <p style={{ fontSize: '15px', color: 'var(--text-main)', marginBottom: '8px' }}>No Pending Requests</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>All verification applications have been reviewed.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {requests.map(req => (
                <div key={req.id} className="card-premium slide-up" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h3 className="heading-card" style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '4px' }}>
                        {req.user?.display_name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <Clock size={12} />
                        Submitted {new Date(req.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="badge badge-yellow" style={{ fontSize: '11px', textTransform: 'uppercase' }}>{req.status}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Institution</p>
                      <p style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '500' }}>{req.institution_name}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Email</p>
                      <p style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '500' }}>{req.institution_email}</p>
                    </div>
                    {req.orcid_id && (
                      <div>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>ORCID iD</p>
                        <a href={`https://orcid.org/${req.orcid_id}`} target="_blank" rel="noreferrer" style={{ fontSize: '14px', color: 'var(--green-mid)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {req.orcid_id} <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                    {req.documents_url && (
                      <div>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Evidence URL</p>
                        <a href={req.documents_url} target="_blank" rel="noreferrer" style={{ fontSize: '14px', color: 'var(--green-mid)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          View Documents <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                    <button
                      onClick={() => handleReview(req.id, req.user_id, 'approved')}
                      className="btn btn-primary"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#10B981', borderColor: '#10B981' }}
                    >
                      <CheckCircle size={16} /> Approve Verification
                    </button>
                    <button
                      onClick={() => handleReview(req.id, req.user_id, 'rejected')}
                      className="btn btn-ghost"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444' }}
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
