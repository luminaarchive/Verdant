'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Compass, FolderOpen, Clock, Plus, BookOpen, HelpCircle, Info, X, Eye, Inbox, Activity, FileText, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAppLayout } from './AppLayout'
import { getStreak } from '@/lib/streak/client'
import { getPrestigeLevel } from '@/lib/intelligence/prestige'

import { useTheme } from '@/components/providers/ThemeProvider'
import { useLanguage } from '@/components/providers/LanguageProvider'

const navMainKeys = [
  { key: 'home', icon: Home, href: '/' },
  { key: 'discover', icon: Compass, href: '/discover' },
  { key: 'watchlists', icon: Eye, href: '/watchlists' },
  { key: 'digest', icon: Inbox, href: '/digest' },
  { key: 'pulse', icon: Activity, href: '/pulse' },
  { key: 'spaces', icon: FolderOpen, href: '/spaces' },
  { key: 'history', icon: Clock, href: '/history' },
  { key: 'journal', icon: BookOpen, href: '/journal' },
]

const navFooterKeys = [
  { key: 'protocol', icon: FileText, href: '/protocol' },
  { key: 'about', icon: Info, href: '/about' },
  { key: 'help', icon: HelpCircle, href: '/help' },
]

interface NavItemProps {
  href: string
  label: string
   
  icon: React.ComponentType<any>
  isActive: boolean
  onClick?: () => void
}

