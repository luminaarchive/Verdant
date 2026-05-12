export type ToolName = "vision" | "audio" | "gbif" | "iucn" | "anomaly";

export type SpeciesCandidate = {
  scientificName: string;
  commonNameId: string;
  confidence: number;
  gbifTaxonKey?: number;
  iucnId?: string;
};

export type ToolInput = {
  photoUrl?: string;
  audioUrl?: string;
  text?: string;
  latitude?: number;
  longitude?: number;
  candidates?: SpeciesCandidate[];
};

export type ToolOutput = {
  success: boolean;
  candidates?: SpeciesCandidate[];
  confidence?: number;
  error?: string;
  latencyMs: number;
  raw?: unknown;
};

export interface AgentTool {
  name: ToolName;
  version: string;
  execute(input: ToolInput): Promise<ToolOutput>;
  fallback?(): Promise<ToolOutput>;
}

export type AgentResult = {
  observationId: string;
  finalSpecies: SpeciesCandidate | null;
  confidence: number;
  isAnomaly: boolean;
  anomalyReason?: string;
  conservationStatus?: string;
  toolsUsed: ToolName[];
  totalLatencyMs: number;
  promptVersion: string;
  modelName: string;
};

export type AnalysisRun = {
  id: string;
  observationId: string;
  modelName: string;
  promptVersion: string;
  toolUsed: ToolName;
  candidateSpecies: SpeciesCandidate[];
  scorePerTool: Record<string, number>;
  latencyMs: number;
  retryCount: number;
  error: string | null;
  rawOutput: unknown;
  createdAt: string;
};
