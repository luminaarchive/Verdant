// NaLI: GBIF Provider Implementation
import { TaxonomyProvider, TaxonomyResult, ProviderHealth } from "../base";
import { logger } from "@/lib/logger";

export class GBIFProvider implements TaxonomyProvider {
  name = "GBIF Taxonomy";
  version = "gbif-api-v1";
  private baseUrl = "https://api.gbif.org/v1";

  async healthCheck(): Promise<ProviderHealth> {
    try {
      const start = Date.now();
      const res = await fetch(`${this.baseUrl}/species/match?name=Panthera tigris`);
      const latency = Date.now() - start;
      if (!res.ok) throw new Error(`GBIF returned ${res.status}`);
      return { status: "healthy", latency_ms: latency, last_checked: new Date() };
    } catch (err: any) {
      return { status: "down", latency_ms: -1, last_checked: new Date(), error: err.message };
    }
  }

  async crossCheckOccurrence(scientificName: string, lat: number, lng: number): Promise<TaxonomyResult> {
    try {
      // 1. Resolve Species Key
      const matchRes = await fetch(`${this.baseUrl}/species/match?name=${encodeURIComponent(scientificName)}`);
      if (!matchRes.ok) throw new Error("GBIF species match failed");
      const matchData = await matchRes.json();
      const taxonKey = matchData.usageKey;

      if (!taxonKey) {
        throw new Error("Species not found in GBIF backbone");
      }

      // 2. Query Occurrences nearby (approx 50km bounding box for density estimation)
      // Note: a production importer should use precise geospatial filters and cache policy.
      const occurrenceRes = await fetch(
        `${this.baseUrl}/occurrence/search?taxonKey=${taxonKey}&decimalLatitude=${lat - 0.5},${lat + 0.5}&decimalLongitude=${lng - 0.5},${lng + 0.5}&limit=0`,
      );

      if (!occurrenceRes.ok) throw new Error("GBIF occurrence search failed");
      const occurrenceData = await occurrenceRes.json();

      const count = occurrenceData.count || 0;

      // Calculate ecological metrics
      const densityScore = Math.min(count / 100, 1.0); // Normalize: 100+ sightings in region = 1.0 density
      const regionalConfidence = densityScore > 0.5 ? 0.1 : densityScore === 0 ? -0.3 : 0.0;

      return {
        gbif_taxon_key: taxonKey,
        scientific_name: matchData.scientificName || scientificName,
        occurrence_density_score: densityScore,
        regional_confidence_adjustment: regionalConfidence,
        raw_output: `GBIF verified. Regional occurrence count: ${count}.`,
      };
    } catch (error: any) {
      logger.warn(`GBIF HTTP failed. Falling back to mock. Error: ${error.message}`);
      return this.mockFallback(scientificName);
    }
  }

  private mockFallback(scientificName: string): TaxonomyResult {
    // Simulated fallback behavior
    return {
      scientific_name: scientificName,
      occurrence_density_score: 0.4, // Ambiguous density
      regional_confidence_adjustment: 0.0, // Neutral adjustment
      raw_output: `GBIF API unreachable. Using local taxonomy mock for ${scientificName}.`,
    };
  }
}
