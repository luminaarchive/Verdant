"use client";

import { Languages } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useTranslation();
  const nextLanguage = language === "en" ? "id" : "en";
  const label = language === "en" ? "EN" : "ID";

  return (
    <button
      aria-label={`${t("common.language")}: ${language === "en" ? t("common.english") : t("common.indonesian")}`}
      className={`text-forest-900 inline-flex min-h-10 items-center gap-2 rounded-sm border border-stone-300 bg-stone-50 px-3 text-xs font-semibold tracking-[0.08em] uppercase transition hover:bg-stone-100 ${
        compact ? "px-2" : ""
      }`}
      onClick={() => setLanguage(nextLanguage)}
      type="button"
    >
      <Languages className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