function NavItem({ href, label, icon: Icon, isActive, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '9px 14px',
        borderRadius: '10px',
        textDecoration: 'none',
        position: 'relative',
        transition: 'all 0.2s ease',
        color: isActive ? 'var(--green-dark)' : 'var(--text-secondary)',
        fontWeight: isActive ? 600 : 500,
        background: isActive ? 'var(--border-section)' : 'transparent',
        boxShadow: isActive ? 'inset 0 1px 3px rgba(26,47,35,0.04)' : 'none',
      }}
      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--border-section)' }}
      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      {isActive && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '20%',
            bottom: '20%',
            width: '3.5px',
            background: 'linear-gradient(180deg, var(--green-dark), var(--green-mid))',
            borderRadius: '0 4px 4px 0',
          }}
        />
      )}
      <Icon
        size={17}
        strokeWidth={isActive ? 2.2 : 1.8}
        style={{ flexShrink: 0 }}
      />
      <span
        style={{
          fontSize: '14.5px',
          fontFamily: "'Manrope', system-ui, sans-serif",
          letterSpacing: '0.01em',
        }}
      >
        {label}
      </span>
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { sidebarOpen, setSidebarOpen } = useAppLayout()
  const { t } = useLanguage()
  const { theme, setTheme } = useTheme()
  const [streakDays, setStreakDays] = useState(0)
  const [streakStage, setStreakStage] = useState('Seedling')
  const [streakProgress, setStreakProgress] = useState(0)
  const [daysToNext, setDaysToNext] = useState(3)
  const [sessions, setSessions] = useState(0)
  const [prestigeTitle, setPrestigeTitle] = useState('Observer')
  const [prestigeIcon, setPrestigeIcon] = useState('visibility')
  const fallbackLabelMap: Record<string, string> = {
    home: 'Home',
    discover: 'Discover',
    watchlists: 'Watchlists',
    digest: 'Digest',
    pulse: 'Pulse',
    spaces: 'Spaces',
    history: 'Archive',
    journal: 'Journal',
    protocol: 'Protocol',
    about: 'About',
    help: 'Help',
  }
  const getNavLabel = (key: string) => {
    const translated = t.sidebar[key as keyof typeof t.sidebar]
    return typeof translated === 'string' && translated.trim().length > 0
      ? translated
      : fallbackLabelMap[key] ?? 'Navigation'
  }

  useEffect(() => {
    const streak = getStreak()
    setStreakDays(streak.days)
    setStreakStage(streak.stage)
    setStreakProgress(streak.progress)
    setDaysToNext(streak.daysToNext)
    
    // Session count from journal
    try {
      const journal = JSON.parse(localStorage.getItem('verdant-journal') ?? '[]')
      setSessions(journal.length)
    } catch { /* ignore */ }
    
    const prestige = getPrestigeLevel(sessions, streak.days)
    setPrestigeTitle(prestige.title)
    setPrestigeIcon(prestige.icon)
  }, [sessions])

  const isActive = (href: string) =>
    href === '/'
      ? pathname === '/' || pathname.startsWith('/research')
      : pathname === href || pathname.startsWith(href + '/')

  const handleNewThread = () => {
    setSidebarOpen(false)
    router.push('/')
  }

  return (
    <nav
      className={`sidebar-nav h-screen fixed left-0 top-0 flex flex-col flex-shrink-0 z-40 ${sidebarOpen ? 'open' : ''}`}
      style={{
        width: 'var(--sidebar-w)',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        paddingTop: '0',
        paddingBottom: '16px',
        paddingLeft: '14px',
        paddingRight: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}
    >
      {/* Accent line */}
      <div style={{
        height: '2px',
        background: 'linear-gradient(90deg, #1A2F23, #2E5D3E, #34D399, transparent)',
        marginBottom: '0',
        marginLeft: '-14px',
        marginRight: '-14px',
        opacity: 0.7,
      }} />

      {/* Mobile close */}
      <button
        className="absolute top-4 right-4 lg:hidden"
        onClick={() => setSidebarOpen(false)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'none' }}
      >
        <X size={18} />
      </button>

      {/* Logo */}
      <div style={{ paddingLeft: '12px', paddingRight: '12px', paddingTop: '22px', paddingBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '26px', height: '26px', borderRadius: '7px',
            background: 'linear-gradient(135deg, #1A2F23, #2E5D3E)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(26,47,35,0.2)',
          }}>
            <svg fill="none" height="14" viewBox="0 0 50 70" width="10" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 70V15" stroke="#D1FAE5" strokeLinecap="round" strokeWidth="3"/>
              <ellipse cx="25" cy="12" fill="#D1FAE5" fillOpacity="0.9" rx="7" ry="14"/>
              <ellipse cx="38" cy="22" fill="#D1FAE5" fillOpacity="0.7" rx="5" ry="10" transform="rotate(45 38 22)"/>
              <ellipse cx="12" cy="32" fill="#D1FAE5" fillOpacity="0.7" rx="5" ry="9" transform="rotate(-30 12 32)"/>
            </svg>
          </div>
          <div>
            <h1
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: '20px',
                fontWeight: '600',
                color: '#1A2F23',
                letterSpacing: '-0.1px',
                lineHeight: '1',
              }}
            >
              verdant
            </h1>
          </div>
        </div>
        <p style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontFamily: "'Manrope', sans-serif", marginTop: '6px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '500', paddingLeft: '34px' }}>
          Environmental Intelligence
        </p>
      </div>

      {/* New Thread */}
      <button
        onClick={handleNewThread}
        className="flex items-center justify-center gap-2 w-full group"
        style={{
          background: 'transparent',
          color: '#1A2F23',
          border: '1.5px solid rgba(26,47,35,0.2)',
          borderRadius: '10px',
          padding: '10px 16px',
          marginBottom: '16px',
          fontSize: '14px',
          fontFamily: "'Manrope', system-ui, sans-serif",
          fontWeight: '600',
          letterSpacing: '0.01em',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #1A2F23, #253d2c)';
          (e.currentTarget as HTMLElement).style.color = '#FFFFFF';
          (e.currentTarget as HTMLElement).style.borderColor = '#1A2F23';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(26,47,35,0.15)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
          (e.currentTarget as HTMLElement).style.color = '#1A2F23';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,47,35,0.18)';
          (e.currentTarget as HTMLElement).style.boxShadow = 'none'
        }}
      >
        <Plus size={15} strokeWidth={2} style={{ transition: 'transform 0.25s ease' }} className="group-hover:rotate-90" />
        New Thread
      </button>

      {/* Main Nav */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flex: 1 }}>
        {navMainKeys.map(item => (
          <NavItem
            key={item.key}
            href={item.href}
            label={getNavLabel(item.key)}
            icon={item.icon}
            isActive={isActive(item.href)}
            onClick={() => setSidebarOpen(false)}
          />
        ))}
      </div>

      {/* Section divider */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(26,47,35,0.08), transparent)', margin: '4px 8px' }} />

      {/* Footer Nav */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginBottom: '8px' }}>
        {navFooterKeys.map(item => (
          <NavItem
            key={item.key}
            href={item.href}
            label={getNavLabel(item.key)}
            icon={item.icon}
            isActive={isActive(item.href)}
            onClick={() => setSidebarOpen(false)}
          />
        ))}
      </div>

      {/* Theme Toggle */}
      <div style={{ display: 'flex', padding: '4px 12px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: '8px', padding: '4px', width: '100%', border: '1px solid var(--border)' }}>
          {(['light', 'dark', 'system'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setTheme(mode)}
              style={{
                flex: 1,
                padding: '4px 0',
                fontSize: '11px',
                fontFamily: "'Manrope', sans-serif",
                fontWeight: theme === mode ? 600 : 500,
                color: theme === mode ? 'var(--text-main)' : 'var(--text-muted)',
                background: theme === mode ? 'var(--bg-surface)' : 'transparent',
                borderRadius: '6px',
                border: 'none',
                boxShadow: theme === mode ? 'var(--shadow-sm)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {mode === 'light' ? '☀ ' : mode === 'dark' ? '🌙 ' : '◐ '}
              {(() => {
                const key = `theme${mode.charAt(0).toUpperCase() + mode.slice(1)}` as keyof typeof t.sidebar
                const label = t.sidebar[key]
                return typeof label === 'string' && label.trim().length > 0 ? label : mode
              })()}
            </button>
          ))}
        </div>
      </div>

      {/* Trust Capsule */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(209,250,229,0.25)', borderRadius: '8px', border: '1px solid rgba(52,211,153,0.2)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#059669' }}>verified_user</span>
          <div>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: '10px', fontWeight: '700', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: '1' }}>Verdant Intelligence</p>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: '9.5px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1' }}>Zero-hallucination enforced</p>
          </div>
        </div>
      </div>

      {/* Prestige + Streak Card */}
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: '10px' }}>
        <div
          onClick={() => { setSidebarOpen(false); router.push('/profile') }}
          className="cursor-pointer group"
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-card)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card-hover)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
            }}
          >
            {/* Prestige Title */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="prestige-badge">
                <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>{prestigeIcon}</span>
                {prestigeTitle}
              </div>
              <div
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                style={{ background: '#1A2F23' }}
              >
                <div
                  className="rounded-full"
                  style={{ width: '4px', height: '4px', background: '#D1FAE5', animation: 'pulse 2s ease-in-out infinite' }}
                />
                <span
                  style={{
                    fontSize: '8.5px',
                    fontFamily: "'Manrope', system-ui, sans-serif",
                    fontWeight: '600',
                    color: '#F9F8F4',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  {streakDays}d
                </span>
              </div>
            </div>
            
            {/* Growth Bar */}
            <div className="flex gap-2.5 items-center">
              <div
                style={{
                  width: '34px', height: '34px', borderRadius: '9px',
                  background: 'linear-gradient(135deg, #F3F1EB, #E8E6DE)',
                  border: '1px solid rgba(26,47,35,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg fill="none" height="20" viewBox="0 0 50 70" width="14" xmlns="http://www.w3.org/2000/svg">
                  <path d="M25 70V15" stroke="#1A2F23" strokeLinecap="round" strokeWidth="2.5"/>
                  <path d="M25 45Q35 35 38 25" fill="none" stroke="#1A2F23" strokeLinecap="round" strokeWidth="1.5"/>
                  <path d="M25 50Q15 45 12 35" fill="none" stroke="#1A2F23" strokeLinecap="round" strokeWidth="1.5"/>
                  <ellipse cx="25" cy="12" fill="#1A2F23" fillOpacity="0.9" rx="7" ry="14"/>
                  <ellipse cx="38" cy="22" fill="#1A2F23" fillOpacity="0.8" rx="5" ry="10" transform="rotate(45 38 22)"/>
                  <ellipse cx="12" cy="32" fill="#1A2F23" fillOpacity="0.8" rx="5" ry="9" transform="rotate(-30 12 32)"/>
                </svg>
              </div>
              <div className="flex-1 flex flex-col gap-1" style={{ minWidth: 0 }}>
                <span style={{ fontSize: '12px', fontFamily: "'Fraunces', Georgia, serif", color: '#1A2F23', lineHeight: '1' }}>
                  {streakStage}
                </span>
                <div
                  className="w-full rounded-full overflow-hidden"
                  style={{ height: '3px', background: 'rgba(26,47,35,0.08)' }}
                >
                  <div
                    className="h-full rounded-full overflow-hidden relative"
                    style={{ width: `${Math.max(5, streakProgress)}%`, background: 'linear-gradient(90deg, #1A2F23, #2E5D3E)' }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(90deg, transparent, rgba(209,250,229,0.5), transparent)',
                        animation: 'shimmer 2s infinite',
                      }}
                    />
                  </div>
                </div>
                <span style={{ fontSize: '9.5px', fontFamily: "'Manrope', sans-serif", color: 'var(--text-muted)' }}>
                  {daysToNext > 0 ? `${daysToNext}d to next level` : 'Maximum reached'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade CTA (Phase 9) */}
        <button
          onClick={() => {
            const ev = new CustomEvent('verdant_paywall_open', { detail: { source: 'sidebar' } })
            window.dispatchEvent(ev)
          }}
          className="btn btn-primary mt-2 w-full"
          style={{
            background: 'linear-gradient(135deg, #1A2F23, #2E5D3E)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '12px',
            padding: '10px',
            borderRadius: '10px'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#D1FAE5' }}>workspace_premium</span>
          <span style={{ color: '#D1FAE5', fontWeight: '600', letterSpacing: '0.02em' }}>Upgrade to Institutional</span>
        </button>

        {/* Sign Out */}
        <button
          onClick={async () => {
            const sb = createClient()
            await sb.auth.signOut()
            router.push('/auth')
            router.refresh()
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 14px',
            marginTop: '8px',
            borderRadius: '10px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.2s ease',
            color: 'var(--text-muted)',
            fontFamily: "'Manrope', system-ui, sans-serif",
            fontSize: '13px',
            fontWeight: 500,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--border-section)';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'
          }}
        >
          <LogOut size={15} strokeWidth={1.8} />
          Sign out
        </button>
      </div>
    </nav>
  )
}
