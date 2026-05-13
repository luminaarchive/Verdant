// NaLI: Conservation Priority Engine

export type ConservationPriorityCategory =
  | "High Conservation Attention"
  | "Elevated Ecological Significance"
  | "Routine Observation";

export interface ConservationPriorityInput {
  iucn_status?: string;
  rarity_score?: number;
  occurrence_density_score?: number;
  habitat_fragility_score?: number;
  anomaly_severity_score?: number;
  reviewer_escalation_score?: number;
  regional_conservation_sensitivity?: number;
}

export interface ConservationPriorityResult {
  priority_score: number;
  category: ConservationPriorityCategory;
  escalation_recommended: boolean;
  reasoning: string[];
}

const IUCN_WEIGHT: Record<string, number> = {
  EX: 1,
  EW: 1,
  CR: 0.98,
  EN: 0.88,
  VU: 0.72,
  NT: 0.48,
  LC: 0.12,
  DD: 0.55,
  NE: 0.35,
};

function clamp(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function round(value: number): number {
  return Number(value.toFixed(2));
}

export function calculateConservationPriority(
  input: ConservationPriorityInput
): ConservationPriorityResult {
  const iucnStatus = input.iucn_status?.toUpperCase() ?? "NE";
  const iucnRisk = IUCN_WEIGHT[iucnStatus] ?? 0.35;
  const rarity = clamp(input.rarity_score ?? (1 - clamp(input.occurrence_density_score ?? 0.5)));
  const occurrenceRarity = 1 - clamp(input.occurrence_density_score ?? 0.5);
  const habitatFragility = clamp(input.habitat_fragility_score ?? 0.4);
  const anomalySeverity = clamp(input.anomaly_severity_score ?? 0);
  const reviewerEscalation = clamp(input.reviewer_escalation_score ?? 0);
  const regionalSensitivity = clamp(input.regional_conservation_sensitivity ?? 0.4);

  const score = clamp(
    iucnRisk * 0.26 +
    rarity * 0.16 +
    occurrenceRarity * 0.12 +
    habitatFragility * 0.18 +
    anomalySeverity * 0.14 +
    reviewerEscalation * 0.08 +
    regionalSensitivity * 0.06
  );
  const category: ConservationPriorityCategory = score >= 0.72
    ? "High Conservation Attention"
    : score >= 0.42
      ? "Elevated Ecological Significance"
      : "Routine Observation";
  const reasoning: string[] = [];

  if (iucnRisk >= 0.72) {
    reasoning.push(`IUCN status ${iucnStatus} elevates conservation attention.`);
  }

  if (habitatFragility >= 0.65) {
    reasoning.push("Habitat fragility increases operational significance.");
  }

  if (anomalySeverity >= 0.6) {
    reasoning.push("Anomaly severity supports reviewer escalation.");
  }

  if (occurrenceRarity >= 0.7) {
    reasoning.push("Sparse regional occurrence density increases rarity weighting.");
  }

  if (reasoning.length === 0) {
    reasoning.push("No high-risk conservation signal dominates this observation.");
  }

  return {
    priority_score: round(score),
    category,
    escalation_recommended: category !== "Routine Observation" || reviewerEscalation >= 0.5,
    reasoning,
  };
}
