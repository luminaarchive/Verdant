'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/verdant/AppLayout'
import { RefreshCw, ExternalLink } from 'lucide-react'

const filters = ['Recommended', 'Trending', 'New Papers', 'By Region', 'Grants', 'Indonesia']

const GRANTS = [
  { title: 'GEF-8 Biodiversity Conservation Fund', deadline: '2026-06-30', amount: '$2M–$10M', focus: 'Biodiversity conservation in megadiverse countries', funder: 'Global Environment Facility', fit: 'High' },
  { title: 'Green Climate Fund Ecosystem Resilience', deadline: '2026-08-15', amount: '$5M–$50M', focus: 'Climate adaptation through ecosystem-based approaches', funder: 'Green Climate Fund', fit: 'High' },
  { title: 'EU Horizon Europe - RestoreEco Call', deadline: '2026-07-10', amount: '€1.5M–€4M', focus: 'Large-scale ecosystem restoration research', funder: 'European Commission', fit: 'Medium' },
  { title: 'USAID Sustainable Landscapes Indonesia', deadline: '2026-09-01', amount: '$500K–$3M', focus: 'Peatland restoration and sustainable forest management', funder: 'USAID', fit: 'Very High' },
  { title: 'Darwin Initiative Round 30', deadline: '2026-07-22', amount: '£150K–£500K', focus: 'Biodiversity and sustainable livelihoods in developing countries', funder: 'UK Defra', fit: 'Medium' },
  { title: 'IUCN Save Our Species Fund', deadline: 'Rolling', amount: '$25K–$100K', focus: 'Targeted species conservation projects globally', funder: 'IUCN', fit: 'High' },
]

const INDONESIA_INTEL = [
  { title: 'KLHK deforestation monitoring Q1 2026: Kalimantan shows 12% reduction', icon: 'forest', color: '#2E5D3E', query: 'Indonesia Kalimantan deforestation 2026 KLHK monitoring' },
  { title: 'Coral Triangle coral bleaching alert: Level 2 warning for Raja Ampat', icon: 'scuba_diving', color: '#C0392B', query: 'Raja Ampat coral bleaching alert 2026' },
  { title: 'New mangrove restoration decree targets 600K hectares by 2030', icon: 'eco', color: '#059669', query: 'Indonesia mangrove restoration policy 2030' },
  { title: 'Sumatran rhino population: captive breeding shows promising results', icon: 'pets', color: '#B45309', query: 'Sumatran rhino captive breeding program update' },
  { title: 'Peatland rewetting project in Riau achieves 40% fire reduction', icon: 'water_drop', color: '#1D4ED8', query: 'Riau peatland rewetting fire reduction results' },
  { title: 'LIPI biodiversity survey discovers 14 new endemic species in Sulawesi', icon: 'search', color: '#7C3AED', query: 'Sulawesi new endemic species discovery LIPI 2026' },
]

interface Article {
  id: string
  label: string
  labelColor: string
  category: string
  categoryColor: string
  tag: string
  title: string
  body: string
  url: string
  image: string | null
  publishedAt: string | null
  source: string
  query: string
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function SkeletonCard() {
  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
      <div style={{ height: '140px', background: 'linear-gradient(135deg, rgba(209,250,229,0.3), rgba(26,47,35,0.05))', animation: 'shimmer 2s infinite' }} />
      <div style={{ padding: '18px' }}>
        <div style={{ height: '12px', width: '60%', background: 'rgba(26,47,35,0.08)', borderRadius: '4px', marginBottom: '10px', animation: 'shimmer 2s infinite' }} />
        <div style={{ height: '10px', width: '90%', background: 'rgba(26,47,35,0.05)', borderRadius: '4px', marginBottom: '6px', animation: 'shimmer 2s infinite' }} />
        <div style={{ height: '10px', width: '70%', background: 'rgba(26,47,35,0.05)', borderRadius: '4px', animation: 'shimmer 2s infinite' }} />
      </div>
    </div>
  )
}

