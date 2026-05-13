// NaLI: Case Correlation Engine

import type { LongitudinalPattern } from "@/lib/agent/reasoning/pattern-detection";
import type { FieldCase } from "@/lib/cases";

export function correlateFieldCaseWithPattern(fieldCase: FieldCase, pattern: LongitudinalPattern): FieldCase {
  const linkedObservationIds = Array.from(new Set([
    ...fieldCase.linked_observation_ids,
    ...pattern.observation_ids,
  ]));
  const linkedAnomalyClusterIds = pattern.pattern_type.includes("anomaly")
    ? Array.from(new Set([...fieldCase.linked_anomaly_cluster_ids, pattern.id]))
    : fieldCase.linked_anomaly_cluster_ids;

  return {
    ...fieldCase,
    status: pattern.severity === "critical" || pattern.severity === "high" ? "escalated" : fieldCase.status,
    priority_score: Math.max(fieldCase.priority_score, pattern.confidence),
    linked_observation_ids: linkedObservationIds,
    linked_anomaly_cluster_ids: linkedAnomalyClusterIds,
    migration_grouping_id: pattern.pattern_type === "migration_disruption"
      ? pattern.id
      : fieldCase.migration_grouping_id,
    linked_ecological_patterns: Array.from(new Map([
      ...fieldCase.linked_ecological_patterns.map((link) => [link.id, link] as const),
      [
        pattern.id,
        {
          id: pattern.id,
          type: pattern.pattern_type === "migration_disruption" ? "migration_grouping" : "region_level_pattern",
          label: pattern.evidence_summary[0] ?? pattern.pattern_type,
          reasoning_trace_id: pattern.reasoning_trace_ids[0],
        },
      ],
    ]).values()),
    updated_at: new Date().toISOString(),
  };
}
