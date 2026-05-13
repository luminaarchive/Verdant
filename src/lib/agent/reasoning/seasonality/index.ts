// NaLI: Temporal Ecological Intelligence

export type ActivityPattern = "diurnal" | "nocturnal" | "crepuscular" | "cathemeral" | "unknown";

export interface SeasonalWindow {
  startMonth: number;
  endMonth: number;
}

export interface TemporalSpeciesProfile {
  scientific_name: string;
  seasonal_windows?: SeasonalWindow[];
  migration_windows?: SeasonalWindow[];
  breeding_windows?: SeasonalWindow[];
  activity_pattern?: ActivityPattern;
}

export interface TemporalObservationInput {
  observedAt: Date;
  latitude?: number;
  longitude?: number;
  species: TemporalSpeciesProfile;
}

export interface TemporalReasoningResult {
  seasonal_alignment_score: number;
  migration_alignment_score: number;
  breeding_context_score: number;
  activity_alignment_score: number;
  confidence_adjustment: number;
  anomaly_score: number;
  review_recommendations: string[];
  reasoning: string[];
}

function clamp(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function round(value: number): number {
  return Number(value.toFixed(2));
}

function monthInWindow(month: number, window: SeasonalWindow): boolean {
  if (window.startMonth <= window.endMonth) {
    return month >= window.startMonth && month <= window.endMonth;
  }

  return month >= window.startMonth || month <= window.endMonth;
}

function scoreWindows(month: number, windows?: SeasonalWindow[]): number {
  if (!windows || windows.length === 0) return 0.5;
  return windows.some((window) => monthInWindow(month, window)) ? 1 : 0.15;
}

function scoreActivity(hour: number, pattern: ActivityPattern = "unknown"): number {
  if (pattern === "unknown" || pattern === "cathemeral") return 0.5;
  if (pattern === "diurnal") return hour >= 6 && hour < 18 ? 1 : 0.2;
  if (pattern === "nocturnal") return hour >= 18 || hour < 6 ? 1 : 0.2;
  return hour >= 5 && hour < 8 || hour >= 16 && hour < 20 ? 1 : 0.35;
}

export function evaluateTemporalContext(input: TemporalObservationInput): TemporalReasoningResult {
  const month = input.observedAt.getUTCMonth() + 1;
  const hour = input.observedAt.getUTCHours();
  const seasonal = scoreWindows(month, input.species.seasonal_windows);
  const migration = scoreWindows(month, input.species.migration_windows);
  const breeding = scoreWindows(month, input.species.breeding_windows);
  const activity = scoreActivity(hour, input.species.activity_pattern);
  const combined = seasonal * 0.35 + migration * 0.25 + breeding * 0.15 + activity * 0.25;
  const anomalyScore = clamp(1 - combined);
  const confidenceAdjustment = Math.max(-0.22, Math.min(0.12, (combined - 0.5) * 0.35));
  const reasoning: string[] = [];
  const reviewRecommendations: string[] = [];

  if (seasonal <= 0.2) {
    reasoning.push("Species rarely observed during current seasonal window.");
    reviewRecommendations.push("Review seasonal occurrence anomaly before archival confidence is finalized.");
  } else if (seasonal >= 0.9) {
    reasoning.push("Observation aligns with known seasonal occurrence window.");
  }

  if (migration >= 0.9 && input.species.migration_windows?.length) {
    reasoning.push("Migration timing aligns with known regional behavior.");
  } else if (migration <= 0.2 && input.species.migration_windows?.length) {
    reasoning.push("Observation falls outside expected migration timing.");
  }

  if (breeding >= 0.9 && input.species.breeding_windows?.length) {
    reasoning.push("Breeding season context increases ecological significance.");
  }

  if (activity <= 0.25) {
    reasoning.push("Observation timestamp conflicts with typical activity pattern.");
    reviewRecommendations.push("Validate timestamp and field context for activity-pattern conflict.");
  }

  if (reasoning.length === 0) {
    reasoning.push("Temporal context is inconclusive but does not independently contradict the observation.");
  }

  return {
    seasonal_alignment_score: round(seasonal),
    migration_alignment_score: round(migration),
    breeding_context_score: round(breeding),
    activity_alignment_score: round(activity),
    confidence_adjustment: round(confidenceAdjustment),
    anomaly_score: round(anomalyScore),
    review_recommendations: reviewRecommendations,
    reasoning,
  };
}
