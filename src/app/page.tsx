"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Crosshair,
  Database,
  Leaf,
  Lock,
  RefreshCcw,
  SearchCheck,
  ShieldCheck,
  SignalLow,
  Smartphone,
  Users,
  WifiOff,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { LiveObservationResults } from "@/components/landing/LiveObservationResults";
import { LiveObservationReview } from "@/components/landing/LiveObservationReview";
import { PublicSpeciesDemo } from "@/components/landing/PublicSpeciesDemo";
import { useTranslation } from "@/lib/i18n/useTranslation";

const MotionSection = motion.section;

const audience = [
  { key: "rangers" },
  { key: "researchers" },
  { key: "ngos" },
  { key: "students" },
];

const workflow = [
  { key: "input", icon: Camera },
  { key: "candidate", icon: SearchCheck },
  { key: "gbif", icon: Database },
  { key: "iucn", icon: ShieldCheck },
  { key: "review", icon: ShieldCheck },
  { key: "saved", icon: ClipboardCheck },
];

const fieldFeatures = [
  { key: "offline", icon: WifiOff },
  { key: "sync", icon: RefreshCcw },
  { key: "lowConnectivity", icon: SignalLow },
  { key: "pwa", icon: Smartphone },
  { key: "gps", icon: Crosshair },
  { key: "fastId", icon: SearchCheck },
];

const conservationStatuses = [
  { code: "CR", key: "cr", tone: "bg-rare-red text-white" },
  { code: "EN", key: "en", tone: "bg-conservation-orange text-forest-950" },
  { code: "VU", key: "vu", tone: "bg-warning-amber text-forest-950" },
  { code: "NT", key: "nt", tone: "bg-data-cyan text-forest-950" },
  { code: "LC", key: "lc", tone: "bg-olive-600 text-white" },
];

const privacy = ["private", "noFeed", "gps", "signedUrl", "secure"];

const differentiators = ["sources", "status", "memory", "review", "offline", "cases", "bilingual"];

const pricingTiers = ["seeds", "sapling", "forestKeeper"];

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.45, ease: "easeOut" as const, delay },
  };
}

