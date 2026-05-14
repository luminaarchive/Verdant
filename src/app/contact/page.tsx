"use client";

import Link from "next/link";
import { Leaf, Mail } from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function ContactPage() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-stone-50 text-forest-950">
      <header className="border-b border-stone-200 bg-stone-50">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link className="flex items-center gap-3" href="/">
            <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-forest-900 text-stone-50">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="font-semibold">NaLI</span>
          </Link>
          <LanguageSwitcher compact />
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-olive-700">{t("contactPage.eyebrow")}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[0] text-forest-950">{t("contactPage.title")}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-forest-700">{t("contactPage.context")}</p>
        <div className="mt-8 rounded-sm border border-stone-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <Mail className="mt-1 h-5 w-5 text-olive-700" />
            <p className="text-sm leading-6 text-forest-800">{t("contactPage.note")}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
