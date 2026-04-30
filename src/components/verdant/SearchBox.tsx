'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type SearchMode = 'focus' | 'deep' | 'analytica'

const MODES: { id: SearchMode; icon: string; label: string }[] = [
  { id: 'focus',    icon: 'center_focus_strong', label: 'Focus' },
  { id: 'deep',     icon: 'science',             label: 'Deep Research' },
  { id: 'analytica',icon: 'analytics',           label: 'Analytica' },
]

export function SearchBox() {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<SearchMode>('focus')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('verdant-search-mode') as SearchMode | null
    if (saved && ['focus', 'deep', 'analytica'].includes(saved)) setMode(saved)
  }, [])

  const handleModeChange = (m: SearchMode) => {
    setMode(m)
    localStorage.setItem('verdant-search-mode', m)
  }

  const handleSubmit = () => {
    const trimmed = query.trim()
    if (!trimmed || isLoading) return
    setIsLoading(true)
    router.push(`/research?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <div className="w-full" style={{ maxWidth: '660px', marginBottom: '48px' }}>
      <div style={{
        background: '#F5F2EB',
        border: '1.5px solid rgba(45,74,45,0.28)',
        borderRadius: '14px',
        padding: '8px',
        display: 'flex', flexDirection: 'column', gap: '8px',
      }}>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
          placeholder="Begin your inquiry here..."
          rows={2}
          style={{
            width: '100%', background: 'transparent', border: 'none',
            resize: 'none', outline: 'none',
            fontFamily: 'system-ui, sans-serif', fontSize: '15px',
            lineHeight: '1.6', color: '#1b1c1a',
            padding: '8px', minHeight: '60px',
          }}
        />
        <div className="flex items-center justify-between px-2 pb-1 pt-2"
          style={{ borderTop: '1px solid rgba(26,46,26,0.10)' }}>
          <div className="flex items-center gap-2">
            {MODES.map((m) => {
              const isActive = mode === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => handleModeChange(m.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    fontFamily: 'system-ui, sans-serif', fontSize: '13px',
                    background: isActive ? '#b9edb3' : 'transparent',
                    color: isActive ? '#1b1c1a' : '#747871',
                    padding: '2px 8px', borderRadius: '2px', border: 'none',
                    cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{m.icon}</span>
                  {m.label}
                </button>
              )
            })}
          </div>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              background: query.trim() && !isLoading ? '#1A2E1A' : 'rgba(26,46,26,0.2)',
              color: '#ffffff', width: '32px', height: '32px', borderRadius: '50%',
              border: 'none',
              cursor: query.trim() && !isLoading ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
          >
            {isLoading
              ? <span className="material-symbols-outlined" style={{ fontSize: '16px', animation: 'spin 1s linear infinite' }}>progress_activity</span>
              : <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_upward</span>
            }
          </button>
        </div>
      </div>
    </div>
  )
}
