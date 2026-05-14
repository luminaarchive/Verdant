"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ClipboardCheck } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { SpeciesEvidenceCard } from "./SpeciesEvidenceCard";

const observations = [
  {
    key: "tapanuli",
    id: "DEMO-IDN-KTI-0526-1842",
    scientificName: "Pongo tapanuliensis",
    localName: "Orangutan Tapanuli",
    status: "CR",
    region: "Batang Toru, Sumatera Utara",
  },
  {
    key: "tiger",
    id: "DEMO-IDN-JBI-0526-2107",
    scientificName: "Panthera tigris sumatrae",
    localName: "Harimau Sumatera",
    status: "CR",
    region: "Kerinci Seblat, Jambi",
  },
  {
    key: "komodo",
    id: "DEMO-IDN-NTT-0526-1618",
    scientificName: "Varanus komodoensis",
    localName: "Komodo",
    status: "EN",
    region: "Manggarai Barat, NTT",
  },
];

export function LiveObservationReview() {
  const { t } = useTranslation();
  const [stageIndex, setStageIndex] = useState(0);

  const stages = useMemo(
    () => [
      t("landing.liveReview.stages.media"),
      t("landing.liveReview.stages.candidate"),
      t("landing.liveReview.stages.gbif"),
      t("landing.liveReview.stages.iucn"),
      t("landing.liveReview.stages.review"),
      t("landing.liveReview.stages.saved"),
    ],
    [t],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStageIndex((current) => (current + 1) % stages.length);
    }, 2800);

    return () => window.clearInterval(timer);
  }, [stages.length]);

  const observation = observations[stageIndex % observations.length];

  return (
    <div className="rounded-sm border border-stone-300 bg-stone-100 p-4 shadow-[0_22px_60px_rgba(31,45,32,0.14)] sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-forest-700 text-xs font-semibold tracking-[0.08em] uppercase">
            {t("landing.liveReview.label")}
          </p>
          <p className="text-forest-950 mt-1 text-sm font-semibold">{observation.id}</p>
        </div>
        <span className="text-forest-950 inline-flex items-center gap-1.5 rounded-sm bg-olive-100 px-2.5 py-1 text-xs font-bold">
          <ClipboardCheck className="h-3.5 w-3.5" />
          {t("landing.liveReview.demo")}
        </span>
      </div>

      <SpeciesEvidenceCard
        commonName={observation.localName}
        conservationContext={t(`landing.liveReview.records.${observation.key}.context`)}
        disclaimer={t("landing.liveReview.disclaimer")}
        evidenceType={t(`landing.liveReview.records.${observation.key}.evidence`)}
        priority
        region={observation.region}
        reviewRecommendation={t(`landing.liveReview.records.${observation.key}.review`)}
        scientificName={observation.scientificName}
        sourceLabel={t("landing.liveReview.sourceLabel")}
        status={observation.status}
      />

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 rounded-sm border border-olive-300 bg-olive-100 p-3"
        initial={{ opacity: 0.72, y: 6 }}
        key={stageIndex}
        transition={{ duration: 0.25 }}
      >
        <div className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 text-olive-800" />
          <div>
            <p className="text-forest-950 text-sm font-semibold">{stages[stageIndex]}</p>
            <p className="text-forest-800 mt-1 text-sm leading-6">{t("landing.liveReview.stageContext")}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
