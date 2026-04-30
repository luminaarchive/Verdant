'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { useAppLayout } from './AppLayout'

const categories = ['All', 'Ecology', 'Biodiversity', 'Botany', 'Mycology', 'Geology', 'Oceanography']

function CategoryPills() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const handleClick = (cat: string) => {
    if (pathname !== '/') { router.push('/'); return }
    router.push(cat === 'All' ? '/' : `/?category=${cat.toLowerCase()}`)
  }

  const isActive = (cat: string) => {
    if (pathname !== '/') return false
    const param = searchParams.get('category')
    if (cat === 'All') return !param || param === 'all'
    return param === cat.toLowerCase()
  }

  return (
    <nav className="flex items-center gap-0.5 h-full overflow-x-auto hide-scrollbar" style={{ flex: 1, minWidth: 0 }}>
      {categories.map(cat => {
        const active = isActive(cat)
        return (
          <button
            key={cat}
            onClick={() => handleClick(cat)}
            style={{
              background: active ? '#1A2F23' : 'transparent',
              color: active ? '#F9F8F4' : 'var(--text-muted)',
              borderRadius: '20px',
              padding: '4px 14px',
              fontSize: '12.5px',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: active ? '600' : '400',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
            onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(26,47,35,0.06)' }}
            onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            {cat}
          </button>
        )
      })}
    </nav>
  )
}

function CategoryPillsSkeleton() {
  return (
    <nav className="flex items-center gap-0.5 h-full" style={{ flex: 1 }}>
      {categories.map(cat => (
        <button
          key={cat}
          disabled
          style={{
            background: cat === 'All' ? '#1A2F23' : 'transparent',
            color: cat === 'All' ? '#F9F8F4' : 'var(--text-muted)',
            borderRadius: '20px', padding: '4px 14px',
            fontSize: '12.5px', fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: cat === 'All' ? '600' : '400',
            letterSpacing: '0.03em', textTransform: 'uppercase',
            border: 'none', cursor: 'default', whiteSpace: 'nowrap',
          }}
        >
          {cat}
        </button>
      ))}
    </nav>
  )
}

export function TopBar() {
  const router = useRouter()
  const { setSidebarOpen } = useAppLayout()

  return (
    <header
      className="w-full sticky top-0 z-50 flex items-center gap-3 px-5"
      style={{
        height: '48px',
        background: 'rgba(249,248,244,0.92)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        flexShrink: 0,
      }}
    >
      {/* Mobile hamburger — hidden on desktop via CSS */}
      <button
        className="topbar-hamburger"
        onClick={() => setSidebarOpen(true)}
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          padding: '4px',
          borderRadius: '6px',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Menu size={20} />
      </button>

      <Suspense fallback={<CategoryPillsSkeleton />}>
        <CategoryPills />
      </Suspense>

      <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>
        <button
          onClick={() => router.push('/history')}
          style={{
            fontSize: '12.5px',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: '500',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-strong)',
            padding: '3px 10px',
            borderRadius: '6px',
            background: '#FFFFFF',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            letterSpacing: '0.01em',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLElement).style.background = '#1A2F23'
            ;(e.currentTarget as HTMLElement).style.color = '#FFFFFF'
            ;(e.currentTarget as HTMLElement).style.borderColor = '#1A2F23'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLElement).style.background = '#FFFFFF'
            ;(e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'
            ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'
          }}
        >
          Archive
        </button>

        <Link href="/profile" style={{ lineHeight: 0 }}>
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              transition: 'color 0.15s, transform 0.15s',
              padding: '2px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLElement).style.color = '#1A2F23'
              ;(e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'
              ;(e.currentTarget as HTMLElement).style.transform = 'scale(1)'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>account_circle</span>
          </button>
        </Link>
      </div>
    </header>
  )
}
