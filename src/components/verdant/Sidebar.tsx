'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Compass, FolderOpen, Clock, Plus, BookOpen, HelpCircle, Info, X, Eye, Inbox } from 'lucide-react'
import { useAppLayout } from './AppLayout'

const navMain = [
  { label: 'Home',       icon: Home,       href: '/' },
  { label: 'Discover',   icon: Compass,    href: '/discover' },
  { label: 'Watchlists', icon: Eye,        href: '/watchlists' },
  { label: 'Digest',     icon: Inbox,      href: '/digest' },
  { label: 'Spaces',     icon: FolderOpen, href: '/spaces' },
  { label: 'History',    icon: Clock,      href: '/history' },
  { label: 'Journal',    icon: BookOpen,   href: '/journal' },
]

const navFooter = [
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
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg relative transition-all duration-200 group ${isActive ? 'text-[#1A2F23] font-semibold' : 'text-[rgba(26,47,35,0.6)]'}`}
      style={isActive ? { background: 'rgba(209,250,229,0.35)' } : {}}
      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(26,47,35,0.05)' }}
      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      {isActive && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '20%',
            bottom: '20%',
            width: '3px',
            background: '#1A2F23',
            borderRadius: '0 3px 3px 0',
          }}
        />
      )}
      <Icon
        size={17}
        strokeWidth={isActive ? 2.2 : 1.6}
        style={{ flexShrink: 0 }}
      />
      <span
        style={{
          fontSize: '13.5px',
          fontFamily: "'Inter', system-ui, sans-serif",
          letterSpacing: '0.01em',
          transition: 'opacity 0.15s',
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
        background: 'rgba(249,248,244,0.96)',
        borderRight: '1px solid rgba(0,0,0,0.05)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        paddingTop: '24px',
        paddingBottom: '20px',
        paddingLeft: '16px',
        paddingRight: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      {/* Mobile close */}
      <button
        className="absolute top-4 right-4 lg:hidden"
        onClick={() => setSidebarOpen(false)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'none' }}
      >
        <X size={18} />
      </button>

      {/* Logo */}
      <div style={{ paddingLeft: '12px', paddingRight: '12px', marginBottom: '24px', paddingTop: '4px' }}>
        <h1
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '21px',
            fontWeight: '400',
            color: '#1A2F23',
            letterSpacing: '-0.3px',
          }}
        >
          verdant
        </h1>
        <p style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", marginTop: '2px', letterSpacing: '0.02em' }}>
          AI Research Platform
        </p>
      </div>

      {/* New Thread */}
      <button
        onClick={handleNewThread}
        className="flex items-center justify-center gap-2 w-full group"
        style={{
          background: 'transparent',
          color: '#1A2F23',
          border: '1px solid rgba(26,47,35,0.22)',
          borderRadius: '10px',
          padding: '9px 16px',
          marginBottom: '16px',
          fontSize: '13.5px',
          fontFamily: "'Inter', system-ui, sans-serif",
          fontWeight: '500',
          letterSpacing: '0.01em',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = '#1A2F23'
          ;(e.currentTarget as HTMLElement).style.color = '#FFFFFF'
          ;(e.currentTarget as HTMLElement).style.borderColor = '#1A2F23'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'transparent'
          ;(e.currentTarget as HTMLElement).style.color = '#1A2F23'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,47,35,0.22)'
        }}
      >
        <Plus size={16} strokeWidth={2} style={{ transition: 'transform 0.25s ease' }} className="group-hover:rotate-90" />
        New Thread
      </button>

      {/* Main Nav */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
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

      {/* Footer Nav */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '12px' }}>
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

      {/* Sapling Card */}
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '12px' }}>
        <div
          onClick={() => { setSidebarOpen(false); router.push('/profile') }}
          className="cursor-pointer group"
        >
          <div
            className="flex flex-col gap-3 p-3.5 rounded-xl transition-all duration-300"
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(0,0,0,0.05)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.8)',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px rgba(26,47,35,0.08), inset 0 1px 0 rgba(255,255,255,0.8)'
              ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,47,35,0.12)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.8)'
              ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.05)'
            }}
          >
            <div className="flex items-center justify-between">
              <div
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                style={{ background: '#1A2F23' }}
              >
                <div
                  className="rounded-full"
                  style={{ width: '5px', height: '5px', background: '#D1FAE5', animation: 'pulse 2s ease-in-out infinite' }}
                />
                <span
                  style={{
                    fontSize: '9px',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: '600',
                    color: '#F9F8F4',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  14 day streak
                </span>
              </div>
            </div>
            <div className="flex gap-2.5 items-center">
              <div
                className="flex items-center justify-center rounded-lg group-hover:scale-105 transition-transform duration-300"
                style={{
                  width: '42px',
                  height: '42px',
                  background: '#F3F1EB',
                  border: '1px solid rgba(26,47,35,0.10)',
                  flexShrink: 0,
                }}
              >
                <svg fill="none" height="26" viewBox="0 0 50 70" width="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M25 70V15" stroke="#1A2F23" strokeLinecap="round" strokeWidth="2.5"/>
                  <path d="M25 45Q35 35 38 25" fill="none" stroke="#1A2F23" strokeLinecap="round" strokeWidth="1.5"/>
                  <path d="M25 50Q15 45 12 35" fill="none" stroke="#1A2F23" strokeLinecap="round" strokeWidth="1.5"/>
                  <ellipse cx="25" cy="12" fill="#1A2F23" fillOpacity="0.9" rx="7" ry="14"/>
                  <ellipse cx="38" cy="22" fill="#1A2F23" fillOpacity="0.8" rx="5" ry="10" transform="rotate(45 38 22)"/>
                  <ellipse cx="12" cy="32" fill="#1A2F23" fillOpacity="0.8" rx="5" ry="9" transform="rotate(-30 12 32)"/>
                  <ellipse cx="30" cy="38" fill="#1A2F23" fillOpacity="0.7" rx="4" ry="7" transform="rotate(20 30 38)"/>
                </svg>
              </div>
              <div className="flex-1 flex flex-col gap-1.5" style={{ minWidth: 0 }}>
                <span style={{ fontSize: '13px', fontFamily: 'Georgia, serif', color: '#1A2F23', lineHeight: '1' }}>
                  Sapling
                </span>
                <div
                  className="w-full rounded-full overflow-hidden"
                  style={{ height: '3px', background: 'rgba(26,47,35,0.10)' }}
                >
                  <div
                    className="h-full rounded-full overflow-hidden relative"
                    style={{ width: '35%', background: '#1A2F23' }}
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
                <span style={{ fontSize: '10px', fontFamily: "'Inter', sans-serif", color: 'var(--text-muted)' }}>
                  3 days to next level
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
