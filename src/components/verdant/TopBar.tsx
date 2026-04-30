'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const categories = ['All', 'Ecology', 'Biodiversity', 'Botany', 'Mycology', 'Geology', 'Oceanography']

function CategoryPills() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const handleClick = (cat: string) => {
    // Category pills only work on homepage
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
    <nav className="flex items-center gap-1 h-full overflow-x-auto hide-scrollbar">
      {categories.map((cat) => {
        const active = isActive(cat)
        return (
          <button
            key={cat}
            onClick={() => handleClick(cat)}
            style={{
              background: active ? '#1A2F23' : 'transparent',
              color: active ? '#FFFFFF' : '#4A5248',
              borderRadius: '20px', padding: '4px 16px',
              fontSize: '13px', fontFamily: 'system-ui, sans-serif',
              fontWeight: active ? '500' : '400',
              letterSpacing: '0.04em', textTransform: 'uppercase',
              border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(26,46,26,0.06)' }}
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
    <nav className="flex items-center gap-1 h-full">
      {categories.map((cat) => (
        <button key={cat} disabled style={{
          background: cat === 'All' ? '#1A2F23' : 'transparent',
          color: cat === 'All' ? '#FFFFFF' : '#4A5248',
          borderRadius: '20px', padding: '4px 16px',
          fontSize: '13px', fontFamily: 'system-ui, sans-serif',
          fontWeight: cat === 'All' ? '500' : '400',
          letterSpacing: '0.04em', textTransform: 'uppercase',
          border: 'none', cursor: 'default', whiteSpace: 'nowrap',
        }}>{cat}</button>
      ))}
    </nav>
  )
}

export function TopBar() {
  const router = useRouter()

  return (
    <header
      className="w-full sticky top-0 z-50 flex items-center justify-between px-6"
      style={{ height: '48px', background: '#F9F8F4', borderBottom: '1px solid rgba(26,46,26,0.12)' }}
    >
      <Suspense fallback={<CategoryPillsSkeleton />}>
        <CategoryPills />
      </Suspense>

      <div className="flex items-center gap-4" style={{ flexShrink: 0 }}>
        <button
          onClick={() => router.push('/history')}
          style={{
            fontSize: '13px', fontFamily: 'system-ui, sans-serif', color: '#747871',
            border: '1px solid rgba(26,46,26,0.20)', padding: '2px 8px',
            borderRadius: '2px', background: '#FFFFFF', cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#EDE8DC'; (e.currentTarget as HTMLElement).style.color = '#1A2F23' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FFFFFF'; (e.currentTarget as HTMLElement).style.color = '#747871' }}
        >
          GPT-4 Archive
        </button>
        <Link href="/profile" style={{ lineHeight: 0 }}>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#747871', transition: 'opacity 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>account_circle</span>
          </button>
        </Link>
      </div>
    </header>
  )
}
