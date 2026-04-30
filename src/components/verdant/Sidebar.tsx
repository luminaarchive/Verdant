'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Compass, FolderOpen, Clock, Plus } from 'lucide-react'

const navItems = [
  { label: 'Home',     icon: Home,       href: '/' },
  { label: 'Discover', icon: Compass,    href: '/discover' },
  { label: 'Spaces',   icon: FolderOpen, href: '/spaces' },
  { label: 'History',  icon: Clock,      href: '/history' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav
      className="w-[260px] h-screen fixed left-0 top-0 flex flex-col px-6 py-8 flex-shrink-0 z-40 transition-all duration-300 backdrop-blur-md"
      style={{ 
        background: 'rgba(249, 248, 244, 0.95)', // Bone White with slight transparency
        borderRight: '1px solid rgba(0,0,0,0.05)' 
      }}
    >
      {/* Logo */}
      <div className="mb-10 px-2">
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '400', color: '#1A2F23' }}>
          verdant
        </h1>
      </div>

      {/* New Thread button */}
      <button
        onClick={() => router.push('/')}
        className="w-full py-2.5 px-4 mb-8 flex items-center justify-center gap-2 rounded-lg transition-all duration-300 group"
        style={{
          background: 'transparent', 
          color: '#1A2F23', 
          border: '1px solid rgba(26,47,35,0.2)',
          fontSize: '13.5px', 
          fontFamily: 'system-ui, -apple-system, sans-serif', 
          fontWeight: '500',
          letterSpacing: '0.02em', 
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = '#1A2F23';
          (e.currentTarget as HTMLElement).style.color = '#F9F8F4';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
          (e.currentTarget as HTMLElement).style.color = '#1A2F23';
        }}
      >
        <Plus strokeWidth={1.5} size={18} className="transition-transform duration-300 group-hover:rotate-90" />
        New Thread
      </button>

      {/* Nav items */}
      <div className="flex-grow flex flex-col gap-1.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.label === 'Home' && (pathname || '').startsWith('/research'))
          
          const Icon = item.icon
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 py-2.5 relative transition-all duration-300 rounded-md overflow-hidden group"
              style={isActive ? {
                color: '#1A2F23', 
                fontWeight: '600',
                background: 'rgba(209, 250, 229, 0.4)', // Bioluminescent Mint subtle tint
              } : {
                color: 'rgba(26,47,35,0.65)', // Muted dark green
                paddingLeft: '16px',
                paddingRight: '16px',
              }}
            >
              {/* Active Indicator Line */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-md bg-[#1A2F23]" />
              )}
              
              <div 
                className="flex items-center gap-3 px-4 transition-transform duration-300 group-hover:translate-x-1"
                style={{ paddingLeft: isActive ? '16px' : '0' }}
              >
                <Icon strokeWidth={isActive ? 2 : 1.5} size={18} />
                <span style={{ 
                  fontSize: '13.5px', 
                  fontFamily: 'system-ui, -apple-system, sans-serif', 
                  letterSpacing: '0.03em' 
                }}>
                  {item.label}
                </span>
              </div>
              
              {/* Hover background for inactive items */}
              {!isActive && (
                <div className="absolute inset-0 bg-[#1A2F23] opacity-0 transition-opacity duration-300 group-hover:opacity-5 pointer-events-none" />
              )}
            </Link>
          )
        })}
      </div>

      {/* Forest widget / Sapling Card */}
      <div className="mt-auto pt-6">
        <div 
          className="cursor-pointer group" 
          onClick={() => router.push('/profile')} 
        >
          <div className="flex flex-col gap-3 p-4 rounded-xl transition-all duration-300" style={{
            background: '#F9F8F4', 
            border: '1px solid rgba(0,0,0,0.04)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02), 0 1px 3px rgba(0,0,0,0.02)'
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02), 0 4px 12px rgba(26,47,35,0.08)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(26,47,35,0.1)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02), 0 1px 3px rgba(0,0,0,0.02)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.04)';
          }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: '#1A2F23' }}>
                <div className="rounded-full animate-pulse" style={{ width: '4px', height: '4px', background: '#D1FAE5' }} />
                <span style={{
                  fontSize: '9px', fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '600',
                  color: '#F9F8F4', textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>14 day streak</span>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="flex items-center justify-center relative overflow-hidden rounded-lg transition-transform duration-300 group-hover:scale-105"
                style={{ width: '44px', height: '44px', background: '#F9F8F4', border: '1px solid rgba(26,47,35,0.1)', flexShrink: 0 }}>
                <svg fill="none" height="28" viewBox="0 0 50 70" width="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M25 70V15" stroke="#1A2F23" strokeLinecap="round" strokeWidth="2.5"/>
                  <path d="M25 45Q35 35 38 25" fill="none" stroke="#1A2F23" strokeLinecap="round" strokeWidth="1.5"/>
                  <path d="M25 50Q15 45 12 35" fill="none" stroke="#1A2F23" strokeLinecap="round" strokeWidth="1.5"/>
                  <ellipse cx="25" cy="12" fill="#1A2F23" fillOpacity="0.9" rx="7" ry="14"/>
                  <ellipse cx="38" cy="22" fill="#1A2F23" fillOpacity="0.8" rx="5" ry="10" transform="rotate(45 38 22)"/>
                  <ellipse cx="12" cy="32" fill="#1A2F23" fillOpacity="0.8" rx="5" ry="9" transform="rotate(-30 12 32)"/>
                  <ellipse cx="30" cy="38" fill="#1A2F23" fillOpacity="0.7" rx="4" ry="7" transform="rotate(20 30 38)"/>
                </svg>
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <span style={{ fontSize: '13.5px', fontFamily: 'Georgia, serif', color: '#1A2F23', lineHeight: '1' }}>Sapling</span>
                <div className="w-full rounded-full overflow-hidden" style={{ height: '3px', background: 'rgba(26,47,35,0.1)' }}>
                  <div className="h-full rounded-full relative overflow-hidden" style={{ width: '35%', background: '#1A2F23' }}>
                    <div className="absolute inset-0 w-full h-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(209,250,229,0.4), transparent)', transform: 'translateX(-100%)', animation: 'shimmer 2s infinite' }} />
                  </div>
                </div>
                <span style={{ fontSize: '10px', fontFamily: 'system-ui, -apple-system, sans-serif', color: 'rgba(26,47,35,0.6)' }}>3 days to next</span>
              </div>
            </div>
            <style>{`
              @keyframes shimmer {
                100% { transform: translateX(100%); }
              }
            `}</style>
          </div>
        </div>
      </div>
    </nav>
  )
}
