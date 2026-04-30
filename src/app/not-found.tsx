'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      style={{
        height: '100vh',
        background: 'var(--bg-main)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(209,250,229,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
        }}
      >
        <svg fill="none" height="40" viewBox="0 0 50 70" width="28" xmlns="http://www.w3.org/2000/svg">
          <path d="M25 70V15" stroke="#1A2F23" strokeLinecap="round" strokeWidth="2.5"/>
          <ellipse cx="25" cy="12" fill="#1A2F23" fillOpacity="0.9" rx="7" ry="14"/>
          <ellipse cx="38" cy="22" fill="#1A2F23" fillOpacity="0.7" rx="5" ry="10" transform="rotate(45 38 22)"/>
          <ellipse cx="12" cy="32" fill="#1A2F23" fillOpacity="0.7" rx="5" ry="9" transform="rotate(-30 12 32)"/>
        </svg>
      </div>

      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '11px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--text-muted)',
          marginBottom: '12px',
        }}
      >
        404 — Not Found
      </p>
      <h1
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: '32px',
          fontWeight: '400',
          color: '#1A2F23',
          marginBottom: '12px',
          letterSpacing: '-0.3px',
        }}
      >
        This path leads nowhere
      </h1>
      <p
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: '15px',
          color: 'var(--text-muted)',
          lineHeight: '1.6',
          maxWidth: '360px',
          marginBottom: '32px',
        }}
      >
        The page you&apos;re looking for doesn&apos;t exist or has been moved. Return to the dashboard to continue your research.
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#1A2F23',
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: '500',
            textDecoration: 'none',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#253d2c'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#1A2F23'}
        >
          ← Return Home
        </Link>
        <Link
          href="/help"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'transparent',
            color: 'var(--text-muted)',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: '500',
            textDecoration: 'none',
            border: '1px solid var(--border-strong)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1A2F23'; (e.currentTarget as HTMLElement).style.color = '#FFFFFF' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
        >
          Help Center
        </Link>
      </div>
    </div>
  )
}
