"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Camera,
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

const MotionSection = motion.section;

const audience = [
  {
    title: "Rangers",
    description: "Rapid species checks, GPS capture, and patrol-ready anomaly notes.",
  },
  {
    title: "Researchers",
    description: "Structured observations aligned with scientific review workflows.",
  },
  {
    title: "Conservation NGOs",
    description: "Secure field records for habitat monitoring and intervention planning.",
  },
  {
    title: "Biology Students",
    description: "Guided identification practice with scientific names and status context.",
  },
];

const workflow = [
  { label: "Photo / Audio / Text", icon: Camera },
  { label: "AI Species Identification", icon: SearchCheck },
  { label: "GBIF Distribution Cross-check", icon: Database },
  { label: "IUCN Conservation Analysis", icon: ShieldCheck },
  { label: "Anomaly Detection", icon: AlertTriangle },
  { label: "Structured Field Log Saved", icon: ClipboardCheck },
];

const observations = [
  {
    image:
      "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=900&q=80",
    scientific: "Pongo pygmaeus",
    local: "Orangutan Kalimantan",
    confidence: "94.2%",
    status: "CR",
    trend: "Decreasing",
    anomaly: "Outside last confirmed corridor",
    region: "Kutai, East Kalimantan",
    time: "13 May 2026, 07:42 WITA",
  },
  {
    image:
      "https://images.unsplash.com/photo-1598755257130-c2aaca1f061c?auto=format&fit=crop&w=900&q=80",
    scientific: "Varanus komodoensis",
    local: "Komodo",
    confidence: "91.7%",
    status: "EN",
    trend: "Stable in monitored zones",
    anomaly: "None detected",
    region: "Manggarai Barat, NTT",
    time: "12 May 2026, 16:18 WITA",
  },
  {
    image:
      "https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?auto=format&fit=crop&w=900&q=80",
    scientific: "Panthera tigris sumatrae",
    local: "Harimau Sumatera",
    confidence: "88.9%",
    status: "CR",
    trend: "Decreasing",
    anomaly: "Human settlement proximity",
    region: "Kerinci Seblat, Jambi",
    time: "10 May 2026, 22:05 WIB",
  },
];

const fieldFeatures = [
  { title: "Offline lite mode", icon: WifiOff },
  { title: "Auto sync", icon: RefreshCcw },
  { title: "Low connectivity workflow", icon: SignalLow },
  { title: "Android PWA", icon: Smartphone },
  { title: "GPS logging", icon: Crosshair },
  { title: "Fast field identification", icon: SearchCheck },
];

const conservationStatuses = [
  {
    code: "CR",
    label: "Critically Endangered",
    tone: "bg-rare-red text-white",
    description: "Extremely high risk of extinction in the wild. Location access must be protected.",
  },
  {
    code: "EN",
    label: "Endangered",
    tone: "bg-conservation-orange text-forest-950",
    description: "Very high extinction risk. Records should support intervention and habitat decisions.",
  },
  {
    code: "VU",
    label: "Vulnerable",
    tone: "bg-warning-amber text-forest-950",
    description: "High risk without continued monitoring, pressure assessment, and habitat protection.",
  },
  {
    code: "NT",
    label: "Near Threatened",
    tone: "bg-data-cyan text-forest-950",
    description: "Close to threatened thresholds. Trend changes deserve early attention.",
  },
  {
    code: "LC",
    label: "Least Concern",
    tone: "bg-olive-600 text-white",
    description: "Lower extinction risk, still valuable for distribution and seasonal behavior records.",
  },
];

