"use client";

import Link from "next/link";
import { Leaf, ShieldCheck } from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n/useTranslation";

const items = ["observations", "coordinates", "media", "exports"];

export default function PrivacyPage() {
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
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-olive-700">{t("privacyPage.eyebrow")}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[0] text-forest-950">{t("privacyPage.title")}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-forest-700">{t("privacyPage.context")}</p>
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <article className="rounded-sm border border-stone-200 bg-white p-5" key={item}>
              <ShieldCheck className="mb-4 h-5 w-5 text-olive-700" />
              <p className="text-sm leading-6 text-forest-800">{t(`privacyPage.items.${item}`)}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
