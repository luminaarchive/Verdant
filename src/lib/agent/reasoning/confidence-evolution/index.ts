// NaLI: Temporal Confidence Evolution

export interface ConfidenceEvolutionInput {
  base_confidence: number;
  confirmations: number;
  reviewer_disagreements: number;
  persistent_anomaly_clusters: number;
}

export interface ConfidenceEvolutionResult {
  evolved_confidence: number;
  drift: number;
  escalation_probability: number;
  reasoning: string[];
}

function clamp(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function round(value: number): number {
  return Number(value.toFixed(2));
}

export function evolveTemporalConfidence(input: ConfidenceEvolutionInput): ConfidenceEvolutionResult {
  const positiveDrift = Math.min(0.18, input.confirmations * 0.055);
  const disagreementDrift = Math.min(0.2, input.reviewer_disagreements * 0.075);
  const anomalyEscalation = Math.min(0.24, input.persistent_anomaly_clusters * 0.08);
  const drift = positiveDrift - disagreementDrift + anomalyEscalation * 0.35;
  const evolved = clamp(input.base_confidence + drift);
  const reasoning: string[] = [];

  if (input.confirmations > 0) reasoning.push("Repeated confirmations strengthen longitudinal confidence.");
  if (input.reviewer_disagreements > 0) reasoning.push("Reviewer disagreement weakens confidence stability.");
  if (input.persistent_anomaly_clusters > 0) reasoning.push("Persistent anomaly clusters increase escalation probability.");

  return {
    evolved_confidence: round(evolved),
    drift: round(drift),
    escalation_probability: round(clamp(anomalyEscalation + disagreementDrift + (1 - evolved) * 0.2)),
    reasoning,
  };
}
