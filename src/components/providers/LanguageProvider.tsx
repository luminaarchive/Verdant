'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Language, translations, getLanguagePreference, setLanguagePreference } from '@/lib/i18n/translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: typeof translations['en']
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setLanguageState(getLanguagePreference())
    setMounted(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguagePreference(lang)
    setLanguageState(lang)
  }

  // Always provide the context, even during SSR.
  // The default state is 'en' which will be used for SSR.
  // We use suppressHydrationWarning on the HTML tag in layout to handle the mismatch if the user prefers 'id'.
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
