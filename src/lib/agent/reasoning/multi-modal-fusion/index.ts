// NaLI: Multi-Modal Fusion Engine

export type FusionModality =
  | "vision"
  | "audio"
  | "taxonomy"
  | "habitat"
  | "temporal"
  | "image_quality"
  | "conservation"
  | "reviewer";

export type FusionSignalDirection = "supporting" | "contradicting" | "contextual";

export interface FusionSignal {
  provider: string;
  modality: FusionModality;
  confidence: number;
  reliability?: number;
  scientific_name?: string;
  direction?: FusionSignalDirection;
  reasoning?: string;
}

export interface FusionResult {
  final_confidence: number;
  conflict_detected: boolean;
  agreement_score: number;
  anomaly_score: number;
  synthesis_reasoning: string[];
  confidence_factors: {
    strengthened_by: string[];
    reduced_by: string[];
  };
}

const MODALITY_WEIGHTS: Record<FusionModality, number> = {
  vision: 0.22,
  audio: 0.2,
  taxonomy: 0.18,
  habitat: 0.13,
  temporal: 0.1,
  image_quality: 0.07,
  conservation: 0.06,
  reviewer: 0.04,
};

function clamp(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function round(value: number): number {
  return Number(value.toFixed(2));
}

function canonicalTaxon(scientificName?: string): string | null {
  if (!scientificName) return null;
  const parts = scientificName.trim().toLowerCase().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return null;
  return parts.slice(0, 2).join(" ");
}

export class MultiModalFusionEngine {
  analyzeAgreement(signals: FusionSignal[]): FusionResult {
    if (signals.length === 0) {
      return {
        final_confidence: 0,
        conflict_detected: false,
        agreement_score: 0,
        anomaly_score: 1,
        synthesis_reasoning: ["No ecological inference signals were available."],
        confidence_factors: {
          strengthened_by: [],
          reduced_by: ["No provider, ecological, temporal, or reviewer signals were available."],
        },
      };
    }

    const weighted = signals.map((signal) => {
      const reliability = clamp(signal.reliability ?? 0.75);
      const weight = MODALITY_WEIGHTS[signal.modality] * reliability;
      return {
        ...signal,
        confidence: clamp(signal.confidence),
        direction: signal.direction ?? "supporting",
        reliability,
        weight,
        taxon: canonicalTaxon(signal.scientific_name),
      };
    });

    const supporting = weighted.filter((signal) => signal.direction !== "contradicting");
    const contradicting = weighted.filter((signal) => signal.direction === "contradicting");
    const taxonSignals = supporting.filter((signal) => signal.taxon);
    const taxonCounts = new Map<string, number>();

    for (const signal of taxonSignals) {
      taxonCounts.set(signal.taxon!, (taxonCounts.get(signal.taxon!) ?? 0) + signal.weight);
    }

    const primaryTaxon = [...taxonCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const conflictingTaxa = primaryTaxon
      ? taxonSignals.filter((signal) => signal.taxon !== primaryTaxon)
      : [];

    const supportWeight = supporting.reduce((sum, signal) => sum + signal.weight, 0);
    const supportScore = supportWeight === 0
      ? 0
      : supporting.reduce((sum, signal) => sum + signal.confidence * signal.weight, 0) / supportWeight;

    const contradictionPressure = contradicting.reduce(
      (sum, signal) => sum + signal.confidence * signal.weight,
      0
    );
    const taxonomicConflictPressure = conflictingTaxa.reduce(
      (sum, signal) => sum + signal.confidence * signal.weight,
      0
    );

    const agreementScore = taxonSignals.length < 2 || !primaryTaxon
      ? 0.5
      : clamp((taxonSignals.length - conflictingTaxa.length) / taxonSignals.length);

    const agreementBoost = agreementScore >= 0.8 && taxonSignals.length > 1 ? 0.08 : 0;
    const conflictPenalty = Math.min(0.42, contradictionPressure + taxonomicConflictPressure * 1.4);
    const contextPenalty = contradicting.length > 0 ? 0.08 : 0;
    const finalConfidence = clamp(supportScore + agreementBoost - conflictPenalty - contextPenalty);
    const conflictDetected = conflictingTaxa.length > 0 || contradictionPressure > 0.08;

    const strengthenedBy = supporting
      .filter((signal) => signal.confidence >= 0.7)
      .map((signal) => signal.reasoning ?? `${signal.modality} signal from ${signal.provider} supports inference`);
    const reducedBy = [
      ...contradicting.map(
        (signal) => signal.reasoning ?? `${signal.modality} signal from ${signal.provider} conflicts with inference`
      ),
      ...conflictingTaxa.map(
        (signal) => `${signal.modality} signal from ${signal.provider} suggests ${signal.scientific_name}`
      ),
    ];

    const synthesisReasoning = [
      primaryTaxon ? `Primary taxonomic hypothesis: ${primaryTaxon}.` : "No primary taxonomic hypothesis established.",
      agreementScore >= 0.8
        ? "Cross-modal ecological signals show strong agreement."
        : "Cross-modal ecological signals require caution.",
    ];

    if (conflictDetected) {
      synthesisReasoning.push("Provider signals were treated as evidence, not truth, because conflicts were detected.");
    }

    return {
      final_confidence: round(finalConfidence),
      conflict_detected: conflictDetected,
      agreement_score: round(agreementScore),
      anomaly_score: round(clamp(1 - finalConfidence + conflictPenalty)),
      synthesis_reasoning: synthesisReasoning,
      confidence_factors: {
        strengthened_by: strengthenedBy,
        reduced_by: reducedBy,
      },
    };
  }
}

export const fusionEngine = new MultiModalFusionEngine();
