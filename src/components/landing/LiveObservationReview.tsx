"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock, RadioTower } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { SpeciesEvidencePanel } from "./SpeciesEvidencePanel";

const observations = [
  {
    id: "OBS-IDN-KTI-0526-1842",
    scientificName: "Pongo pygmaeus",
    localName: "Orangutan Kalimantan",
    status: "CR",
    confidence: 0.91,
    region: "Kutai, Kalimantan Timur",
    tone: "forest" as const,
    anomaly: true,
  },
  {
    id: "OBS-IDN-JBI-0526-2107",
    scientificName: "Panthera tigris sumatrae",
    localName: "Harimau Sumatera",
    status: "CR",
    confidence: 0.88,
    region: "Kerinci Seblat, Jambi",
    tone: "amber" as const,
    anomaly: true,
  },
  {
    id: "OBS-IDN-NTT-0526-1618",
    scientificName: "Varanus komodoensis",
    localName: "Komodo",
    status: "EN",
    confidence: 0.9,
    region: "Manggarai Barat, NTT",
    tone: "earth" as const,
    anomaly: false,
  },
  {
    id: "OBS-IDN-JWA-0526-0635",
    scientificName: "Spizaetus bartelsi",
    localName: "Elang Jawa",
    status: "EN",
    confidence: 0.84,
    region: "Gunung Halimun Salak, Jawa Barat",
    tone: "sky" as const,
    anomaly: false,
  },
];

export function LiveObservationReview() {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);

  const stages = useMemo(
    () => [
      t("landing.liveReview.stages.media"),
      t("landing.liveReview.stages.candidate"),
      t("landing.liveReview.stages.gbif"),
      t("landing.liveReview.stages.iucn"),
      t("landing.liveReview.stages.anomaly"),
      t("landing.liveReview.stages.ready"),
    ],
    [t],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStageIndex((current) => {
        const next = (current + 1) % stages.length;
        if (next === 0) setIndex((value) => (value + 1) % observations.length);
        return next;
      });
    }, 2400);

    return () => window.clearInterval(timer);
  }, [stages.length]);

  const observation = observations[index];
  const confidence = Math.min(0.97, observation.confidence + stageIndex * 0.008);

  return (
    <div className="overflow-hidden rounded-sm border border-stone-300 bg-stone-100 shadow-[0_22px_60px_rgba(31,45,32,0.14)]">
      <div className="flex items-center justify-between gap-3 border-b border-stone-300 bg-stone-200 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-forest-700">
            {t("landing.liveReview.label")}
          </p>
          <p className="text-sm font-semibold text-forest-950">{observation.id}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-sm bg-olive-100 px-2.5 py-1 text-xs font-bold text-forest-950">
          <RadioTower className="h-3.5 w-3.5" />
          {t("landing.liveReview.demo")}
        </span>
      </div>

      <div className="grid gap-0 md:grid-cols-[0.92fr_1.08fr]">
        <SpeciesEvidencePanel
          caption={t("landing.liveReview.evidencePlaceholder")}
          className="border-b border-stone-300 md:border-b-0 md:border-r"
          localName={observation.localName}
          scientificName={observation.scientificName}
          tone={observation.tone}
        />

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-5"
          initial={{ opacity: 0.72, y: 8 }}
          key={`${observation.id}-${stageIndex}`}
          transition={{ duration: 0.25 }}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-forest-600">
                {t("landing.liveReview.probableSpecies")}
              </p>
              <h2 className="mt-1 text-2xl font-semibold italic text-forest-950">{observation.scientificName}</h2>
              <p className="text-sm text-forest-700">{observation.localName}</p>
            </div>
            <div className="rounded-sm border border-forest-200 bg-stone-50 px-3 py-2 text-right">
              <p className="text-xs text-forest-600">{t("landing.liveReview.confidence")}</p>
              <p className="text-xl font-semibold text-forest-950">{Math.round(confidence * 1000) / 10}%</p>
            </div>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <Fact label={t("landing.liveReview.iucnStatus")} value={observation.status} strong />
            <Fact label={t("landing.liveReview.region")} value={observation.region} />
            <Fact label={t("landing.liveReview.updated")} value={t("landing.liveReview.justNow")} />
            <Fact label={t("landing.liveReview.evidenceType")} value={t("landing.liveReview.evidenceTypeValue")} />
          </div>

          <div className="mt-4 rounded-sm border border-olive-300 bg-olive-100 p-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-olive-800" />
              <div>
                <p className="text-sm font-semibold text-forest-950">{stages[stageIndex]}</p>
                <p className="mt-1 text-sm leading-6 text-forest-800">{t("landing.liveReview.stageContext")}</p>
              </div>
            </div>
          </div>

          {observation.anomaly ? (
            <div className="mt-4 rounded-sm border border-conservation-orange/45 bg-conservation-orange/10 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-conservation-orange" />
                <div>
                  <p className="text-sm font-semibold text-forest-950">{t("landing.liveReview.anomalyTitle")}</p>
                  <p className="mt-1 text-sm leading-6 text-forest-800">{t("landing.liveReview.anomalyDetail")}</p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-forest-700">
            <span className="rounded-sm bg-stone-50 px-2 py-2">{t("landing.liveReview.mediaSigned")}</span>
            <span className="rounded-sm bg-stone-50 px-2 py-2">{t("landing.liveReview.gpsProtected")}</span>
            <span className="rounded-sm bg-stone-50 px-2 py-2">
              <Clock className="mr-1 inline h-3.5 w-3.5" />
              {t("landing.liveReview.syncPending")}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Fact({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-sm border border-stone-200 bg-stone-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-forest-600">{label}</p>
      <p className={`mt-1 leading-5 text-forest-950 ${strong ? "font-semibold" : ""}`}>{value}</p>
    </div>
  );
}
