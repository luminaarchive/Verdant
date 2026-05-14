"use client";

import { createContext, useEffect, useMemo, useState } from "react";
import {
  defaultLanguage,
  getDictionary,
  isLanguage,
  languageCookieName,
  translate,
  type Language,
  type TranslationDictionary,
} from ".";

type I18nContextValue = {
  language: Language;
  dictionary: TranslationDictionary;
  setLanguage: (language: Language) => void;
  t: (key: string, fallback?: string) => string;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  initialLanguage = defaultLanguage,
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  useEffect(() => {
    const stored = window.localStorage.getItem(languageCookieName);
    if (isLanguage(stored) && stored !== language) {
      setLanguageState(stored);
    }
  }, [language]);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(languageCookieName, nextLanguage);
    document.cookie = `${languageCookieName}=${nextLanguage}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = nextLanguage;
    window.location.reload();
  };

  const dictionary = getDictionary(language);
  const value = useMemo<I18nContextValue>(
    () => ({
      dictionary,
      language,
      setLanguage,
      t: (key, fallback) => translate(dictionary, key, fallback),
    }),
    [dictionary, language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
