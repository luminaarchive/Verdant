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

export type ProviderMetrics = Record<string, string | number | boolean | null | undefined>;

export interface VisionResult {
  confidence: number;
  species_scientific_name: string;
  species_common_name?: string;
  raw_output: string;
  provider_metrics: ProviderMetrics;
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

export interface AudioResult {
  confidence: number;
  species_scientific_name: string;
  acoustic_environment_score: number; // 0.0 to 1.0 (wind, noise, overlapping interference)
  raw_output: string;
  provider_metrics: ProviderMetrics;
}

export interface AudioInferenceInput {
  audioUrl: string;
  lat?: number;
  lng?: number;
  recordedAt?: Date;
  regionCode?: string;
}

export interface SpectrogramAnalysis {
  call_type?: string;
  frequency_range_hz?: {
    min: number;
    max: number;
  };
  signal_to_noise_ratio?: number;
  overlap_interference?: number;
  acoustic_environment_score: number;
  raw_output: string;
}

export interface SpectrogramInput {
  spectrogramUrl: string;
  audioUrl?: string;
}

export interface ConservationProvider extends BaseProvider {
  getConservationStatus(scientificName: string): Promise<ConservationResult>;
}

export interface AudioProvider extends BaseProvider {
  identifySpecies(input: AudioInferenceInput): Promise<AudioResult>;
  analyzeSpectrogram(input: SpectrogramInput): Promise<SpectrogramAnalysis>;
}
