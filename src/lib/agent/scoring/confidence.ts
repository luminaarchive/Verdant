import type { ToolName, ToolOutput, SpeciesCandidate } from "../../../types/agent";

export function calculateFinalConfidence(toolOutputs: Partial<Record<ToolName, ToolOutput>>): number {
  let score = 0;
  
  if (toolOutputs.vision?.success && toolOutputs.vision.confidence !== undefined) {
    score += toolOutputs.vision.confidence * 0.5;
  }
  
  if (toolOutputs.gbif?.success && toolOutputs.gbif.confidence !== undefined) {
    score += toolOutputs.gbif.confidence * 0.3;
  }
  
  if (toolOutputs.iucn?.success && toolOutputs.iucn.confidence !== undefined) {
    score += toolOutputs.iucn.confidence * 0.2;
  }
  
  const visionConf = toolOutputs.vision?.confidence || 0;
  const gbifConf = toolOutputs.gbif?.confidence || 0;
  
  if (visionConf > 0.85 && gbifConf > 0) {
    score += 0.1;
  }
  
  if (score > 1.0) score = 1.0;
  
  return Math.round(score * 100) / 100;
}

export function selectTopCandidate(
  visionCandidates: SpeciesCandidate[],
  gbifCandidates: SpeciesCandidate[]
): SpeciesCandidate | null {
  if (visionCandidates.length === 0 && gbifCandidates.length === 0) {
    return null;
  }
  
  const combined = [...visionCandidates, ...gbifCandidates];
  const grouped = new Map<string, SpeciesCandidate>();
  
  for (const candidate of combined) {
    const key = candidate.scientificName.trim().toLowerCase();
    if (grouped.has(key)) {
      const existing = grouped.get(key)!;
      existing.confidence = Math.min(1.0, existing.confidence + 0.15);
      existing.gbifTaxonKey = existing.gbifTaxonKey || candidate.gbifTaxonKey;
      existing.iucnId = existing.iucnId || candidate.iucnId;
    } else {
      grouped.set(key, { ...candidate });
    }
  }
  
  let top: SpeciesCandidate | null = null;
  for (const candidate of grouped.values()) {
    if (!top || candidate.confidence > top.confidence) {
      top = candidate;
    }
  }
  
  return top;
}

export function shouldFlagForReview(confidence: number, isAnomaly: boolean): boolean {
  if (confidence < 0.6) return true;
  if (isAnomaly && confidence < 0.8) return true;
  return false;
}
