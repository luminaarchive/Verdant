'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const navItems = [
  { label: 'Home',     icon: 'home',        href: '/' },
  { label: 'Discover', icon: 'explore',     href: '/discover' },
  { label: 'Spaces',   icon: 'folder_open', href: '/spaces' },
  { label: 'History',  icon: 'history',     href: '/history' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav
      className="w-[220px] h-screen fixed left-0 top-0 flex flex-col p-4 flex-shrink-0 z-40"
      style={{ background: '#F5F2EB', borderRight: '1px solid rgba(26,46,26,0.12)' }}
    >
      {/* Logo */}
      <div className="mb-8 px-2">
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '400', color: '#1A2E1A' }}>
          verdant
        </h1>
      </div>

      {/* New Thread button */}
      <button
        onClick={() => router.push('/')}
        className="w-full py-2 px-4 mb-6 flex items-center justify-center gap-2"
        style={{
          background: '#1A2E1A', color: '#F5F2EB', borderRadius: '2px',
          fontSize: '13px', fontFamily: 'system-ui, sans-serif', fontWeight: '500',
          letterSpacing: '0.02em', border: 'none', cursor: 'pointer',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.9'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
        New Thread
      </button>

      {/* Nav items */}
      <div className="flex-grow flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.label === 'Home' && (pathname || '').startsWith('/research'))
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 py-2 transition-colors duration-150"
              style={isActive ? {
                color: '#1A2E1A', fontWeight: '700',
                borderLeft: '2px solid #1A2E1A', paddingLeft: '8px',
                background: '#EDE8DC', borderRadius: '0 2px 2px 0',
              } : {
                color: '#747871', paddingLeft: '16px', paddingRight: '16px',
                borderRadius: '2px',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#EDE8DC' }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
              <span style={{ fontSize: '13px', fontFamily: 'system-ui, sans-serif', fontWeight: '500' }}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Forest widget */}
      <div className="mt-auto pt-4" style={{ borderTop: '1px solid rgba(26,46,26,0.12)' }}>
        <div className="px-2" onClick={() => router.push('/profile')} style={{ cursor: 'pointer' }}>
          <div className="flex flex-col gap-3 p-3 transition-colors duration-150" style={{
            background: '#EDE8DC', border: '1px solid rgba(45,74,45,0.12)', borderRadius: '10px',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#E5DFD0'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#EDE8DC'}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ background: '#1A2E1A' }}>
                <div className="rounded-full" style={{ width: '4px', height: '4px', background: '#E05A3A' }} />
                <span style={{
                  fontSize: '9px', fontFamily: 'system-ui, sans-serif', fontWeight: '600',
                  color: '#F5F2EB', textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>14 day streak</span>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="flex items-center justify-center relative overflow-hidden rounded"
                style={{ width: '48px', height: '48px', background: '#F4F1E8', border: '1px solid rgba(45,74,45,0.35)', flexShrink: 0 }}>
                <svg fill="none" height="35" viewBox="0 0 50 70" width="25" xmlns="http://www.w3.org/2000/svg">
                  <path d="M25 70V15" stroke="#3D6B3D" strokeLinecap="round" strokeWidth="2.5"/>
                  <path d="M25 45Q35 35 38 25" fill="none" stroke="#3D6B3D" strokeLinecap="round" strokeWidth="1.5"/>
                  <path d="M25 50Q15 45 12 35" fill="none" stroke="#3D6B3D" strokeLinecap="round" strokeWidth="1.5"/>
                  <ellipse cx="25" cy="12" fill="#3D6B3D" fillOpacity="0.9" rx="7" ry="14"/>
                  <ellipse cx="38" cy="22" fill="#3D6B3D" fillOpacity="0.8" rx="5" ry="10" transform="rotate(45 38 22)"/>
                  <ellipse cx="12" cy="32" fill="#3D6B3D" fillOpacity="0.8" rx="5" ry="9" transform="rotate(-30 12 32)"/>
                  <ellipse cx="30" cy="38" fill="#3D6B3D" fillOpacity="0.7" rx="4" ry="7" transform="rotate(20 30 38)"/>
                </svg>
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <span style={{ fontSize: '13px', fontFamily: 'Georgia, serif', color: '#1A2E1A', lineHeight: '1' }}>Sapling</span>
                <div className="w-full rounded-full overflow-hidden" style={{ height: '3px', background: 'rgba(45,74,45,0.15)' }}>
                  <div className="h-full rounded-full" style={{ width: '35%', background: '#3D6B3D' }} />
                </div>
                <span style={{ fontSize: '10px', fontFamily: 'system-ui, sans-serif', color: '#747871' }}>3 days to next</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
