// NaLI: Conservation Operations Case Escalation

import {
  FieldCase,
  FieldCaseType,
  createFieldCase,
} from "@/lib/cases";
import type { ConservationPriorityCategory } from "@/lib/agent/reasoning/conservation-priority";
import type { ProviderConflict } from "@/lib/agent/reasoning/provider-conflicts";

export interface CaseEscalationInput {
  observation_id: string;
  reasoning_trace_id: string;
  conservation_priority_category: ConservationPriorityCategory;
  conservation_priority_score: number;
  iucn_status?: string;
  occurrence_density_score?: number;
  habitat_fragmentation_score?: number;
  temporal_anomaly_score?: number;
  provider_conflicts: ProviderConflict[];
  repeated_anomaly_cluster_id?: string;
  migration_grouping_id?: string;
}

export interface CaseEscalationResult {
  case_required: boolean;
  cases: FieldCase[];
  triggered_rules: string[];
}

function stableCaseId(observationId: string, type: FieldCaseType): string {
  return `${observationId}-${type}`;
}

export function evaluateCaseEscalationRules(input: CaseEscalationInput): CaseEscalationResult {
  const cases: FieldCase[] = [];
  const triggeredRules: string[] = [];
  const iucn = input.iucn_status?.toUpperCase();
  const lowOccurrence = (input.occurrence_density_score ?? 1) < 0.2;
  const fragmentedHabitat = (input.habitat_fragmentation_score ?? 0) >= 0.65;
  const temporalAnomaly = (input.temporal_anomaly_score ?? 0) >= 0.6;
  const providerConflict = input.provider_conflicts.some((conflict) =>
    conflict.severity === "high" || conflict.severity === "critical"
  );

  const addCase = (type: FieldCaseType, reason: string) => {
    triggeredRules.push(reason);
    cases.push(createFieldCase({
      id: stableCaseId(input.observation_id, type),
      type,
      observation_id: input.observation_id,
      priority_score: input.conservation_priority_score,
      linked_anomaly_cluster_ids: input.repeated_anomaly_cluster_id ? [input.repeated_anomaly_cluster_id] : [],
      migration_grouping_id: type === "migration_anomaly" ? input.migration_grouping_id : undefined,
      linked_ecological_patterns: [
        {
          id: `${input.reasoning_trace_id}-${type}`,
          type: type === "migration_anomaly" ? "migration_grouping" : "region_level_pattern",
          label: reason,
          reasoning_trace_id: input.reasoning_trace_id,
        },
      ],
      note: {
        author_id: "NaLI operational runtime",
        body: reason,
        created_at: new Date().toISOString(),
      },
    }));
  };

  if (iucn === "CR" || iucn === "EN") {
    addCase("endangered_species_escalation", `Endangered species overlap detected with IUCN status ${iucn}.`);
  }

  if (fragmentedHabitat) {
    addCase("habitat_degradation_signal", "Fragmented habitat context increases operational conservation concern.");
  }

  if (temporalAnomaly) {
    addCase("migration_anomaly", "Strong seasonal or migration inconsistency requires field validation.");
  }

  if (lowOccurrence || providerConflict) {
    addCase(
      "repeated_anomaly_cluster",
      lowOccurrence
        ? "Low occurrence density increases anomaly cluster watch priority."
        : "High-severity provider conflict requires operational anomaly tracking."
    );
  }

  return {
    case_required: cases.length > 0 ||
      input.conservation_priority_category === "High Conservation Attention",
    cases,
    triggered_rules: triggeredRules,
  };
}
