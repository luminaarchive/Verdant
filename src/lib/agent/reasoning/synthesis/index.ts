// NaLI: Ecological Reasoning Synthesis

import {
  FusionResult,
  FusionSignal,
  fusionEngine,
} from "@/lib/agent/reasoning/multi-modal-fusion";
import {
  ConservationPriorityInput,
  ConservationPriorityResult,
  calculateConservationPriority,
} from "@/lib/agent/reasoning/conservation-priority";
import type { HabitatReasoningResult } from "@/lib/agent/reasoning/habitat";
import type { TemporalReasoningResult } from "@/lib/agent/reasoning/seasonality";

export interface EcologicalReasoningInput {
  signals: FusionSignal[];
  temporal?: TemporalReasoningResult;
  habitat?: HabitatReasoningResult;
  conservation_priority: ConservationPriorityInput;
  reviewer_reliability_weight?: number;
}

export interface EcologicalReasoningResult {
  ecological_confidence: number;
  fusion: FusionResult;
  conservation_priority: ConservationPriorityResult;
  human_review_recommended: boolean;
  scientific_interpretation: {
    confidence_strengthened_due_to: string[];
    confidence_reduced_due_to: string[];
    escalated_for_review_because: string[];
    uncertainty_explanation: string[];
  };
}

export function synthesizeEcologicalReasoning(
  input: EcologicalReasoningInput
): EcologicalReasoningResult {
  const contextualSignals: FusionSignal[] = [...input.signals];

  if (input.temporal) {
    contextualSignals.push({
      provider: "NaLI Temporal Ecological Intelligence",
      modality: "temporal",
      confidence: 1 - input.temporal.anomaly_score,
      reliability: 0.82,
      direction: input.temporal.confidence_adjustment < -0.05 ? "contradicting" : "contextual",
      reasoning: input.temporal.reasoning.join(" "),
    });
  }

  if (input.habitat) {
    contextualSignals.push({
      provider: "NaLI Habitat Context Engine",
      modality: "habitat",
      confidence: input.habitat.habitat_match_score,
      reliability: 0.8,
      direction: input.habitat.confidence_adjustment < -0.05 ? "contradicting" : "contextual",
      reasoning: input.habitat.reasoning.join(" "),
    });
  }

  const fusion = fusionEngine.analyzeAgreement(contextualSignals);
  const conservationPriority = calculateConservationPriority({
    ...input.conservation_priority,
    habitat_fragility_score: input.conservation_priority.habitat_fragility_score ??
      input.habitat?.fragmentation_score,
    anomaly_severity_score: input.conservation_priority.anomaly_severity_score ??
      Math.max(fusion.anomaly_score, input.temporal?.anomaly_score ?? 0, input.habitat?.anomaly_score ?? 0),
    reviewer_escalation_score: input.conservation_priority.reviewer_escalation_score ??
      input.reviewer_reliability_weight,
  });
  const escalations = [
    ...(input.temporal?.review_recommendations ?? []),
  ];

  if (fusion.conflict_detected) {
    escalations.push("Conflicting provider signals require expert validation.");
  }

  if (conservationPriority.escalation_recommended) {
    escalations.push(`${conservationPriority.category} requires conservation workflow attention.`);
  }

  const reduced = [
    ...fusion.confidence_factors.reduced_by,
    ...(input.temporal?.reasoning.filter((reason) =>
      reason.includes("conflicts") || reason.includes("outside")
    ) ?? []),
    ...(input.habitat?.reasoning.filter((reason) =>
      reason.includes("fragmentation") || reason.includes("missing")
    ) ?? []),
  ];

  return {
    ecological_confidence: fusion.final_confidence,
    fusion,
    conservation_priority: conservationPriority,
    human_review_recommended: escalations.length > 0 || fusion.final_confidence < 0.6,
    scientific_interpretation: {
      confidence_strengthened_due_to: [
        ...fusion.confidence_factors.strengthened_by,
        ...conservationPriority.reasoning,
      ],
      confidence_reduced_due_to: reduced,
      escalated_for_review_because: escalations,
      uncertainty_explanation: fusion.synthesis_reasoning,
    },
  };
}
