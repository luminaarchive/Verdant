// NaLI: Ecological Signal Graph

import type { ReasoningHistoryEntry } from "@/lib/agent/reasoning/ecological-memory";
import type { FieldCase } from "@/lib/cases";

export type EcologicalNodeType =
  | "observation"
  | "species"
  | "habitat"
  | "anomaly"
  | "field_case"
  | "reviewer"
  | "region"
  | "temporal_window";

export interface EcologicalGraphNode {
  id: string;
  type: EcologicalNodeType;
  label: string;
}

export interface EcologicalGraphEdge {
  source: string;
  target: string;
  relationship: string;
  evidence_weight: number;
}

export interface EcologicalSignalGraph {
  nodes: EcologicalGraphNode[];
  edges: EcologicalGraphEdge[];
}

export interface EcologicalSignalGraphInput {
  observations: ReasoningHistoryEntry[];
  field_cases: FieldCase[];
}

function addNode(nodes: Map<string, EcologicalGraphNode>, node: EcologicalGraphNode) {
  if (!nodes.has(node.id)) nodes.set(node.id, node);
}

function temporalWindow(observedAt: string): string {
  return `window:${observedAt.slice(0, 7)}`;
}

export function buildEcologicalSignalGraph(input: EcologicalSignalGraphInput): EcologicalSignalGraph {
  const nodes = new Map<string, EcologicalGraphNode>();
  const edges: EcologicalGraphEdge[] = [];

  for (const observation of input.observations) {
    const observationId = observation.observation_id;
    const speciesId = `species:${observation.scientific_name ?? "unknown"}`;
    const regionId = observation.region_key ?? "region:unknown";
    const habitatId = `habitat:${observation.habitat_boundary ?? "unknown"}`;
    const anomalyId = `anomaly:${observationId}`;
    const windowId = temporalWindow(observation.observed_at);

    addNode(nodes, { id: observationId, type: "observation", label: observationId });
    addNode(nodes, { id: speciesId, type: "species", label: observation.scientific_name ?? "Unknown species" });
    addNode(nodes, { id: regionId, type: "region", label: regionId });
    addNode(nodes, { id: habitatId, type: "habitat", label: observation.habitat_boundary ?? "Unknown habitat" });
    addNode(nodes, { id: windowId, type: "temporal_window", label: windowId });

    edges.push({ source: observationId, target: speciesId, relationship: "identifies_species", evidence_weight: observation.ecological_confidence });
    edges.push({ source: observationId, target: regionId, relationship: "observed_in_region", evidence_weight: 1 });
    edges.push({ source: observationId, target: habitatId, relationship: "observed_in_habitat_context", evidence_weight: observation.habitat_match_score ?? 0.5 });
    edges.push({ source: observationId, target: windowId, relationship: "observed_in_temporal_window", evidence_weight: 1 });

    if (observation.anomaly_score >= 0.65) {
      addNode(nodes, { id: anomalyId, type: "anomaly", label: `Anomaly ${observationId}` });
      edges.push({ source: observationId, target: anomalyId, relationship: "produces_anomaly_signal", evidence_weight: observation.anomaly_score });
    }
  }

  for (const fieldCase of input.field_cases) {
    addNode(nodes, { id: fieldCase.id, type: "field_case", label: fieldCase.type });
    for (const observationId of fieldCase.linked_observation_ids) {
      edges.push({ source: fieldCase.id, target: observationId, relationship: "case_links_observation", evidence_weight: fieldCase.priority_score });
    }
    for (const reviewerId of fieldCase.reviewer_assignment_ids) {
      addNode(nodes, { id: reviewerId, type: "reviewer", label: reviewerId });
      edges.push({ source: fieldCase.id, target: reviewerId, relationship: "assigned_to_reviewer", evidence_weight: 1 });
    }
  }

  return {
    nodes: [...nodes.values()],
    edges,
  };
}
