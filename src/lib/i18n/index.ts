import { en } from "./translations/en";
import { id } from "./translations/id";

export const languages = ["en", "id"] as const;
export type Language = (typeof languages)[number];

export const defaultLanguage: Language = "en";
export const languageCookieName = "nali_lang";

export const dictionaries = {
  en,
  id,
} as const;

export type TranslationDictionary = Record<string, unknown>;

export function isLanguage(value: string | undefined | null): value is Language {
  return value === "en" || value === "id";
}

export function getDictionary(language: string | undefined | null): TranslationDictionary {
  return dictionaries[isLanguage(language) ? language : defaultLanguage];
}

export function translate(dictionary: TranslationDictionary, key: string, fallback?: string): string {
  const value = key.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, dictionary);

  return typeof value === "string" ? value : (fallback ?? key);
}
