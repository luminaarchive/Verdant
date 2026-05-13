// NaLI: Provider Abstraction Contracts

export interface ProviderHealth {
  status: 'healthy' | 'degraded' | 'down';
  latency_ms: number;
  last_checked: Date;
  error?: string;
}

export interface BaseProvider {
  name: string;
  version: string;
  healthCheck(): Promise<ProviderHealth>;
}

export interface VisionResult {
  confidence: number;
  species_scientific_name: string;
  species_common_name?: string;
  raw_output: string;
  provider_metrics: Record<string, any>;
}

export interface TaxonomyResult {
  gbif_taxon_key?: number;
  scientific_name: string;
  occurrence_density_score: number; // 0.0 to 1.0
  regional_confidence_adjustment: number; // e.g. -0.2 to +0.2
  raw_output: string;
}

export interface ConservationResult {
  iucn_id?: number;
  threat_status: string; // e.g., 'CR', 'EN', 'LC'
  threat_level_summary: string;
  habitat_fragility_score: number; // 0.0 to 1.0
  raw_output: string;
}

export interface VisionProvider extends BaseProvider {
  identifySpecies(imageUrl: string, lat: number, lng: number): Promise<VisionResult>;
}

export interface TaxonomyProvider extends BaseProvider {
  crossCheckOccurrence(scientificName: string, lat: number, lng: number): Promise<TaxonomyResult>;
}

export interface ConservationProvider extends BaseProvider {
  getConservationStatus(scientificName: string): Promise<ConservationResult>;
}
