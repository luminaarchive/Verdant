"use client";

import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { SpeciesEvidenceCard } from "./SpeciesEvidenceCard";

const records = [
  {
    key: "tapanuli",
    scientific: "Pongo tapanuliensis",
    local: "Orangutan Tapanuli",
    status: "CR",
    region: "Batang Toru, Sumatera Utara",
  },
  {
    key: "tiger",
    scientific: "Panthera tigris sumatrae",
    local: "Harimau Sumatera",
    status: "CR",
    region: "Kerinci Seblat, Jambi",
  },
  {
    key: "komodo",
    scientific: "Varanus komodoensis",
    local: "Komodo",
    status: "EN",
    region: "Manggarai Barat, NTT",
  },
];

export function LiveObservationResults() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="rounded-sm border border-stone-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-forest-700">
          {t("landing.results.demoLabel")}
        </p>
        <p className="max-w-2xl text-sm leading-6 text-forest-700">{t("landing.results.demoDisclosure")}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {records.map((item) => (
          <SpeciesEvidenceCard
            commonName={item.local}
            conservationContext={t(`landing.results.records.${item.key}.context`)}
            disclaimer={t("landing.results.disclaimer")}
            evidenceType={t(`landing.results.records.${item.key}.evidence`)}
            key={item.scientific}
            region={item.region}
            reviewRecommendation={t(`landing.results.records.${item.key}.review`)}
            scientificName={item.scientific}
            sourceLabel={t("landing.results.sourceLabel")}
            status={item.status}
          />
        ))}
      </div>

      <div className="mt-4 grid gap-3 text-sm text-forest-800 md:grid-cols-2">
        <p className="flex items-start gap-2 rounded-sm border border-stone-300 bg-white p-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-olive-800" />
          {t("landing.results.auditNote")}
        </p>
        <p className="flex items-start gap-2 rounded-sm border border-stone-300 bg-white p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-conservation-orange" />
          {t("landing.results.reviewNote")}
        </p>
      </div>
    </div>
  );
}
