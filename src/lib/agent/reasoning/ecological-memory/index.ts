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

export function createRegionKey(latitude?: number, longitude?: number): string {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return "region:unknown";
  }

  return `region:${latitude.toFixed(1)}:${longitude.toFixed(1)}`;
}
