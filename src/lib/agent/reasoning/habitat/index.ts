// NaLI: Habitat Context Engine

export type HabitatBoundary = "core" | "edge" | "fragmented" | "agricultural_boundary" | "urban_boundary" | "unknown";

export interface HabitatPreference {
  biome: string;
  affinity: number;
}

export interface HabitatContextInput {
  latitude?: number;
  longitude?: number;
  biome?: string;
  occurrence_density_score?: number;
  environmental_metadata?: {
    forest_cover_loss_score?: number;
    ndvi_score?: number;
    rainfall_anomaly_score?: number;
    land_use_boundary?: HabitatBoundary;
  };
  species_habitat_preferences: HabitatPreference[];
}

export interface HabitatReasoningResult {
  habitat_match_score: number;
  fragmentation_score: number;
  conservation_sensitivity_score: number;
  confidence_adjustment: number;
  anomaly_score: number;
  reasoning: string[];
}

function clamp(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function round(value: number): number {
  return Number(value.toFixed(2));
}

export function evaluateHabitatContext(input: HabitatContextInput): HabitatReasoningResult {
  const normalizedBiome = input.biome?.trim().toLowerCase();
  const preference = input.species_habitat_preferences.find(
    (candidate) => candidate.biome.trim().toLowerCase() === normalizedBiome
  );
  const habitatMatch = preference ? clamp(preference.affinity) : 0.45;
  const boundary = input.environmental_metadata?.land_use_boundary ?? "unknown";
  const boundaryPressure: Record<HabitatBoundary, number> = {
    core: 0.05,
    edge: 0.25,
    fragmented: 0.65,
    agricultural_boundary: 0.7,
    urban_boundary: 0.8,
    unknown: 0.35,
  };
  const forestLoss = clamp(input.environmental_metadata?.forest_cover_loss_score ?? 0);
  const ndviStress = 1 - clamp(input.environmental_metadata?.ndvi_score ?? 0.55);
  const fragmentation = clamp(boundaryPressure[boundary] * 0.55 + forestLoss * 0.3 + ndviStress * 0.15);
  const occurrenceDensity = clamp(input.occurrence_density_score ?? 0.5);
  const anomalyScore = clamp((1 - habitatMatch) * 0.45 + fragmentation * 0.35 + (1 - occurrenceDensity) * 0.2);
  const sensitivity = clamp(fragmentation * 0.45 + forestLoss * 0.25 + (1 - occurrenceDensity) * 0.3);
  const confidenceAdjustment = Math.max(-0.18, Math.min(0.1, (habitatMatch - 0.5) * 0.2 - fragmentation * 0.12));
  const reasoning: string[] = [];

  if (preference) {
    reasoning.push(`Species typically associated with ${preference.biome} habitat.`);
  } else if (input.biome) {
    reasoning.push(`No strong habitat preference match found for observed ${input.biome} biome.`);
  } else {
    reasoning.push("Biome context missing; habitat reasoning remains conservative.");
  }

  if (boundary === "agricultural_boundary") {
    reasoning.push("Observation located near fragmented agricultural boundary.");
  } else if (boundary === "urban_boundary") {
    reasoning.push("Observation located near urban boundary pressure.");
  } else if (boundary === "fragmented") {
    reasoning.push("Habitat fragmentation increases anomaly probability.");
  } else if (boundary === "core") {
    reasoning.push("Observation occurs in comparatively intact core habitat.");
  }

  if (forestLoss >= 0.6) {
    reasoning.push("Forest cover loss increases conservation sensitivity.");
  }

  return {
    habitat_match_score: round(habitatMatch),
    fragmentation_score: round(fragmentation),
    conservation_sensitivity_score: round(sensitivity),
    confidence_adjustment: round(confidenceAdjustment),
    anomaly_score: round(anomalyScore),
    reasoning,
  };
}
