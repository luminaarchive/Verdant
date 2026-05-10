'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Menu, Clock, LogIn } from 'lucide-react'
import { useAppLayout } from './AppLayout'
import { createClient } from '@/lib/supabase/client'

import { useTheme } from '@/components/providers/ThemeProvider'

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
              padding: '5px 14px',
              fontSize: '12px',
              fontFamily: "'Manrope', system-ui, sans-serif",
              fontWeight: active ? '600' : '400',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              flexShrink: 0,
              position: 'relative',
            }}
            onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(26,47,35,0.05)' }}
            onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            {cat}
            {active && (
              <span style={{
                position: 'absolute',
                bottom: '-1px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: '#D1FAE5',
              }} />
            )}
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
            borderRadius: '20px', padding: '5px 14px',
            fontSize: '12px', fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: cat === 'All' ? '600' : '400',
            letterSpacing: '0.04em', textTransform: 'uppercase',
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
  const { activeTheme, setTheme } = useTheme()
  const [user, setUser] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const supabase = createClient()

    let isMounted = true
    const initialize = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (isMounted) {
          setUser(user)
          setLoading(false)
        }
      } catch {
        if (isMounted) {
          setUser(null)
          setLoading(false)
        }
      }
    }

    initialize()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (!isMounted) return
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  return (
    <header
      className="w-full sticky top-0 z-50 flex items-center gap-3 px-5"
      style={{
        height: '52px',
        background: 'var(--bg-main)',
        borderBottom: 'none',
        boxShadow: 'inset 0 -1px 0 var(--border)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        flexShrink: 0,
      }}
    >
      {/* Mobile hamburger */}
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
          onClick={() => setTheme(activeTheme === 'light' ? 'dark' : 'light')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '4px', borderRadius: '50%', transition: 'color 0.2s, background 0.2s'
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--border-section)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-main)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
          title="Toggle Theme"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            {activeTheme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
        <button
          onClick={() => router.push('/history')}
          style={{
            fontSize: '12px',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: '500',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-strong)',
            padding: '4px 12px',
            borderRadius: '8px',
            background: 'var(--bg-surface)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            letterSpacing: '0.01em',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLElement).style.background = 'var(--green-dark)'
            ;(e.currentTarget as HTMLElement).style.color = '#FFFFFF'
            ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--green-dark)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)'
            ;(e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'
            ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'
          }}
        >
          <Clock size={12} />
          Archive
        </button>

        {!loading && (
          user ? (
            <Link href="/profile" style={{ lineHeight: 0 }}>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  transition: 'color 0.15s, transform 0.2s',
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
          ) : (
            <button
              onClick={() => router.push('/auth')}
              style={{
                fontSize: '12px',
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontWeight: '600',
                color: '#FFFFFF',
                background: '#1A2F23',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.9'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
            >
              <LogIn size={13} />
              Sign In
            </button>
          )
        )}
      </div>
    </header>
  )
}
