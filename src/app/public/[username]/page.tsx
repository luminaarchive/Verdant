import React from 'react'
import { notFound } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ShieldCheck, Award, FileText, CheckCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 60 // 1 minute

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const { data: profile } = await supabase
    .from('public_profiles')
    .select('*')
    .eq('username', params.username)
    .single()

  if (!profile) {
    return notFound()
  }

  const { data: reputation } = await supabase
    .from('user_reputation_scores')
    .select('*')
    .eq('user_id', profile.user_id)
    .single()

  const { data: reports } = await supabase
    .from('public_reports')
    .select('*')
    .eq('user_id', profile.user_id)
    .order('published_at', { ascending: false })

  const score = reputation?.score || 10
  const rank = reputation?.rank || 'Observer'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <header style={{ padding: '20px 32px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <h1 className="heading-display" style={{ fontSize: '24px', letterSpacing: '-0.5px', color: 'var(--text-main)' }}>verdant</h1>
        </Link>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Profile Header */}
        <div className="card-premium" style={{ display: 'flex', gap: '32px', alignItems: 'center', marginBottom: '32px', padding: '40px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--green-mid), var(--green-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-md)' }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '36px', color: '#FFFFFF' }}>
              {profile.display_name?.charAt(0).toUpperCase() || 'R'}
            </span>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 className="heading-page" style={{ fontSize: '32px', margin: 0 }}>{profile.display_name}</h1>
              {profile.verified_status === 'approved' && (
                <span title="Verified Institutional Researcher" style={{ color: '#10B981', display: 'flex' }}>
                  <ShieldCheck size={24} fill="rgba(16,185,129,0.15)" strokeWidth={2} />
                </span>
              )}
            </div>
            
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {profile.role || 'Independent Researcher'}
              {profile.organization && <span style={{ color: 'var(--text-main)', fontWeight: '500' }}> · {profile.organization}</span>}
            </p>

            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={16} style={{ color: 'var(--green-mid)' }} />
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>Rank: {rank}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} style={{ color: 'var(--green-mid)' }} />
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>Trust Score: {score}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio and Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '40px' }}>
          <div className="card-premium" style={{ padding: '32px' }}>
            <h3 className="heading-section" style={{ marginBottom: '16px' }}>About the Researcher</h3>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              {profile.bio || 'No biography provided.'}
            </p>
            {profile.orcid_id && (
              <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>ORCID ID:</span>
                <a href={`https://orcid.org/${profile.orcid_id}`} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: 'var(--green-mid)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {profile.orcid_id} <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>

          <div className="card-premium" style={{ padding: '32px' }}>
            <h3 className="heading-section" style={{ marginBottom: '16px' }}>Specializations</h3>
            {profile.specializations && profile.specializations.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {profile.specializations.map((spec: string, i: number) => (
                  <span key={i} className="chip">{spec}</span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No specializations listed.</p>
            )}
          </div>
        </div>

        {/* Public Reports */}
        <h2 className="heading-page" style={{ fontSize: '24px', marginBottom: '24px' }}>Published Research</h2>
        {reports && reports.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reports.map(report => (
              <Link key={report.id} href={`/public/${params.username}/report/${report.slug}`} style={{ textDecoration: 'none' }}>
                <div className="card-premium group" style={{ padding: '24px', cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h3 className="heading-card" style={{ fontSize: '18px', color: 'var(--text-main)' }}>{report.title}</h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(report.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
                    {report.summary}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span className="chip" style={{ background: 'rgba(26,47,35,0.05)', border: 'none', fontSize: '11px' }}>{report.category}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <FileText size={14} /> Report
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-elevated)', border: '1px dashed var(--border-strong)' }}>
            <FileText size={32} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '8px' }}>No public research available.</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>This researcher hasn&apos;t published any public reports yet.</p>
          </div>
        )}
      </main>
    </div>
  )
}
