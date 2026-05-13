// NaLI: Ecosystem-Scale Interpretation

import type { LongitudinalPattern } from "@/lib/agent/reasoning/pattern-detection";

export interface EcosystemInterpretation {
  interpretation_type: LongitudinalPattern["pattern_type"];
  statement: string;
  evidence_pattern_id: string;
  evidence_observation_ids: string[];
  reasoning_trace_ids: string[];
}

function statementFor(pattern: LongitudinalPattern): string {
  if (pattern.pattern_type === "habitat_degradation") {
    return "Repeated fragmented habitat anomalies indicate increasing ecological pressure.";
  }
  if (pattern.pattern_type === "migration_disruption") {
    return "Migration timing disruptions align with recent ecological instability signals.";
  }
  if (pattern.pattern_type === "endangered_detection_cluster") {
    return "Repeated endangered species detections require regional conservation monitoring.";
  }
  if (pattern.pattern_type === "unusual_density_spike") {
    return "Regional species density shifted away from previous observation baseline.";
  }
  return "Repeated anomaly evidence indicates a longitudinal ecological monitoring signal.";
}

export function interpretEcosystemPatterns(patterns: LongitudinalPattern[]): EcosystemInterpretation[] {
  return patterns.map((pattern) => ({
    interpretation_type: pattern.pattern_type,
    statement: statementFor(pattern),
    evidence_pattern_id: pattern.id,
    evidence_observation_ids: pattern.observation_ids,
    reasoning_trace_ids: pattern.reasoning_trace_ids,
  }));
}
