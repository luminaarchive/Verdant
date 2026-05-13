// NaLI: Provider Conflict Classification

export type ProviderConflictType =
  | "taxonomy_conflict"
  | "temporal_conflict"
  | "habitat_conflict"
  | "acoustic_conflict";

export type ConflictSeverity = "low" | "moderate" | "high" | "critical";

export interface ProviderConflict {
  type: ProviderConflictType;
  severity: ConflictSeverity;
  reasoning_impact: string;
  escalation_influence: number;
}

export interface ConflictClassificationInput {
  fusion?: {
    conflict_detected?: boolean;
    anomaly_score?: number;
    confidence_factors?: {
      reduced_by?: string[];
      strengthened_by?: string[];
    };
  };
  temporal?: {
    anomaly_score?: number;
    reasoning?: string[];
  } | null;
  habitat?: {
    anomaly_score?: number;
    reasoning?: string[];
  } | null;
}

function clamp(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function severityFromScore(score: number): ConflictSeverity {
  if (score >= 0.85) return "critical";
  if (score >= 0.65) return "high";
  if (score >= 0.35) return "moderate";
  return "low";
}

function hasTerm(values: string[] = [], terms: string[]): boolean {
  const joined = values.join(" ").toLowerCase();
  return terms.some((term) => joined.includes(term));
}

export function classifyProviderConflicts(input: ConflictClassificationInput): ProviderConflict[] {
  const conflicts: ProviderConflict[] = [];
  const reducedBy = input.fusion?.confidence_factors?.reduced_by ?? [];
  const fusionAnomaly = clamp(input.fusion?.anomaly_score ?? 0);

  if (input.fusion?.conflict_detected || hasTerm(reducedBy, ["taxonomic", "taxonomy", "suggests"])) {
    conflicts.push({
      type: "taxonomy_conflict",
      severity: severityFromScore(Math.max(fusionAnomaly, 0.55)),
      reasoning_impact: "Provider taxonomic disagreement reduces confidence and requires synthesis-layer arbitration.",
      escalation_influence: Number(Math.max(0.35, fusionAnomaly).toFixed(2)),
    });
  }

  if (hasTerm(reducedBy, ["audio", "acoustic", "birdnet"])) {
    conflicts.push({
      type: "acoustic_conflict",
      severity: severityFromScore(Math.max(fusionAnomaly, 0.45)),
      reasoning_impact: "Acoustic inference conflicts with another modality and should not independently define truth.",
      escalation_influence: Number(Math.max(0.28, fusionAnomaly * 0.85).toFixed(2)),
    });
  }

  const temporalReasons = input.temporal?.reasoning ?? [];
  const temporalAnomaly = clamp(input.temporal?.anomaly_score ?? 0);
  if (temporalAnomaly >= 0.55 || hasTerm(temporalReasons, ["outside", "conflicts", "rarely observed"])) {
    conflicts.push({
      type: "temporal_conflict",
      severity: severityFromScore(temporalAnomaly),
      reasoning_impact: "Temporal context conflicts with expected seasonal, migration, or activity window.",
      escalation_influence: Number(Math.max(0.25, temporalAnomaly).toFixed(2)),
    });
  }

  const habitatReasons = input.habitat?.reasoning ?? [];
  const habitatAnomaly = clamp(input.habitat?.anomaly_score ?? 0);
  if (habitatAnomaly >= 0.55 || hasTerm(habitatReasons, ["fragmentation", "boundary", "missing"])) {
    conflicts.push({
      type: "habitat_conflict",
      severity: severityFromScore(habitatAnomaly),
      reasoning_impact: "Habitat context increases anomaly probability or contradicts species preference.",
      escalation_influence: Number(Math.max(0.25, habitatAnomaly).toFixed(2)),
    });
  }

  return conflicts;
}
