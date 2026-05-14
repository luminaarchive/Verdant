import { latLngToCell } from "h3-js";

export type H3AnomalyFlagType = "first_record_in_grid" | "unusual_activity" | "high_priority_verify";
export type H3AnomalySeverity = "low" | "medium" | "high" | "critical";

export type H3AnomalyFlag = {
  flagType: H3AnomalyFlagType;
  severity: H3AnomalySeverity;
  reason: string;
  baselineWindowMonths: number;
  h3Cell: string;
};

export type H3AnomalyInput = {
  sameSpeciesInGridLast12Months: number;
  currentMonthCount: number;
  monthlyAverage: number;
  iucnStatus?: string | null;
  h3Cell: string;
};

const HIGH_PRIORITY_STATUSES = new Set(["CR", "EN"]);

export function assignH3Cell(latitude: number, longitude: number, resolution = 7) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Latitude and longitude are required to assign an H3 cell.");
  }

  return latLngToCell(latitude, longitude, resolution);
}

export function evaluateH3AnomalyFlags(input: H3AnomalyInput): H3AnomalyFlag[] {
  const flags: H3AnomalyFlag[] = [];
  const status = (input.iucnStatus ?? "").toUpperCase();

  if (input.sameSpeciesInGridLast12Months === 0) {
    flags.push({
      flagType: "first_record_in_grid",
      severity: HIGH_PRIORITY_STATUSES.has(status) ? "high" : "medium",
      reason: "No same-species NaLI records were found in this H3 grid during the last 12 months.",
      baselineWindowMonths: 12,
      h3Cell: input.h3Cell,
    });
  }

  if (input.monthlyAverage > 0 && input.currentMonthCount >= Math.max(4, input.monthlyAverage * 3)) {
    flags.push({
      flagType: "unusual_activity",
      severity: HIGH_PRIORITY_STATUSES.has(status) ? "high" : "medium",
      reason: "Current-month observations are materially above NaLI's available 12-month grid baseline.",
      baselineWindowMonths: 12,
      h3Cell: input.h3Cell,
    });
  }

  if (status === "CR" && input.sameSpeciesInGridLast12Months === 0) {
    flags.push({
      flagType: "high_priority_verify",
      severity: "critical",
      reason: "Critically Endangered species with no same-grid NaLI baseline should enter priority human review.",
      baselineWindowMonths: 12,
      h3Cell: input.h3Cell,
    });
  }

  return flags;
}

export const h3AnomalyDisclaimer = {
  en: "Flags are based on NaLI's available records. Accuracy improves as more observations are submitted.",
  id: "Flag ini berdasarkan catatan NaLI yang tersedia. Akurasi meningkat seiring bertambahnya observasi.",
};
