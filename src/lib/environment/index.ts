// NaLI: Environmental Context Provider Contracts

import type { ProviderHealth } from "@/lib/agent/providers/base";

export type EnvironmentalSignalType =
  | "rainfall"
  | "ndvi"
  | "forest_cover"
  | "wildfire_alert"
  | "temperature_anomaly"
  | "land_use_change";

export interface EnvironmentalContextRequest {
  latitude: number;
  longitude: number;
  observedAt: Date;
  radiusKm?: number;
}

export interface EnvironmentalSignal {
  type: EnvironmentalSignalType;
  score: number;
  unit?: string;
  value?: number;
  source: string;
  observed_at?: string;
  reasoning: string;
}

export interface EnvironmentalContextResult {
  signals: EnvironmentalSignal[];
  habitat_fragility_score: number;
  environmental_anomaly_score: number;
  raw_output: string;
}

export interface EnvironmentalProvider {
  name: string;
  version: string;
  healthCheck(): Promise<ProviderHealth>;
  getContext(request: EnvironmentalContextRequest): Promise<EnvironmentalContextResult>;
}

function clamp(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

export function synthesizeEnvironmentalContext(signals: EnvironmentalSignal[]): EnvironmentalContextResult {
  if (signals.length === 0) {
    return {
      signals,
      habitat_fragility_score: 0.4,
      environmental_anomaly_score: 0,
      raw_output: "No environmental provider signals available.",
    };
  }

  const averageScore = signals.reduce((sum, signal) => sum + clamp(signal.score), 0) / signals.length;
  const fragilitySignals = signals.filter((signal) =>
    signal.type === "forest_cover" || signal.type === "land_use_change" || signal.type === "wildfire_alert"
  );
  const fragility = fragilitySignals.length === 0
    ? averageScore
    : fragilitySignals.reduce((sum, signal) => sum + clamp(signal.score), 0) / fragilitySignals.length;

  return {
    signals,
    habitat_fragility_score: Number(fragility.toFixed(2)),
    environmental_anomaly_score: Number(averageScore.toFixed(2)),
    raw_output: "Environmental provider signals synthesized for ecological reasoning.",
  };
}
