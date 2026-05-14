export type PatrolPlannerContext = {
  latestObservationCount: number;
  unresolvedAnomalyCount: number;
  threatEventCount: number;
  staleGridCount: number;
  highPriorityCaseCount: number;
};

export type PatrolPriority = {
  targetArea: string;
  reason: string;
  bestTimeWindow: string;
  cautionNotes: string;
};

type PatrolLanguage = "en" | "id";

export function buildDeterministicPatrolPlan(
  context: PatrolPlannerContext,
  language: PatrolLanguage = "en",
): PatrolPriority[] {
  const priorities: PatrolPriority[] = [];
  const isId = language === "id";

  if (context.unresolvedAnomalyCount > 0 || context.highPriorityCaseCount > 0) {
    priorities.push({
      targetArea: isId ? "Grid anomali prioritas tinggi" : "High-priority anomaly grids",
      reason: isId
        ? `${context.unresolvedAnomalyCount} flag anomali belum selesai dan ${context.highPriorityCaseCount} kasus prioritas tinggi perlu ditinjau.`
        : `${context.unresolvedAnomalyCount} unresolved anomaly flags and ${context.highPriorityCaseCount} high-priority cases need review.`,
      bestTimeWindow: isId
        ? "Jendela patroli berikutnya saat peninjau tersedia"
        : "Next patrol window with reviewer availability",
      cautionNotes: isId
        ? "Lindungi koordinat tepat untuk spesies CR/EN dan konfirmasi keselamatan lapangan sebelum penugasan."
        : "Protect exact coordinates for CR/EN species and confirm field safety before dispatch.",
    });
  }

  if (context.threatEventCount > 0) {
    priorities.push({
      targetArea: isId ? "Area tumpang tindih pulsa ancaman" : "Threat pulse overlap areas",
      reason: isId
        ? `${context.threatEventCount} kejadian ancaman terbaru tumpang tindih dengan konteks operasi NaLI yang tersedia.`
        : `${context.threatEventCount} recent threat events overlap the available NaLI operating context.`,
      bestTimeWindow: isId ? "Dalam 24-72 jam saat akses aman" : "Within 24-72 hours when access is safe",
      cautionNotes: isId
        ? "Pulsa ancaman bersifat indikatif dan harus diperiksa bersama pimpinan lapangan."
        : "Threat pulse is indicative and must be cross-checked with field leadership.",
    });
  }

  priorities.push({
    targetArea: isId ? "Grid observasi dengan cakupan rendah" : "Low-coverage observation grids",
    reason: isId
      ? `${context.staleGridCount} grid belum menerima observasi terbaru; cakupan memperbaiki kualitas riwayat lokasi.`
      : `${context.staleGridCount} grids have not received recent observations; coverage improves location memory quality.`,
    bestTimeWindow: isId ? "Perencanaan rute patroli rutin" : "Routine patrol route planning",
    cautionNotes: isId ? "Persetujuan rute manual tetap diperlukan." : "Manual route approval remains required.",
  });

  return priorities.slice(0, 3);
}

export const patrolPlannerDisclaimer = {
  en: "These recommendations are generated from available NaLI data. Final operational decisions remain with rangers and field leadership.",
  id: "Rekomendasi ini dihasilkan dari data NaLI yang tersedia. Keputusan operasional akhir tetap berada pada ranger dan pimpinan lapangan.",
};