export default function DiscoverPage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState('Recommended')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [fetchedAt, setFetchedAt] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchArticles = useCallback(async (filter: string, force = false) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/discover?filter=${encodeURIComponent(filter)}${force ? '&force=true' : ''}`)
      const data = await res.json()
      if (data.ok) {
        setArticles(data.articles || [])
        setFetchedAt(data.fetchedAt || null)
      } else {
        setError(data.error || 'Failed to load articles')
        setArticles([])
      }
    } catch {
      setError('Network error. Please check your connection.')
      setArticles([])
    }
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { fetchArticles(activeFilter) }, [activeFilter, fetchArticles])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchArticles(activeFilter, true)
  }

  const featured = articles[0] || null
  const gridArticles = articles.slice(1)

  return (
    <AppLayout>
      <div style={{ padding: '36px 32px 60px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px', gap: '16px', flexWrap: 'wrap' }} className="slide-up">
            <div>
              <h1 className="heading-page" style={{ marginBottom: '6px' }}>Discover</h1>
              <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '14px', color: 'var(--text-muted)', marginBottom: '0' }}>
                Explore verified research streams and emerging ecological trends.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {fetchedAt && (
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'var(--text-muted)' }}>
                  Updated {timeAgo(fetchedAt)}
                </span>
              )}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn btn-ghost"
                style={{ display: 'flex', alignItems: 'center', gap: '5px', height: '34px', padding: '0 12px' }}
              >
                <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                Refresh
              </button>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', marginTop: '18px', flexWrap: 'wrap' }} className="slide-up stagger-1">
            {filters.map(f => {
              const active = f === activeFilter
              return (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={active ? 'chip chip-active' : 'chip'}
                  style={{ padding: '7px 16px', fontSize: '12.5px', cursor: 'pointer' }}
                >
                  {f}
                </button>
              )
            })}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--text-muted)', marginBottom: '12px', display: 'block' }}>cloud_off</span>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#1A2F23', marginBottom: '8px' }}>Could not load articles</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>{error}</p>
              <button onClick={() => fetchArticles(activeFilter, true)} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={13} /> Retry
              </button>
            </div>
          )}

          {/* Content */}
          {!loading && !error && (
            <>
              {/* Featured */}
              {featured && (
                <div
                  onClick={() => router.push('/research?q=' + encodeURIComponent(featured.title))}
                  className="card-premium"
                  style={{ padding: '0', display: 'flex', gap: '0', cursor: 'pointer', overflow: 'hidden', marginBottom: '20px' }}
                >
                  <div style={{ flex: '0 0 65%', padding: '28px 32px', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <p className="label-system" style={{ color: featured.labelColor, marginBottom: '12px' }}>{featured.label}</p>
                    <h2 className="heading-card" style={{ fontSize: '22px', marginBottom: '12px', lineHeight: '1.3' }}>{featured.title}</h2>
                    <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.65', marginBottom: '14px' }}>{featured.body}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="label-system" style={{ color: '#1A2F23', letterSpacing: '0.06em', fontSize: '10.5px' }}>Begin Research →</span>
                      {featured.publishedAt && <span style={{ fontSize: '11px', fontFamily: "'Inter', sans-serif", color: 'var(--text-muted)' }}>{timeAgo(featured.publishedAt)}</span>}
                    </div>
                  </div>
                  <div style={{
                    flex: 1,
                    background: featured.image ? `url(${featured.image}) center/cover no-repeat` : 'linear-gradient(135deg, #D1FAE5 0%, #1A2F23 100%)',
                    minHeight: '180px',
                  }} />
                </div>
              )}

              {/* Grid */}
              {gridArticles.length === 0 && !featured && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", fontSize: '14px' }}>
                  No articles found for this filter. Try another category.
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px', paddingBottom: '24px' }}>
                {gridArticles.map(article => (
                  <div
                    key={article.id}
                    className="card-premium"
                    style={{ padding: '0', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                    onClick={() => router.push('/research?q=' + encodeURIComponent(article.title))}
                  >
                    {/* Image */}
                    <div style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
                      <div style={{
                        width: '100%', height: '100%',
                        background: article.image ? `url(${article.image}) center/cover no-repeat` : 'linear-gradient(135deg, #D1FAE5 0%, rgba(26,47,35,0.3) 100%)',
                      }} />
                      <span style={{
                        position: 'absolute', top: '10px', left: '10px',
                        fontSize: '9px', fontFamily: "'Inter', system-ui, sans-serif", textTransform: 'uppercase',
                        letterSpacing: '0.1em', color: '#FFFFFF', fontWeight: '600',
                        background: article.labelColor, padding: '3px 8px', borderRadius: '4px',
                      }}>
                        {article.label}
                      </span>
                    </div>
                    {/* Body */}
                    <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: '400', color: '#1A2F23', lineHeight: '1.4', marginBottom: '8px', flex: 1 }}>{article.title}</h3>
                      <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '14px' }}>{article.body}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', background: 'rgba(26,47,35,0.07)', color: article.categoryColor, borderRadius: '10px', padding: '3px 10px', fontFamily: "'Inter', sans-serif", fontWeight: '500' }}>{article.category}</span>
                          {article.publishedAt && <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>{timeAgo(article.publishedAt)}</span>}
                        </div>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                        >
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <p style={{ textAlign: 'center', fontFamily: "'Inter', sans-serif", fontSize: '11.5px', color: 'var(--text-muted)', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                Sources pulled live from global environmental media.
              </p>
            </>
          )}

          {/* Grant Intelligence */}
          {activeFilter === 'Grants' && !loading && (
            <div>
              <div className="card" style={{ padding: '20px', marginBottom: '20px', borderLeft: '3px solid var(--green-mid)', background: 'rgba(209,250,229,0.08)' }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: '600', color: 'var(--green-mid)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>Grant Intelligence Engine</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Environmental funding opportunities matched to your research focus. Deadlines, amounts, and fit scoring for conservation and research projects.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {GRANTS.map((g, i) => (
                  <div key={i} className="card" style={{ padding: '18px', cursor: 'pointer', transition: 'border-color 0.15s' }}
                    onClick={() => router.push(`/research?q=${encodeURIComponent(g.title + ' grant funding opportunity')}`)}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#1A2F23'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = ''}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#1A2F23', marginBottom: '4px' }}>{g.title}</p>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'var(--text-muted)' }}>{g.funder}</p>
                      </div>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: '600', color: g.fit === 'Very High' ? '#2E5D3E' : g.fit === 'High' ? '#059669' : '#B45309', textTransform: 'uppercase', letterSpacing: '0.06em', background: g.fit === 'Very High' ? 'rgba(209,250,229,0.4)' : 'rgba(26,47,35,0.05)', padding: '3px 8px', borderRadius: '6px', flexShrink: 0 }}>Fit: {g.fit}</span>
                    </div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '10px' }}>{g.focus}</p>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#1A2F23', fontWeight: '500' }}>{g.amount}</span>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: g.deadline === 'Rolling' ? 'var(--green-mid)' : '#B45309' }}>Deadline: {g.deadline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Indonesia National Intelligence */}
          {activeFilter === 'Indonesia' && !loading && (
            <div>
              <div className="card" style={{ padding: '20px', marginBottom: '20px', borderLeft: '3px solid #C0392B', background: 'rgba(192,57,43,0.03)' }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: '600', color: '#C0392B', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>Indonesia National Intelligence</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Prioritized environmental intelligence for Indonesia — the world&apos;s most biodiverse archipelago. KLHK policy, Coral Triangle monitoring, and Indonesian conservation signals.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {INDONESIA_INTEL.map((item, i) => (
                  <div key={i} className="card" style={{ padding: '16px', cursor: 'pointer', transition: 'border-color 0.15s' }}
                    onClick={() => router.push(`/research?q=${encodeURIComponent(item.query)}`)}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#1A2F23'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = ''}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', color: item.color }}>{item.icon}</span>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: '#1A2F23', lineHeight: '1.4' }}>{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'var(--text-muted)', marginTop: '16px', textAlign: 'center' }}>
                Sources: KLHK, LIPI/BRIN, CTI-CFF, Mongabay Indonesia, Jakarta Post, WALHI
              </p>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
      `}</style>
    </AppLayout>
  )
}
