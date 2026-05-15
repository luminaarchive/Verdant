export type ScientificProviderStatus = "live" | "configured" | "unconfigured" | "degraded" | "fallback";

export type ScientificBridgeSource =
  | "GBIF"
  | "IUCN Red List"
  | "eBird"
  | "iNaturalist"
  | "Encyclopedia of Life"
  | "Catalogue of Life"
  | "NaLI golden set";

export type ScientificBridgeResponse<T> = {
  status: ScientificProviderStatus;
  sourceName: ScientificBridgeSource;
  timestamp: string;
  confidenceContribution: number;
  data: T | null;
  rawReference?: {
    url: string;
    summary: string;
  };
  error?: string;
};

export type ProviderHealthEntry = {
  name: string;
  status: ScientificProviderStatus;
  purpose: string;
  purposeId?: string;
  requiresEnv?: string;
  note: string;
  noteId?: string;
};

export type GbifSpeciesMatch = {
  usageKey?: number;
  scientificName: string;
  canonicalName?: string;
  rank?: string;
  status?: string;
  confidence?: number;
  matchType?: string;
};

export type GbifOccurrenceContext = {
  taxonKey?: number;
  country?: string;
  occurrenceCount: number;
  countryOccurrenceCount?: number;
  distributionConfidence: "low" | "medium" | "high" | "unknown";
};

export type IucnConservationContext = {
  scientificName: string;
  category?: string;
  populationTrend?: string;
  threats: string[];
  habitats: string[];
  conservationActions: string[];
  riskExplanation: string;
};

export type EBirdContext = {
  scientificName: string;
  speciesCode?: string;
  category?: string;
  occurrenceSignal: "configured" | "unconfigured" | "unavailable";
};

export type INaturalistContext = {
  taxonId?: number;
  name: string;
  preferredCommonName?: string;
  observationCount?: number;
  communitySignal: string;
};

export type EolContext = {
  pageId?: number;
  scientificName: string;
  commonNames: string[];
  description?: string;
  traitSignal?: string;
};

export type CatalogueOfLifeContext = {
  usageId?: string;
  scientificName: string;
  status?: string;
  rank?: string;
  datasetKey?: number;
};

export function nowIso() {
  return new Date().toISOString();
}

export function bridgeError(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 180);
  return "Provider request failed.";
}
