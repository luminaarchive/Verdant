'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { ThemeMode, getThemePreference, setThemePreference, applyThemeClass, getSystemTheme } from '@/config/theme'

interface ThemeContextType {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  activeTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('system')
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const pref = getThemePreference()
    setThemeState(pref)
    setActiveTheme(pref === 'system' ? getSystemTheme() : pref)
    setMounted(true)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (getThemePreference() === 'system') {
        applyThemeClass('system')
        setActiveTheme(getSystemTheme())
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const setTheme = (newTheme: ThemeMode) => {
    setThemePreference(newTheme)
    setThemeState(newTheme)
    applyThemeClass(newTheme)
    setActiveTheme(newTheme === 'system' ? getSystemTheme() : newTheme)
  }

  // Always provide the context, even during SSR.
  return (
    <ThemeContext.Provider value={{ theme, setTheme, activeTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
