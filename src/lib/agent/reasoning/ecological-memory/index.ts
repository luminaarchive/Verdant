// NaLI: Ecological Memory Foundation

export interface ReasoningHistoryEntry {
  observation_id: string;
  reasoning_trace_id: string;
  scientific_name?: string;
  region_key?: string;
  ecological_confidence: number;
  anomaly_score: number;
  conservation_priority_score: number;
  observed_at: string;
  iucn_status?: string;
  habitat_boundary?: string;
  activity_pattern?: string;
  reviewer_confirmed?: boolean;
  migration_alignment_score?: number;
  habitat_match_score?: number;
}

export interface RepeatedAnomalyDetectionHook {
  region_key: string;
  scientific_name?: string;
  minimum_observations: number;
  anomaly_threshold: number;
}

export interface RegionLevelPattern {
  id: string;
  region_key: string;
  pattern_type: "endangered_detection_cluster" | "nocturnal_anomaly_increase" | "migration_disruption" | "habitat_degradation";
  observation_ids: string[];
  reasoning_trace_ids: string[];
  evidence_count: number;
}

export interface EcologicalMemoryProvider {
  getReasoningHistory(regionKey: string, scientificName?: string): Promise<ReasoningHistoryEntry[]>;
  detectRepeatedAnomalies(hook: RepeatedAnomalyDetectionHook): Promise<RegionLevelPattern[]>;
}

export interface EcologicalMemoryIndex {
  by_region: Record<string, ReasoningHistoryEntry[]>;
  by_species: Record<string, ReasoningHistoryEntry[]>;
  anomaly_persistence: Record<string, ReasoningHistoryEntry[]>;
  reviewer_confirmed_signals: ReasoningHistoryEntry[];
  temporal_windows: Record<string, ReasoningHistoryEntry[]>;
}

export function createRegionKey(latitude?: number, longitude?: number): string {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return "region:unknown";
  }

  return `region:${latitude.toFixed(1)}:${longitude.toFixed(1)}`;
}

function monthWindow(observedAt: string): string {
  return observedAt.slice(0, 7);
}

export function filterTemporalWindow(
  entries: ReasoningHistoryEntry[],
  startIso: string,
  endIso: string
): ReasoningHistoryEntry[] {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();

  return entries.filter((entry) => {
    const observedAt = new Date(entry.observed_at).getTime();
    return observedAt >= start && observedAt <= end;
  });
}

export function indexEcologicalMemory(entries: ReasoningHistoryEntry[]): EcologicalMemoryIndex {
  const byRegion: Record<string, ReasoningHistoryEntry[]> = {};
  const bySpecies: Record<string, ReasoningHistoryEntry[]> = {};
  const anomalyPersistence: Record<string, ReasoningHistoryEntry[]> = {};
  const temporalWindows: Record<string, ReasoningHistoryEntry[]> = {};

  for (const entry of entries) {
    const regionKey = entry.region_key ?? "region:unknown";
    const speciesKey = entry.scientific_name ?? "species:unknown";
    const temporalKey = `${regionKey}:${monthWindow(entry.observed_at)}`;

    byRegion[regionKey] = [...(byRegion[regionKey] ?? []), entry];
    bySpecies[speciesKey] = [...(bySpecies[speciesKey] ?? []), entry];
    temporalWindows[temporalKey] = [...(temporalWindows[temporalKey] ?? []), entry];

    if (entry.anomaly_score >= 0.65) {
      const anomalyKey = `${regionKey}:${speciesKey}`;
      anomalyPersistence[anomalyKey] = [...(anomalyPersistence[anomalyKey] ?? []), entry];
    }
  }

  return {
    by_region: byRegion,
    by_species: bySpecies,
    anomaly_persistence: anomalyPersistence,
    reviewer_confirmed_signals: entries.filter((entry) => entry.reviewer_confirmed),
    temporal_windows: temporalWindows,
  };
}
