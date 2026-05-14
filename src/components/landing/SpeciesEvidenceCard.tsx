"use client";

import { AlertTriangle, ClipboardCheck, Database, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

export type SpeciesEvidenceCardProps = {
  scientificName: string;
  commonName: string;
  status: string;
  region: string;
  evidenceType: string;
  sourceLabel: string;
  reviewRecommendation: string;
  conservationContext?: string;
  disclaimer: string;
};

export function SpeciesEvidenceCard({
  scientificName,
  commonName,
  status,
  region,
  evidenceType,
  sourceLabel,
  reviewRecommendation,
  conservationContext,
  disclaimer,
}: SpeciesEvidenceCardProps) {
  const { t } = useTranslation();

  return (
    <article className="rounded-sm border border-stone-300 bg-stone-50 p-4 text-forest-950 shadow-[0_12px_34px_rgba(31,45,32,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-olive-700">{sourceLabel}</p>
          <h3 className="mt-2 text-xl font-semibold italic leading-tight text-forest-950">{scientificName}</h3>
          <p className="mt-1 text-sm font-medium text-forest-700">{commonName}</p>
        </div>
        <span
          className={`inline-flex h-9 min-w-10 shrink-0 items-center justify-center rounded-sm px-2.5 text-xs font-bold ${
            status === "CR" ? "bg-rare-red text-white" : status === "EN" ? "bg-conservation-orange text-forest-950" : "bg-olive-700 text-white"
          }`}
        >
          {status}
        </span>
      </div>

      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <Field label={t("landing.evidenceCard.distribution")} value={region} />
        <Field label={t("landing.evidenceCard.evidence")} value={evidenceType} />
        <Field label={t("landing.evidenceCard.review")} value={reviewRecommendation} />
        <Field label={t("landing.evidenceCard.status")} value={disclaimer} />
      </dl>

      {conservationContext ? (
        <div className="mt-4 rounded-sm border border-olive-300 bg-olive-50 p-3 text-sm leading-6 text-forest-800">
          <div className="flex items-start gap-2">
            {status === "CR" ? (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-conservation-orange" />
            ) : (
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-olive-800" />
            )}
            <p>{conservationContext}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-forest-800">
        <span className="inline-flex items-center gap-1.5 rounded-sm border border-stone-300 bg-white px-2 py-1">
          <Database className="h-3.5 w-3.5" />
          GBIF
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-sm border border-stone-300 bg-white px-2 py-1">
          <ShieldCheck className="h-3.5 w-3.5" />
          IUCN
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-sm border border-stone-300 bg-white px-2 py-1">
          <ClipboardCheck className="h-3.5 w-3.5" />
          NaLI
        </span>
      </div>
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-stone-200 bg-white p-3">
      <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-forest-600">{label}</dt>
      <dd className="mt-1 text-sm leading-5 text-forest-950">{value}</dd>
    </div>
  );
}
