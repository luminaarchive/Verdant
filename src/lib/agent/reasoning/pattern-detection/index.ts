// NaLI: Longitudinal Pattern Detection

import type { RegionalEcologicalBaseline } from "@/lib/agent/reasoning/ecological-baselines";
import { scoreAgainstBaseline } from "@/lib/agent/reasoning/ecological-baselines";
import type { ReasoningHistoryEntry, RegionLevelPattern } from "@/lib/agent/reasoning/ecological-memory";

export type LongitudinalPatternType =
  | RegionLevelPattern["pattern_type"]
  | "repeated_anomaly"
  | "unusual_density_spike"
  | "repeated_nocturnal_anomaly";

export interface LongitudinalPattern extends Omit<RegionLevelPattern, "pattern_type"> {
  pattern_type: LongitudinalPatternType;
  severity: "low" | "moderate" | "high" | "critical";
  confidence: number;
  evidence_summary: string[];
}

export interface PatternDetectionInput {
  observations: ReasoningHistoryEntry[];
  baselines: RegionalEcologicalBaseline[];
  window_days: number;
}

function round(value: number): number {
  return Number(value.toFixed(2));
}

function severity(score: number): LongitudinalPattern["severity"] {
  if (score >= 0.85) return "critical";
  if (score >= 0.68) return "high";
  if (score >= 0.45) return "moderate";
  return "low";
}

function groupBy<T>(items: T[], keyFor: (item: T) => string): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    const key = keyFor(item);
    groups[key] = [...(groups[key] ?? []), item];
    return groups;
  }, {});
}

function createPattern(
  type: LongitudinalPatternType,
  regionKey: string,
  entries: ReasoningHistoryEntry[],
  score: number,
  summary: string[]
): LongitudinalPattern {
  return {
    id: `${type}:${regionKey}:${entries.map((entry) => entry.observation_id).join("-")}`,
    region_key: regionKey,
    pattern_type: type,
    observation_ids: entries.map((entry) => entry.observation_id),
    reasoning_trace_ids: entries.map((entry) => entry.reasoning_trace_id),
    evidence_count: entries.length,
    severity: severity(score),
    confidence: round(score),
    evidence_summary: summary,
  };
}

export function detectLongitudinalPatterns(input: PatternDetectionInput): LongitudinalPattern[] {
  const patterns: LongitudinalPattern[] = [];
  const byRegion = groupBy(input.observations, (entry) => entry.region_key ?? "region:unknown");

  for (const [regionKey, entries] of Object.entries(byRegion)) {
    const anomalous = entries.filter((entry) => entry.anomaly_score >= 0.65);
    const endangered = entries.filter((entry) => entry.iucn_status === "CR" || entry.iucn_status === "EN");
    const nocturnal = anomalous.filter((entry) => entry.activity_pattern === "nocturnal");
    const degraded = entries.filter((entry) =>
      entry.habitat_boundary === "fragmented" ||
      entry.habitat_boundary === "agricultural_boundary" ||
      (entry.habitat_match_score ?? 1) < 0.45
    );
    const migrationDisrupted = entries.filter((entry) => (entry.migration_alignment_score ?? 1) < 0.35);
    const baseline = input.baselines.find((candidate) => candidate.region_key === regionKey);
    const baselineConflicts = baseline
      ? entries.filter((entry) => scoreAgainstBaseline(entry, baseline).baseline_conflict)
      : [];

    if (endangered.length >= 2) {
      patterns.push(createPattern(
        "endangered_detection_cluster",
        regionKey,
        endangered,
        Math.min(1, endangered.length / 3 + 0.35),
        ["Repeated endangered detections within the regional monitoring window."]
      ));
    }

    if (anomalous.length >= 3) {
      patterns.push(createPattern(
        "repeated_anomaly",
        regionKey,
        anomalous,
        Math.min(1, anomalous.reduce((sum, entry) => sum + entry.anomaly_score, 0) / anomalous.length),
        ["Persistent anomaly cluster detected across repeated observations."]
      ));
    }

    if (nocturnal.length >= 2) {
      patterns.push(createPattern(
        "repeated_nocturnal_anomaly",
        regionKey,
        nocturnal,
        0.72,
        ["Abnormal increase in nocturnal sightings within regional observation set."]
      ));
    }

    if (migrationDisrupted.length >= 2) {
      patterns.push(createPattern(
        "migration_disruption",
        regionKey,
        migrationDisrupted,
        0.76,
        ["Migration timing disruption repeated across observations."]
      ));
    }

    if (degraded.length >= 2 || baselineConflicts.length >= 2) {
      patterns.push(createPattern(
        "habitat_degradation",
        regionKey,
        degraded.length >= 2 ? degraded : baselineConflicts,
        0.74,
        ["Repeated habitat inconsistency suggests increasing ecological pressure."]
      ));
    }

    if (baselineConflicts.length >= 3) {
      patterns.push(createPattern(
        "unusual_density_spike",
        regionKey,
        baselineConflicts,
        0.69,
        ["Observation density shifted away from regional ecological baseline."]
      ));
    }
  }

  return patterns;
}
