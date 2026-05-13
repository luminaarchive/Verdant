// NaLI: Regional Ecological Baselines

import type { ReasoningHistoryEntry } from "@/lib/agent/reasoning/ecological-memory";

export interface RegionalEcologicalBaseline {
  region_key: string;
  expected_species_density: Record<string, number>;
  expected_seasonal_activity: Record<string, number>;
  expected_migration_alignment: number;
  expected_habitat_consistency: number;
  sample_size: number;
}

export interface RegionalBaselineInput {
  region_key: string;
  observations: ReasoningHistoryEntry[];
  expected_species_density?: Record<string, number>;
  expected_seasonal_activity?: Record<string, number>;
  expected_migration_alignment?: number;
  expected_habitat_consistency?: number;
}

export interface BaselineScore {
  density_ratio: number;
  migration_deviation: number;
  habitat_deviation: number;
  baseline_conflict: boolean;
  reasoning: string[];
}

function round(value: number): number {
  return Number(value.toFixed(2));
}

export function buildRegionalBaseline(input: RegionalBaselineInput): RegionalEcologicalBaseline {
  const density: Record<string, number> = { ...(input.expected_species_density ?? {}) };
  const regionEntries = input.observations.filter((entry) => entry.region_key === input.region_key);

  for (const entry of regionEntries) {
    if (!entry.scientific_name || density[entry.scientific_name] !== undefined) continue;
    density[entry.scientific_name] = regionEntries.filter(
      (candidate) => candidate.scientific_name === entry.scientific_name
    ).length;
  }

  return {
    region_key: input.region_key,
    expected_species_density: density,
    expected_seasonal_activity: input.expected_seasonal_activity ?? {},
    expected_migration_alignment: input.expected_migration_alignment ?? 0.6,
    expected_habitat_consistency: input.expected_habitat_consistency ?? 0.55,
    sample_size: regionEntries.length,
  };
}

export function scoreAgainstBaseline(
  observation: ReasoningHistoryEntry,
  baseline: RegionalEcologicalBaseline
): BaselineScore {
  const species = observation.scientific_name ?? "species:unknown";
  const expectedDensity = baseline.expected_species_density[species] ?? 1;
  const densityRatio = expectedDensity <= 0 ? 1 : 1 / expectedDensity;
  const migrationAlignment = observation.migration_alignment_score ?? baseline.expected_migration_alignment;
  const habitatMatch = observation.habitat_match_score ?? baseline.expected_habitat_consistency;
  const migrationDeviation = Math.max(0, baseline.expected_migration_alignment - migrationAlignment);
  const habitatDeviation = Math.max(0, baseline.expected_habitat_consistency - habitatMatch);
  const reasoning: string[] = [];

  if (densityRatio >= 1.5 || observation.conservation_priority_score >= 0.8) {
    reasoning.push("Observed density or conservation weight exceeds regional baseline expectations.");
  }

  if (migrationDeviation >= 0.3) {
    reasoning.push("Migration timing deviates from regional baseline.");
  }

  if (habitatDeviation >= 0.3) {
    reasoning.push("Habitat consistency falls below regional baseline.");
  }

  return {
    density_ratio: round(densityRatio),
    migration_deviation: round(migrationDeviation),
    habitat_deviation: round(habitatDeviation),
    baseline_conflict: reasoning.length > 0,
    reasoning,
  };
}
