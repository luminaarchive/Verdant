'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUp, Loader2, Crosshair, FlaskConical, BarChart2 } from 'lucide-react'
import { useLanguage } from '@/components/providers/LanguageProvider'

type SearchMode = 'focus' | 'deep' | 'analytica'

const MODES: { id: SearchMode; icon: React.ElementType; label: string; desc: string }[] = [
  { id: 'focus',     icon: Crosshair,   label: 'Focus',       desc: 'Fast, concise analysis' },
  { id: 'deep',      icon: FlaskConical, label: 'Deep',        desc: 'Thorough multi-source research' },
  { id: 'analytica', icon: BarChart2,   label: 'Analytica',   desc: 'Statistical & data-heavy output' },
]

interface SearchBoxProps {
  autoFocus?: boolean
  compact?: boolean
}

export function SearchBox({ autoFocus = false, compact = false }: SearchBoxProps) {
  const { language, setLanguage, t } = useLanguage()
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<SearchMode>('focus')
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('verdant-search-mode') as SearchMode | null
    if (saved && ['focus', 'deep', 'analytica'].includes(saved)) setMode(saved)
  }, [])

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

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

  const canSubmit = query.trim().length > 0 && !isLoading

  return (
    <div className="w-full" style={{ maxWidth: '680px' }}>
      <div
        style={{
          background: '#FFFFFF',
          border: `1.5px solid ${isFocused ? '#1A2F23' : 'rgba(26,47,35,0.20)'}`,
          borderRadius: '14px',
          padding: compact ? '6px' : '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          boxShadow: isFocused ? '0 0 0 3px rgba(26,47,35,0.06)' : 'var(--shadow-sm)',
        }}
      >
        <textarea
          ref={textareaRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={t.research.newQueryPlaceholder}
          rows={compact ? 1 : 2}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            resize: 'none',
            outline: 'none',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: '15px',
            lineHeight: '1.6',
            color: 'var(--text-main)',
            padding: '8px 10px',
            minHeight: compact ? '40px' : '56px',
          }}
        />

        <div
          className="flex items-center justify-between px-2 pb-1"
          style={{ borderTop: '1px solid var(--border-section)', paddingTop: '6px' }}
        >
          {/* Modes and Language */}
          <div className="flex items-center gap-3">
            {/* Mode Pills */}
            <div className="flex items-center gap-1">
              {MODES.map(m => {
                const isActive = mode === m.id
                const Icon = m.icon
                return (
                  <button
                    key={m.id}
                    onClick={() => handleModeChange(m.id)}
                    title={m.desc}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: '12.5px',
                      fontWeight: isActive ? '600' : '400',
                      background: isActive ? 'rgba(209,250,229,0.5)' : 'transparent',
                      color: isActive ? 'var(--green-dark)' : 'var(--text-muted)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: isActive ? '1px solid rgba(46,93,62,0.15)' : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--border-section)' }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <Icon size={13} strokeWidth={isActive ? 2.2 : 1.8} />
                    {t.research[`${m.id}Mode` as keyof typeof t.research] || m.label}
                  </button>
                )
              })}
            </div>

            {/* Language Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderLeft: '1px solid var(--border)', paddingLeft: '12px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>{t.research.outputLanguage}:</span>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as 'en' | 'id')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '11.5px',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="en">English</option>
                <option value="id">Bahasa Indonesia</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-label="Submit research query"
            style={{
              background: canSubmit ? '#1A2F23' : 'rgba(26,47,35,0.15)',
              color: '#FFFFFF',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              cursor: canSubmit ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease, transform 0.15s ease',
              flexShrink: 0,
            }}
            onMouseEnter={e => { if (canSubmit) (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
          >
            {isLoading
              ? <Loader2 size={15} strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }} />
              : <ArrowUp size={15} strokeWidth={2.5} />
            }
          </button>
        </div>
      </div>

      {/* Hint */}
      {!compact && (
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif", marginTop: '8px', textAlign: 'center' }}>
          Press <kbd style={{ background: 'rgba(26,47,35,0.08)', padding: '1px 5px', borderRadius: '4px', fontSize: '10px' }}>Enter</kbd> to search · <kbd style={{ background: 'rgba(26,47,35,0.08)', padding: '1px 5px', borderRadius: '4px', fontSize: '10px' }}>Shift+Enter</kbd> for new line
        </p>
      )}
    </div>
  )
}
