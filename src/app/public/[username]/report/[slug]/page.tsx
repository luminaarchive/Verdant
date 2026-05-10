import React from 'react'
import { notFound } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, Clock, ShieldCheck, FileText, Share2, Download } from 'lucide-react'

export const revalidate = 60 // 1 minute

export default async function PublicReportPage({ params }: { params: { username: string, slug: string } }) {
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

  // 1. Fetch the user profile by username
  const { data: profile } = await supabase
    .from('public_profiles')
    .select('user_id, display_name, verified_status, organization')
    .eq('username', params.username)
    .single()

  if (!profile) {
    return notFound()
  }

  // 2. Fetch the report by slug and user_id
  const { data: report } = await supabase
    .from('public_reports')
    .select(`
      *,
      report_versions (
        version_number,
        content,
        created_at
      )
    `)
    .eq('user_id', profile.user_id)
    .eq('slug', params.slug)
    .single()

  if (!report) {
    return notFound()
  }

  // Find the latest version
  const latestVersion = report.report_versions?.sort((a: any, b: any) => b.version_number - a.version_number)[0]
  const content = latestVersion?.content || report.content

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <header style={{ padding: '20px 32px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link href={`/public/${params.username}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500' }}>
            <ArrowLeft size={16} /> Back to Profile
          </Link>
          <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />
          <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-main)' }}>{profile.display_name} / Reports</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Share2 size={15} /> Share
          </button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={15} /> Export PDF
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px' }}>
        <article className="card-premium" style={{ padding: '48px', background: 'var(--bg-card)' }}>
          {/* Document Header */}
          <div style={{ marginBottom: '40px', borderBottom: '1px solid var(--border)', paddingBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <span className="badge badge-green" style={{ fontSize: '12px', padding: '4px 10px' }}>{report.category}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                <Clock size={14} />
                {new Date(report.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              {latestVersion && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', marginLeft: 'auto' }}>
                  <FileText size={14} />
                  v{latestVersion.version_number}.0
                </div>
              )}
            </div>

            <h1 className="heading-display" style={{ fontSize: '40px', lineHeight: '1.2', marginBottom: '20px', color: 'var(--text-main)' }}>
              {report.title}
            </h1>

            {/* Author Block */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-elevated)', padding: '16px 20px', borderRadius: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--green-mid), var(--green-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#FFFFFF' }}>
                  {profile.display_name?.charAt(0).toUpperCase() || 'R'}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>{profile.display_name}</p>
                  {profile.verified_status === 'approved' && (
                    <ShieldCheck size={16} fill="rgba(16,185,129,0.15)" strokeWidth={2} style={{ color: '#10B981' }} />
                  )}
                </div>
                {profile.organization && (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>{profile.organization}</p>
                )}
              </div>
            </div>
          </div>

          {/* Document Content */}
          <div className="prose" style={{ fontSize: '16px', lineHeight: '1.8', color: 'var(--text-main)' }}>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '32px' }}>
              {report.summary}
            </p>

            <div 
              style={{ fontFamily: "'Inter', sans-serif" }}
              dangerouslySetInnerHTML={{ __html: content }} 
            />
          </div>
        </article>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Published on the Verdant Environmental Intelligence Platform
          </p>
        </div>
      </main>
    </div>
  )
}
