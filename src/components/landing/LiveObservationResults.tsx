"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Clock, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { SpeciesEvidencePanel } from "./SpeciesEvidencePanel";

const records = [
  {
    key: "tapanuli",
    scientific: "Pongo tapanuliensis",
    local: "Orangutan Tapanuli",
    confidence: "92.4%",
    status: "CR",
    region: "Batang Toru, Sumatera Utara",
    time: "14 May 2026, 07:42 WIB",
    review: "expert_validation_recommended",
    tone: "forest" as const,
  },
  {
    key: "tiger",
    scientific: "Panthera tigris sumatrae",
    local: "Harimau Sumatera",
    confidence: "89.1%",
    status: "CR",
    region: "Kerinci Seblat, Jambi",
    time: "14 May 2026, 22:05 WIB",
    review: "automatic_review_required",
    tone: "amber" as const,
  },
  {
    key: "komodo",
    scientific: "Varanus komodoensis",
    local: "Komodo",
    confidence: "91.7%",
    status: "EN",
    region: "Manggarai Barat, NTT",
    time: "14 May 2026, 16:18 WITA",
    review: "routine_archive_safe",
    tone: "earth" as const,
  },
  {
    key: "starling",
    scientific: "Leucopsar rothschildi",
    local: "Jalak Bali",
    confidence: "86.8%",
    status: "CR",
    region: "Bali Barat, Bali",
    time: "14 May 2026, 09:12 WITA",
    review: "expert_validation_recommended",
    tone: "sky" as const,
  },
];

export function LiveObservationResults() {
  const { t } = useTranslation();
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setOffset((value) => (value + 1) % records.length), 4200);
    return () => window.clearInterval(timer);
  }, []);

  const visibleRecords = [0, 1, 2].map((step) => records[(offset + step) % records.length]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="rounded-sm border border-stone-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-forest-700">
          {t("landing.results.demoLabel")}
        </p>
        <p className="text-sm text-forest-700">{t("landing.results.demoDisclosure")}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {visibleRecords.map((item, index) => (
          <motion.article
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-sm border border-stone-300 bg-white"
            initial={{ opacity: 0.7, y: 10 }}
            key={`${item.scientific}-${offset}`}
            transition={{ delay: index * 0.05, duration: 0.25 }}
          >
            <SpeciesEvidencePanel
              caption={t("landing.results.evidencePlaceholder")}
              className="h-48 min-h-48"
              localName={item.local}
              scientificName={item.scientific}
              tone={item.tone}
            />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold italic text-forest-950">{item.scientific}</h3>
                  <p className="text-sm text-forest-700">{item.local}</p>
                </div>
                <span
                  className={`rounded-sm px-2.5 py-1 text-xs font-bold ${
                    item.status === "CR" ? "bg-rare-red text-white" : "bg-conservation-orange text-forest-950"
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <Fact label={t("landing.results.confidence")} value={item.confidence} />
                <Fact label={t("landing.results.trend")} value={t(`landing.results.records.${item.key}.trend`)} />
                <Fact label={t("landing.results.region")} value={item.region} />
                <Fact label={t("landing.results.timestamp")} value={item.time} />
              </div>
              <div className="mt-4 rounded-sm border border-stone-200 bg-stone-50 p-3 text-sm text-forest-800">
                <span className="font-semibold text-forest-950">{t("landing.results.anomalyFlag")}: </span>
                {t(`landing.results.records.${item.key}.anomaly`)}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <Badge icon={<Clock className="h-3.5 w-3.5" />} label={t("landing.results.updatedJustNow")} />
                <Badge icon={<AlertTriangle className="h-3.5 w-3.5" />} label={t(`landing.results.review.${item.review}`)} />
                <Badge icon={<ShieldCheck className="h-3.5 w-3.5" />} label={t("landing.results.protectedRecord")} />
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-stone-200 bg-stone-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-forest-600">{label}</p>
      <p className="mt-1 font-data-sm capitalize leading-5 text-forest-950">{value}</p>
    </div>
  );
}

function Badge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm border border-olive-300 bg-olive-100 px-2 py-1 font-semibold text-forest-800">
      {icon}
      {label}
    </span>
  );
}
