// NaLI: Operational Reasoning Runtime Adapters

import type { ToolOutput } from "@/lib/agent/core/types";
import type { FusionSignal } from "@/lib/agent/reasoning/multi-modal-fusion";
import type { ProviderConflict } from "@/lib/agent/reasoning/provider-conflicts";
import type { ReviewRecommendationResult } from "@/lib/agent/reasoning/review-recommendation";
import type { HabitatReasoningResult } from "@/lib/agent/reasoning/habitat";
import type { TemporalReasoningResult } from "@/lib/agent/reasoning/seasonality";
import type { EnvironmentalSignal } from "@/lib/environment";

export interface ProviderOutputRecord {
  tool_name: string;
  tool_version: string;
  status: ToolOutput["status"];
  score_breakdown: Record<string, number>;
  raw_output: string;
  latency_ms: number;
  error?: string;
}

export interface OperationalSignalSnapshotInput {
  reasoning_trace_id: string;
  provider_outputs: ProviderOutputRecord[];
  modality_signals: FusionSignal[];
  environmental_signals: EnvironmentalSignal[];
  agreement_metrics: {
    agreement_score: number;
    conflict_detected: boolean;
    anomaly_score: number;
  };
  conflicts: ProviderConflict[];
}

export interface OperationalSignalSnapshot extends OperationalSignalSnapshotInput {
  generated_at: string;
}

export interface OperationalReasoningSnapshotInput {
  reasoning_trace_id: string;
  ecological_confidence: number;
  confidence_contributors: string[];
  confidence_penalties: string[];
  habitat_context: HabitatReasoningResult | null;
  temporal_context: TemporalReasoningResult | null;
  provider_conflicts: ProviderConflict[];
  escalation_reasoning: string[];
  review_recommendation: ReviewRecommendationResult;
  priority_explanation: string[];
  synthesized_reasoning: string[];
}

export interface OperationalReasoningSnapshot extends OperationalReasoningSnapshotInput {
  generated_at: string;
}

function clamp(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function extractScientificName(rawOutput: string): string | undefined {
  const known = [
    "Pongo abelii",
    "Pongo tapanuliensis",
    "Panthera tigris sumatrae",
    "Varanus komodoensis",
    "Spizaetus bartelsi",
    "Nisaetus bartelsi",
    "Buceros rhinoceros",
  ];
  return known.find((name) => rawOutput.toLowerCase().includes(name.toLowerCase()));
}

function modalityFromTool(toolName: string): FusionSignal["modality"] {
  const normalized = toolName.toLowerCase();
  if (normalized.includes("audio") || normalized.includes("birdnet")) return "audio";
  if (normalized.includes("gbif")) return "taxonomy";
  if (normalized.includes("iucn")) return "conservation";
  if (normalized.includes("anomaly")) return "temporal";
  return "vision";
}

function confidenceFromOutput(output: ProviderOutputRecord): number {
  const scores = output.score_breakdown;
  if (typeof scores.confidence === "number") return clamp(scores.confidence);
  if (typeof scores.match === "number" && typeof scores.location_fit === "number") {
    return clamp(scores.match * 0.55 + scores.location_fit * 0.45);
  }
  if (typeof scores.match === "number") return clamp(scores.match);
  if (typeof scores.anomaly_score === "number") return clamp(1 - scores.anomaly_score);
  if (output.raw_output.toLowerCase().includes("critically endangered")) return 0.82;
  return output.status === "completed" ? 0.62 : 0.4;
}

export function providerOutputToSignal(output: ProviderOutputRecord): FusionSignal {
  const modality = modalityFromTool(output.tool_name);
  const anomalyScore = output.score_breakdown.anomaly_score;

  return {
    provider: output.tool_name,
    modality,
    confidence: confidenceFromOutput(output),
    reliability: output.status === "completed" ? 0.78 : 0.52,
    scientific_name: extractScientificName(output.raw_output),
    direction: typeof anomalyScore === "number" && anomalyScore >= 0.6 ? "contradicting" : "supporting",
    reasoning: output.raw_output,
  };
}

export function buildOperationalSignalSnapshot(
  input: OperationalSignalSnapshotInput
): OperationalSignalSnapshot {
  return {
    ...input,
    generated_at: new Date().toISOString(),
  };
}

export function buildOperationalReasoningSnapshot(
  input: OperationalReasoningSnapshotInput
): OperationalReasoningSnapshot {
  return {
    ...input,
    generated_at: new Date().toISOString(),
  };
}