const privacy = [
  "Private field observations by default",
  "No public social feed",
  "GPS protection for endangered species",
  "Signed URL access for media evidence",
  "Secure scientific data handling",
];

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.45, ease: "easeOut" as const, delay },
  };
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-forest-950 antialiased">
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-stone-50/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3" href="/">
            <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-forest-900 text-stone-50">
              <Leaf className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-semibold tracking-[0]">NaLI</span>
              <span className="hidden text-xs text-forest-700 sm:block">
                Nature Life Intelligence
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-forest-700 md:flex">
            <Link className="hover:text-forest-950" href="#workflow">
              Workflow
            </Link>
            <Link className="hover:text-forest-950" href="#field">
              Field Use
            </Link>
            <Link className="hover:text-forest-950" href="#security">
              Security
            </Link>
          </nav>
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-sm bg-forest-900 px-4 text-sm font-semibold text-stone-50 transition hover:bg-forest-800"
            href="/login"
          >
            Start Identifying
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main>
        <section className="border-b border-stone-200 bg-[linear-gradient(180deg,#f8f6ef_0%,#eef0e6_100%)]">
          <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-16">
            <motion.div {...fadeUp()} className="max-w-2xl">
              <p className="mb-4 inline-flex items-center gap-2 rounded-sm border border-olive-300 bg-stone-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-forest-700">
                Wildlife field intelligence for Indonesia
              </p>
              <h1 className="text-4xl font-semibold leading-[1.05] tracking-[0] text-forest-950 sm:text-5xl lg:text-6xl">
                Identify Species. Log Observations. Detect Ecological Anomalies.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-forest-800 sm:text-lg">
                NaLI helps rangers, researchers, and conservation teams identify wildlife
                species from photos, audio, and text observations while automatically
                generating structured scientific field logs.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  className="inline-flex min-h-12 items-center justify-center rounded-sm bg-forest-900 px-5 text-sm font-semibold text-stone-50 transition hover:bg-forest-800"
                  href="/login"
                >
                  Start Identifying
                </Link>
                <Link
                  className="inline-flex min-h-12 items-center justify-center rounded-sm border border-forest-300 bg-stone-50 px-5 text-sm font-semibold text-forest-900 transition hover:bg-stone-100"
                  href="#workflow"
                >
                  View Field Workflow
                </Link>
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.08)} className="w-full">
              <div className="overflow-hidden rounded-sm border border-stone-300 bg-stone-100 shadow-[0_22px_60px_rgba(31,45,32,0.14)]">
                <div className="flex items-center justify-between border-b border-stone-300 bg-stone-200 px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-forest-700">
                      Observation review
                    </p>
                    <p className="text-sm font-semibold text-forest-950">OBS-IDN-KTI-0526-1842</p>
                  </div>
                  <span className="rounded-sm bg-warning-amber px-2.5 py-1 text-xs font-bold text-forest-950">
                    Anomaly
                  </span>
                </div>
                <div className="grid gap-0 md:grid-cols-[0.92fr_1.08fr]">
                  <div className="relative min-h-72 border-b border-stone-300 md:border-b-0 md:border-r">
                    <Image
                      alt="Orangutan observation in a forest canopy"
                      className="object-cover"
                      fill
                      priority
                      sizes="(min-width: 768px) 38vw, 100vw"
                      src="https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=1000&q=80"
                    />
                    <div className="absolute left-3 top-3 rounded-sm bg-forest-950/80 px-3 py-2 text-xs font-medium text-stone-50">
                      Uploaded photo
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-forest-600">
                          Probable species
                        </p>
                        <h2 className="mt-1 text-2xl font-semibold italic text-forest-950">
                          Pongo pygmaeus
                        </h2>
                        <p className="text-sm text-forest-700">Orangutan Kalimantan</p>
                      </div>
                      <div className="rounded-sm border border-forest-200 bg-stone-50 px-3 py-2 text-right">
                        <p className="text-xs text-forest-600">Confidence</p>
                        <p className="text-xl font-semibold text-forest-950">94.2%</p>
                      </div>
                    </div>

                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                      <Fact label="IUCN status" value="CR - Critically Endangered" strong />
                      <Fact label="GPS snippet" value="0.53 N, 117.48 E" />
                      <Fact label="Timestamp" value="13 May 2026, 07:42 WITA" />
                      <Fact label="Evidence type" value="Photo + ranger note" />
                    </div>

                    <div className="mt-4 rounded-sm border border-conservation-orange/45 bg-conservation-orange/10 p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 text-conservation-orange" />
                        <div>
                          <p className="text-sm font-semibold text-forest-950">
                            Distribution anomaly flagged
                          </p>
                          <p className="mt-1 text-sm leading-6 text-forest-800">
                            Observation is outside the latest confirmed GBIF corridor and
                            should be reviewed before export.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-forest-700">
                      <span className="rounded-sm bg-stone-50 px-2 py-2">Media signed URL</span>
                      <span className="rounded-sm bg-stone-50 px-2 py-2">GPS protected</span>
                      <span className="rounded-sm bg-stone-50 px-2 py-2">Sync pending</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <MotionSection {...fadeUp()} className="border-b border-stone-200 bg-stone-50 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              kicker="Built for"
              title="Field teams who need usable evidence, not spectacle."
              description="NaLI is shaped for repeat observation work across patrols, surveys, research trips, and classroom field practice."
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {audience.map((item) => (
                <article
                  className="rounded-sm border border-stone-200 bg-white p-5"
                  key={item.title}
                >
                  <Users className="mb-4 h-5 w-5 text-olive-700" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-forest-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-forest-700">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </MotionSection>

        <MotionSection
          {...fadeUp()}
          id="workflow"
          className="border-b border-stone-200 bg-forest-950 py-16 text-stone-50"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              dark
              kicker="How NaLI works"
              title="A traceable observation pipeline from field evidence to saved log."
              description="Every step is visible enough for review, correction, and scientific handoff."
            />
            <div className="mt-9 grid gap-3 lg:grid-cols-6">
              {workflow.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    className="relative rounded-sm border border-stone-50/15 bg-stone-50/6 p-4"
                    key={step.label}
                  >
                    <Icon className="h-5 w-5 text-data-cyan" aria-hidden="true" />
                    <p className="mt-4 min-h-12 text-sm font-semibold leading-6">{step.label}</p>
                    {index < workflow.length - 1 ? (
                      <ChevronRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-stone-400 lg:block" />
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div className="mt-5 grid gap-3 text-sm text-stone-300 sm:grid-cols-3">
              <p className="rounded-sm border border-stone-50/10 p-4">
                Inputs stay attached to their observation record for later verification.
              </p>
              <p className="rounded-sm border border-stone-50/10 p-4">
                GBIF and IUCN checks create context, not hidden final authority.
              </p>
              <p className="rounded-sm border border-stone-50/10 p-4">
                Anomaly flags remain reviewable before reports are exported.
              </p>
            </div>
          </div>
        </MotionSection>

        <MotionSection {...fadeUp()} className="border-b border-stone-200 bg-stone-100 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              kicker="Observation results"
              title="Result cards designed for review in the field."
              description="Readable names, status, confidence, place, time, and warning state are visible without digging through menus."
            />
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {observations.map((item) => (
                <article
                  className="overflow-hidden rounded-sm border border-stone-300 bg-white"
                  key={item.scientific}
                >
                  <div className="relative h-48 w-full">
                    <Image
                      alt={`${item.local} field observation`}
                      className="object-cover"
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      src={item.image}
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold italic text-forest-950">
                          {item.scientific}
                        </h3>
                        <p className="text-sm text-forest-700">{item.local}</p>
                      </div>
                      <span
                        className={`rounded-sm px-2.5 py-1 text-xs font-bold ${
                          item.status === "CR"
                            ? "bg-rare-red text-white"
                            : "bg-conservation-orange text-forest-950"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                      <Fact label="Confidence" value={item.confidence} />
                      <Fact label="Trend" value={item.trend} />
                      <Fact label="GPS region" value={item.region} />
                      <Fact label="Timestamp" value={item.time} />
                    </div>
                    <div className="mt-4 rounded-sm border border-stone-200 bg-stone-50 p-3 text-sm text-forest-800">
                      <span className="font-semibold text-forest-950">Anomaly flag: </span>
                      {item.anomaly}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </MotionSection>

        <MotionSection
          {...fadeUp()}
          id="field"
          className="border-b border-stone-200 bg-stone-50 py-16"
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <SectionHeading
              kicker="Built for the field"
              title="Designed for Android devices, interrupted signal, and real patrol pacing."
              description="The interface keeps the essential capture and review path usable when teams are moving, tired, wet, or offline."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {fieldFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    className="flex items-center gap-3 rounded-sm border border-stone-200 bg-white p-4"
                    key={feature.title}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-olive-100 text-olive-800">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <p className="font-semibold text-forest-950">{feature.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </MotionSection>

        <MotionSection {...fadeUp()} className="border-b border-stone-200 bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              kicker="Conservation status"
              title="IUCN categories are shown as ecological context, not decoration."
              description="NaLI surfaces conservation risk clearly so teams can prioritize verification, privacy, and response."
            />
            <div className="mt-8 grid gap-3 lg:grid-cols-5">
              {conservationStatuses.map((status) => (
                <article
                  className="rounded-sm border border-stone-200 bg-stone-50 p-4"
                  key={status.code}
                >
                  <span
                    className={`inline-flex h-11 min-w-12 items-center justify-center rounded-sm px-3 text-base font-bold ${status.tone}`}
                  >
                    {status.code}
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-forest-950">{status.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-forest-700">{status.description}</p>
                </article>
              ))}
            </div>
          </div>
        </MotionSection>

        <MotionSection
          {...fadeUp()}
          id="security"
          className="border-b border-stone-200 bg-forest-900 py-16 text-stone-50"
        >
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <SectionHeading
              dark
              kicker="Privacy and security"
              title="Sensitive ecological records are treated as protected field data."
              description="NaLI avoids public feed mechanics and keeps high-risk coordinates under controlled access."
            />
            <div className="grid gap-3">
              {privacy.map((item, index) => (
                <div
                  className="flex items-center gap-3 rounded-sm border border-stone-50/15 bg-stone-50/7 p-4"
                  key={item}
                >
                  {index === 0 ? (
                    <Lock className="h-5 w-5 text-data-cyan" aria-hidden="true" />
                  ) : (
                    <ShieldCheck className="h-5 w-5 text-data-cyan" aria-hidden="true" />
                  )}
                  <p className="font-semibold">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </MotionSection>

        <section className="bg-stone-100 py-16">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <motion.div {...fadeUp()}>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-forest-700">
                NaLI field intelligence
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[0] text-forest-950 sm:text-5xl">
                Built for Real Field Observation.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-forest-800">
                Start with identification, keep the evidence structured, and give
                conservation teams records they can trust when conditions are imperfect.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  className="inline-flex min-h-12 items-center justify-center rounded-sm bg-forest-900 px-5 text-sm font-semibold text-stone-50 transition hover:bg-forest-800"
                  href="/login"
                >
                  Start Identifying
                </Link>
                <Link
                  className="inline-flex min-h-12 items-center justify-center rounded-sm border border-forest-300 bg-stone-50 px-5 text-sm font-semibold text-forest-900 transition hover:bg-stone-50"
                  href="#workflow"
                >
                  View Field Workflow
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200 bg-forest-950 px-4 py-8 text-stone-300 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-semibold text-stone-50">NaLI</span> - Nature Life
            Intelligence and Human Assistance
          </p>
          <div className="flex flex-wrap gap-4">
            <Link className="hover:text-white" href="#workflow">
              Workflow
            </Link>
            <Link className="hover:text-white" href="#field">
              Field Use
            </Link>
            <Link className="hover:text-white" href="#security">
              Security
            </Link>
          </div>
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
      <p
        className={`text-xs font-semibold uppercase tracking-[0.08em] ${
          dark ? "text-data-cyan" : "text-olive-700"
        }`}
      >
        {kicker}
      </p>
      <h2
        className={`mt-3 text-3xl font-semibold leading-tight tracking-[0] sm:text-4xl ${
          dark ? "text-stone-50" : "text-forest-950"
        }`}
      >
        {title}
      </h2>
      <p className={`mt-4 text-base leading-7 ${dark ? "text-stone-300" : "text-forest-700"}`}>
        {description}
      </p>
    </div>
  );
}

function Fact({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="rounded-sm border border-stone-200 bg-stone-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-forest-600">{label}</p>
      <p className={`mt-1 leading-5 text-forest-950 ${strong ? "font-semibold" : ""}`}>{value}</p>
    </div>
  );
}