export default function LandingPage() {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="text-forest-950 min-h-screen bg-stone-50 antialiased">
      <header
        className={`sticky top-0 z-50 transition ${
          isScrolled ? "border-b border-stone-300 bg-stone-50/96 shadow-sm backdrop-blur" : "border-b border-transparent bg-stone-50/82 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3" href="/">
            <span className="bg-forest-900 flex h-10 w-10 items-center justify-center rounded-sm text-stone-50">
              <Leaf className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-semibold tracking-[0]">NaLI</span>
              <span className="text-forest-700 hidden text-xs sm:block">Nature Life Intelligence</span>
            </span>
          </Link>
          <nav className="text-forest-700 hidden items-center gap-6 text-sm font-medium md:flex">
            <Link className="hover:text-forest-950" href="#demo">
              {t("nav.demo")}
            </Link>
            <Link className="hover:text-forest-950" href="#workflow">
              {t("nav.workflow")}
            </Link>
            <Link className="hover:text-forest-950" href="#pricing">
              {t("nav.pricing")}
            </Link>
            <Link className="hover:text-forest-950" href="#security">
              {t("nav.security")}
            </Link>
          </nav>
          <div className="hidden sm:block">
            <LanguageSwitcher compact />
          </div>
          <Link
            className="border-forest-300 text-forest-900 hidden min-h-10 items-center gap-2 rounded-sm border bg-stone-50 px-4 text-sm font-semibold transition hover:bg-white sm:inline-flex"
            href="/login"
          >
            {t("common.joinEarlyAccess")}
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main>
        <section className="border-b border-stone-200 bg-[linear-gradient(180deg,#f8f6ef_0%,#eef0e6_100%)]">
          <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-16">
            <motion.div {...fadeUp()} className="max-w-2xl">
              <p className="text-forest-700 mb-4 inline-flex items-center gap-2 rounded-sm border border-olive-300 bg-stone-100 px-3 py-2 text-xs font-semibold tracking-[0.08em] uppercase">
                {t("landing.eyebrow")}
              </p>
              <h1 className="text-forest-950 text-4xl leading-[1.05] font-semibold tracking-[0] sm:text-5xl lg:text-6xl">
                {t("landing.title")}
              </h1>
              <p className="text-forest-800 mt-5 max-w-3xl text-base leading-7 sm:text-lg sm:leading-8 lg:max-w-[42rem]">
                {t("landing.subtitle")}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  className="bg-forest-900 hover:bg-forest-800 inline-flex min-h-12 items-center justify-center rounded-sm px-5 text-sm font-semibold text-stone-50 transition"
                  href="#demo"
                >
                  {t("common.tryDemo")}
                </Link>
                <Link
                  className="border-forest-300 text-forest-900 inline-flex min-h-12 items-center justify-center rounded-sm border bg-stone-50 px-5 text-sm font-semibold transition hover:bg-stone-100"
                  href="/login"
                >
                  {t("common.startIdentifying")}
                </Link>
                <Link
                  className="inline-flex min-h-12 items-center justify-center px-1 text-sm font-semibold text-forest-800 underline-offset-4 transition hover:text-forest-950 hover:underline"
                  href="#workflow"
                >
                  {t("common.viewFieldWorkflow")}
                </Link>
                <div className="sm:hidden">
                  <LanguageSwitcher />
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.08)} className="w-full">
              <LiveObservationReview />
            </motion.div>
          </div>
        </section>

        <PublicSpeciesDemo />

        <MotionSection {...fadeUp()} className="border-b border-stone-200 bg-stone-50 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              kicker={t("landing.audience.kicker")}
              title={t("landing.audience.title")}
              description={t("landing.audience.description")}
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {audience.map((item) => (
                <article className="rounded-sm border border-stone-200 bg-white p-5" key={item.key}>
                  <Users className="mb-4 h-5 w-5 text-olive-700" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-forest-950">{t(`landing.audience.cards.${item.key}.title`)}</h3>
                  <p className="mt-2 text-sm leading-6 text-forest-700">
                    {t(`landing.audience.cards.${item.key}.description`)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </MotionSection>

        <MotionSection {...fadeUp()} className="border-b border-stone-200 bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              kicker={t("landing.difference.kicker")}
              title={t("landing.difference.title")}
              description={t("landing.difference.description")}
            />
            <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {differentiators.map((item) => (
                <article className="rounded-sm border border-stone-200 bg-stone-50 p-5" key={item}>
                  <CheckCircle2 className="mb-4 h-5 w-5 text-olive-700" aria-hidden="true" />
                  <h3 className="text-base font-semibold text-forest-950">
                    {t(`landing.difference.items.${item}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-forest-700">
                    {t(`landing.difference.items.${item}.description`)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </MotionSection>

        <MotionSection
          {...fadeUp()}
          id="workflow"
          className="bg-forest-950 border-b border-stone-200 py-16 text-stone-50"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              dark
              kicker={t("landing.workflow.kicker")}
              title={t("landing.workflow.title")}
              description={t("landing.workflow.description")}
            />
            <div className="mt-9 grid gap-3 lg:grid-cols-6">
              {workflow.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div className="relative rounded-sm border border-stone-50/15 bg-stone-50/6 p-4" key={step.key}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-data-cyan text-xs font-semibold tracking-[0.08em]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <Icon className="text-data-cyan h-5 w-5" aria-hidden="true" />
                    </div>
                    <p className="mt-4 min-h-12 text-sm leading-6 font-semibold">
                      {t(`landing.workflow.steps.${step.key}`)}
                    </p>
                    {step.key === "gbif" || step.key === "iucn" ? (
                      <span className="mt-3 inline-flex rounded-sm border border-data-cyan/40 px-2 py-1 text-[0.68rem] font-semibold text-data-cyan">
                        {step.key.toUpperCase()}
                      </span>
                    ) : null}
                    {index < workflow.length - 1 ? (
                      <ChevronRight className="absolute top-1/2 -right-3 hidden h-5 w-5 -translate-y-1/2 text-stone-400 lg:block" />
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div className="mt-5 grid gap-3 text-sm text-stone-300 sm:grid-cols-3">
              <p className="rounded-sm border border-stone-50/10 p-4">{t("landing.workflow.notes.inputs")}</p>
              <p className="rounded-sm border border-stone-50/10 p-4">{t("landing.workflow.notes.context")}</p>
              <p className="rounded-sm border border-stone-50/10 p-4">{t("landing.workflow.notes.review")}</p>
            </div>
          </div>
        </MotionSection>

        <MotionSection {...fadeUp()} className="border-b border-stone-200 bg-stone-100 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              kicker={t("landing.results.kicker")}
              title={t("landing.results.title")}
              description={t("landing.results.description")}
            />
            <div className="mt-8">
              <LiveObservationResults />
            </div>
          </div>
        </MotionSection>

        <MotionSection {...fadeUp()} id="field" className="border-b border-stone-200 bg-stone-50 py-16">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <SectionHeading
              kicker={t("landing.field.kicker")}
              title={t("landing.field.title")}
              description={t("landing.field.description")}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {fieldFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    className="flex items-center gap-3 rounded-sm border border-stone-200 bg-white p-4"
                    key={feature.key}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-olive-100 text-olive-800">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <p className="font-semibold text-forest-950">{t(`landing.field.features.${feature.key}`)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </MotionSection>

        <MotionSection {...fadeUp()} className="border-b border-stone-200 bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              kicker={t("landing.conservation.kicker")}
              title={t("landing.conservation.title")}
              description={t("landing.conservation.description")}
            />
            <div className="mt-8 grid gap-3 lg:grid-cols-5">
              {conservationStatuses.map((status) => (
                <article className="rounded-sm border border-stone-200 bg-stone-50 p-4" key={status.code}>
                  <span
                    className={`inline-flex h-11 min-w-12 items-center justify-center rounded-sm px-3 text-base font-bold ${status.tone}`}
                  >
                    {status.code}
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-forest-950">
                    {t(`landing.conservation.statuses.${status.key}.label`)}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-forest-700">
                    {t(`landing.conservation.statuses.${status.key}.description`)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </MotionSection>

        <MotionSection
          {...fadeUp()}
          id="security"
          className="bg-forest-900 border-b border-stone-200 py-16 text-stone-50"
        >
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <SectionHeading
              dark
              kicker={t("landing.privacy.kicker")}
              title={t("landing.privacy.title")}
              description={t("landing.privacy.description")}
            />
            <div className="grid gap-3">
              {privacy.map((item, index) => (
                <div
                  className="flex items-center gap-3 rounded-sm border border-stone-50/15 bg-stone-50/7 p-4"
                  key={item}
                >
                  {index === 0 ? (
                    <Lock className="text-data-cyan h-5 w-5" aria-hidden="true" />
                  ) : (
                    <ShieldCheck className="text-data-cyan h-5 w-5" aria-hidden="true" />
                  )}
                  <p className="font-semibold">{t(`landing.privacy.items.${item}`)}</p>
                </div>
              ))}
            </div>
          </div>
        </MotionSection>

        <MotionSection {...fadeUp()} className="border-b border-stone-200 bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <SectionHeading
                kicker={t("landing.trust.kicker")}
                title={t("landing.trust.title")}
                description={t("landing.trust.description")}
              />
              <div className="grid gap-3">
                {["integrated", "ready", "scope"].map((item) => (
                  <div className="rounded-sm border border-stone-200 bg-stone-50 p-4" key={item}>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-olive-700">
                      {t(`landing.trust.sources.${item}.label`)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-forest-800">
                      {t(`landing.trust.sources.${item}.description`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </MotionSection>

        <MotionSection {...fadeUp()} id="pricing" className="border-b border-stone-200 bg-stone-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              kicker={t("landing.pricing.kicker")}
              title={t("landing.pricing.title")}
              description={t("landing.pricing.description")}
            />
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {pricingTiers.map((tier) => (
                <article
                  className={`rounded-sm border p-5 ${
                    tier === "sapling" ? "border-forest-700 bg-white shadow-[0_18px_44px_rgba(31,45,32,0.12)]" : "border-stone-200 bg-white"
                  }`}
                  key={tier}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-forest-950">{t(`landing.pricing.tiers.${tier}.name`)}</h3>
                      <p className="mt-2 text-2xl font-semibold text-forest-950">
                        {t(`landing.pricing.tiers.${tier}.price`)}
                      </p>
                    </div>
                    {tier === "sapling" ? (
                      <span className="rounded-sm bg-warning-amber px-2.5 py-1 text-xs font-bold text-forest-950">
                        {t("landing.pricing.popular")}
                      </span>
                    ) : null}
                  </div>
                  <ul className="mt-5 space-y-3 text-sm leading-6 text-forest-800">
                    {["feature1", "feature2", "feature3", "feature4"].map((feature) => (
                      <li className="flex gap-2" key={feature}>
                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-olive-700" />
                        <span>{t(`landing.pricing.tiers.${tier}.${feature}`)}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-sm border border-forest-300 bg-stone-50 px-4 text-sm font-semibold text-forest-900 transition hover:bg-stone-100"
                    href="/login"
                  >
                    {t("common.joinEarlyAccess")}
                  </Link>
                </article>
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-forest-700">{t("landing.pricing.note")}</p>
          </div>
        </MotionSection>

        <section className="bg-stone-100 py-16">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <motion.div {...fadeUp()}>
              <p className="text-forest-700 text-xs font-semibold tracking-[0.08em] uppercase">
                {t("landing.finalCta.kicker")}
              </p>
              <h2 className="text-forest-950 mt-3 text-3xl font-semibold tracking-[0] sm:text-5xl">
                {t("landing.finalCta.title")}
              </h2>
              <p className="text-forest-800 mx-auto mt-4 max-w-2xl text-base leading-7">
                {t("landing.finalCta.description")}
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  className="bg-forest-900 hover:bg-forest-800 inline-flex min-h-12 items-center justify-center rounded-sm px-5 text-sm font-semibold text-stone-50 transition"
                  href="/login"
                >
                  {t("common.joinEarlyAccess")}
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-forest-950 border-t border-stone-200 px-4 py-8 text-stone-300 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-semibold text-stone-50">NaLI</span> - {t("footer.tagline")}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link className="hover:text-white" href="#demo">
              {t("nav.demo")}
            </Link>
            <Link className="hover:text-white" href="#workflow">
              {t("nav.workflow")}
            </Link>
            <Link className="hover:text-white" href="#pricing">
              {t("nav.pricing")}
            </Link>
            <Link className="hover:text-white" href="#security">
              {t("nav.security")}
            </Link>
            <Link className="hover:text-white" href="/privacy">
              {t("footer.privacy")}
            </Link>
            <Link className="hover:text-white" href="/contact">
              {t("footer.contact")}
            </Link>
          </div>
          <p className="text-xs text-stone-400">{t("footer.builtBy")}</p>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({
  kicker,
  title,
  description,
  dark = false,
}: {
  kicker: string;
  title: string;
  description: string;
  dark?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <p className={`text-xs font-semibold tracking-[0.08em] uppercase ${dark ? "text-data-cyan" : "text-olive-700"}`}>
        {kicker}
      </p>
      <h2
        className={`mt-3 text-3xl leading-tight font-semibold tracking-[0] sm:text-4xl ${
          dark ? "text-stone-50" : "text-forest-950"
        }`}
      >
        {title}
      </h2>
      <p className={`mt-4 text-base leading-7 ${dark ? "text-stone-300" : "text-forest-700"}`}>{description}</p>
    </div>
  );
}
