// NaLI: Priority Explanation Engine

import type { ProviderConflict } from "@/lib/agent/reasoning/provider-conflicts";

export interface PriorityExplanationInput {
  iucn_status?: string;
  habitat_fragmentation_score?: number;
  repeated_anomaly_cluster?: boolean;
  temporal_anomaly_score?: number;
  occurrence_density_score?: number;
  provider_conflicts?: ProviderConflict[];
}

export function explainConservationPriority(input: PriorityExplanationInput): string[] {
  const explanations: string[] = [];
  const iucn = input.iucn_status?.toUpperCase();

  if (iucn === "CR") {
    explanations.push("Critically endangered overlap increases immediate conservation attention.");
  } else if (iucn === "EN") {
    explanations.push("Endangered species overlap elevates operational significance.");
  }

  if ((input.habitat_fragmentation_score ?? 0) >= 0.65) {
    explanations.push("Fragmented habitat context increases risk and field priority.");
  }

  if (input.repeated_anomaly_cluster) {
    explanations.push("Repeated anomaly cluster suggests a longitudinal ecological pattern.");
  }

  if ((input.temporal_anomaly_score ?? 0) >= 0.6) {
    explanations.push("Strong seasonal inconsistency increases review and escalation priority.");
  }

  if ((input.occurrence_density_score ?? 1) < 0.2) {
    explanations.push("Sparse regional occurrence density increases rarity significance.");
  }

  if (input.provider_conflicts?.some((conflict) => conflict.severity === "high" || conflict.severity === "critical")) {
    explanations.push("High-severity provider conflict prevents direct archival certainty.");
  }

  if (explanations.length === 0) {
    explanations.push("Observation priority remains routine under current ecological signals.");
  }

  return explanations;
}
