'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Compass, FolderOpen, Clock, Plus, BookOpen, HelpCircle, Info, X, Eye, Inbox, Activity, FileText } from 'lucide-react'
import { useAppLayout } from './AppLayout'
import { getStreak } from '@/lib/streak/client'
import { getPrestigeLevel } from '@/lib/intelligence/prestige'

const navMain = [
  { label: 'Home',       icon: Home,       href: '/' },
  { label: 'Discover',   icon: Compass,    href: '/discover' },
  { label: 'Watchlists', icon: Eye,        href: '/watchlists' },
  { label: 'Digest',     icon: Inbox,      href: '/digest' },
  { label: 'Pulse',      icon: Activity,   href: '/pulse' },
  { label: 'Spaces',     icon: FolderOpen, href: '/spaces' },
  { label: 'History',    icon: Clock,      href: '/history' },
  { label: 'Journal',    icon: BookOpen,   href: '/journal' },
]

const navFooter = [
  { label: 'Protocol',icon: FileText,   href: '/protocol' },
  { label: 'About',   icon: Info,       href: '/about' },
  { label: 'Help',    icon: HelpCircle, href: '/help' },
]

interface NavItemProps {
  href: string
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        gap: '10px',
        padding: '8px 12px',
        borderRadius: '10px',
        textDecoration: 'none',
        position: 'relative',
        transition: 'all 0.2s ease',
        color: isActive ? '#1A2F23' : 'rgba(26,47,35,0.55)',
        fontWeight: isActive ? 600 : 400,
        background: isActive ? 'rgba(209,250,229,0.3)' : 'transparent',
      }}
      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(26,47,35,0.04)' }}
      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      {isActive && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '22%',
            bottom: '22%',
            width: '3px',
            background: 'linear-gradient(180deg, #1A2F23, #2E5D3E)',
            borderRadius: '0 3px 3px 0',
          }}
        />
      )}
      <Icon
        size={16}
        strokeWidth={isActive ? 2.2 : 1.6}
        style={{ flexShrink: 0 }}
      />
      <span
        style={{
          fontSize: '13px',
          fontFamily: "'Inter', system-ui, sans-serif",
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
  const [streakDays, setStreakDays] = useState(0)
  const [streakStage, setStreakStage] = useState('Seedling')
  const [streakProgress, setStreakProgress] = useState(0)
  const [daysToNext, setDaysToNext] = useState(3)
  const [sessions, setSessions] = useState(0)
  const [prestigeTitle, setPrestigeTitle] = useState('Observer')
  const [prestigeIcon, setPrestigeIcon] = useState('visibility')

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
        background: 'rgba(249,248,244,0.97)',
        borderRight: '1px solid rgba(0,0,0,0.05)',
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
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: '20px',
                fontWeight: '400',
                color: '#1A2F23',
                letterSpacing: '-0.3px',
                lineHeight: '1',
              }}
            >
              verdant
            </h1>
          </div>
        </div>
        <p style={{ fontSize: '9.5px', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", marginTop: '6px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '500', paddingLeft: '34px' }}>
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
          border: '1px solid rgba(26,47,35,0.18)',
          borderRadius: '10px',
          padding: '9px 16px',
          marginBottom: '12px',
          fontSize: '13px',
          fontFamily: "'Inter', system-ui, sans-serif",
          fontWeight: '500',
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
        {navMain.map(item => (
          <NavItem
            key={item.label}
            href={item.href}
            label={item.label}
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
        {navFooter.map(item => (
          <NavItem
            key={item.label}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={isActive(item.href)}
            onClick={() => setSidebarOpen(false)}
          />
        ))}
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
              background: '#FFFFFF',
              border: '1px solid rgba(0,0,0,0.04)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.8)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(26,47,35,0.06), inset 0 1px 0 rgba(255,255,255,0.8)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,47,35,0.1)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.8)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.04)'
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
                    fontFamily: "'Inter', system-ui, sans-serif",
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
                <span style={{ fontSize: '12px', fontFamily: "'Instrument Serif', Georgia, serif", color: '#1A2F23', lineHeight: '1' }}>
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
                <span style={{ fontSize: '9.5px', fontFamily: "'Inter', sans-serif", color: 'var(--text-muted)' }}>
                  {daysToNext > 0 ? `${daysToNext}d to next level` : 'Maximum reached'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
