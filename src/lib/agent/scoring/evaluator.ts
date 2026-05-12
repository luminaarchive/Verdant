import type { AgentResult, ToolName } from "../../../types/agent";

export type EvaluationResult = {
  observationId: string;
  expectedScientificName: string;
  actualScientificName: string | null;
  isCorrect: boolean;
  confidenceScore: number;
  latencyMs: number;
  toolsUsed: ToolName[];
};

export function evaluateResult(
  result: AgentResult,
  expectedScientificName: string
): EvaluationResult {
  const actualName = result.finalSpecies?.scientificName?.trim().toLowerCase() || null;
  const expectedName = expectedScientificName.trim().toLowerCase();
  
  return {
    observationId: result.observationId,
    expectedScientificName,
    actualScientificName: result.finalSpecies?.scientificName || null,
    isCorrect: actualName === expectedName,
    confidenceScore: result.confidence,
    latencyMs: result.totalLatencyMs,
    toolsUsed: result.toolsUsed,
  };
}

export function calculateAccuracy(evaluations: EvaluationResult[]): number {
  if (evaluations.length === 0) return 0;
  
  const correctCount = evaluations.filter(e => e.isCorrect).length;
  return correctCount / evaluations.length;
}
