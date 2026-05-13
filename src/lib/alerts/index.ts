// NaLI: Ecological Alert Engine

import type { LongitudinalPattern } from "@/lib/agent/reasoning/pattern-detection";

export type EcologicalAlertType =
  | "repeated_endangered_detection"
  | "escalating_anomaly_cluster"
  | "habitat_conflict_increase"
  | "migration_disruption_pattern"
  | "ecological_instability_indicator";

export interface EcologicalAlert {
  id: string;
  alert_type: EcologicalAlertType;
  severity: LongitudinalPattern["severity"];
  region_key: string;
  evidence_pattern_ids: string[];
  evidence_observation_ids: string[];
  operational_summary: string;
  generated_at: string;
}

function alertTypeFor(pattern: LongitudinalPattern): EcologicalAlertType {
  if (pattern.pattern_type === "endangered_detection_cluster") return "repeated_endangered_detection";
  if (pattern.pattern_type === "migration_disruption") return "migration_disruption_pattern";
  if (pattern.pattern_type === "habitat_degradation") return "habitat_conflict_increase";
  if (pattern.pattern_type.includes("anomaly")) return "escalating_anomaly_cluster";
  return "ecological_instability_indicator";
}

export function generateEcologicalAlerts(patterns: LongitudinalPattern[]): EcologicalAlert[] {
  return patterns
    .filter((pattern) => pattern.severity !== "low")
    .map((pattern) => ({
      id: `alert:${pattern.id}`,
      alert_type: alertTypeFor(pattern),
      severity: pattern.severity,
      region_key: pattern.region_key,
      evidence_pattern_ids: [pattern.id],
      evidence_observation_ids: pattern.observation_ids,
      operational_summary: pattern.evidence_summary[0] ?? "Longitudinal ecological signal requires monitoring.",
      generated_at: new Date().toISOString(),
    }));
}
