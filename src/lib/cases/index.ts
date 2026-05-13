// NaLI: Field Case Management

export type FieldCaseType =
  | "possible_poaching_indicator"
  | "migration_anomaly"
  | "habitat_degradation_signal"
  | "endangered_species_escalation"
  | "repeated_anomaly_cluster";

export type FieldCaseStatus = "open" | "triage" | "assigned" | "escalated" | "resolved" | "archived";

export type EcologicalPatternLinkType =
  | "repeated_anomaly"
  | "region_level_pattern"
  | "migration_grouping"
  | "habitat_degradation_cluster";

export interface EcologicalPatternLink {
  id: string;
  type: EcologicalPatternLinkType;
  label: string;
  reasoning_trace_id?: string;
}

export interface FieldCaseNote {
  author_id: string;
  body: string;
  created_at: string;
}

export interface FieldCase {
  id: string;
  type: FieldCaseType;
  status: FieldCaseStatus;
  priority_score: number;
  linked_observation_ids: string[];
  linked_ecological_patterns: EcologicalPatternLink[];
  linked_anomaly_cluster_ids: string[];
  migration_grouping_id?: string;
  reviewer_assignment_ids: string[];
  operational_notes: FieldCaseNote[];
  created_at: string;
  updated_at: string;
}

export interface FieldCaseCreationInput {
  id: string;
  type: FieldCaseType;
  priority_score: number;
  observation_id: string;
  reviewer_assignment_ids?: string[];
  linked_ecological_patterns?: EcologicalPatternLink[];
  linked_anomaly_cluster_ids?: string[];
  migration_grouping_id?: string;
  note?: FieldCaseNote;
  created_at?: string;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createFieldCase(input: FieldCaseCreationInput): FieldCase {
  const timestamp = input.created_at ?? nowIso();

  return {
    id: input.id,
    type: input.type,
    status: input.priority_score >= 0.72 ? "escalated" : "triage",
    priority_score: input.priority_score,
    linked_observation_ids: [input.observation_id],
    linked_ecological_patterns: input.linked_ecological_patterns ?? [],
    linked_anomaly_cluster_ids: input.linked_anomaly_cluster_ids ?? [],
    migration_grouping_id: input.migration_grouping_id,
    reviewer_assignment_ids: input.reviewer_assignment_ids ?? [],
    operational_notes: input.note ? [input.note] : [],
    created_at: timestamp,
    updated_at: timestamp,
  };
}

export function escalateFieldCase(fieldCase: FieldCase, reviewerId?: string): FieldCase {
  return {
    ...fieldCase,
    status: "escalated",
    reviewer_assignment_ids: reviewerId
      ? Array.from(new Set([...fieldCase.reviewer_assignment_ids, reviewerId]))
      : fieldCase.reviewer_assignment_ids,
    updated_at: nowIso(),
  };
}

export function linkObservation(fieldCase: FieldCase, observationId: string): FieldCase {
  return {
    ...fieldCase,
    linked_observation_ids: Array.from(new Set([...fieldCase.linked_observation_ids, observationId])),
    updated_at: nowIso(),
  };
}

export function addOperationalNote(fieldCase: FieldCase, note: FieldCaseNote): FieldCase {
  return {
    ...fieldCase,
    operational_notes: [...fieldCase.operational_notes, note],
    updated_at: nowIso(),
  };
}
