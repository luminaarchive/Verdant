// NaLI: IUCN Provider Implementation
import { ConservationProvider, ConservationResult, ProviderHealth } from "../base";
import { logger } from "@/lib/logger";

export class IUCNProvider implements ConservationProvider {
  name = "IUCN Red List API";
  version = "iucn-v4";
  // The official API requires a token, which we will expect in process.env.
  // For safety, we fall back to mock if token is missing or request fails.
  private baseUrl = "https://apiv3.iucnredlist.org/api/v3"; 

  async healthCheck(): Promise<ProviderHealth> {
    const token = process.env.IUCN_API_TOKEN;
    if (!token) return { status: 'degraded', latency_ms: 0, last_checked: new Date(), error: "No API token" };

    try {
      const start = Date.now();
      // A simple version check endpoint or known species fetch
      const res = await fetch(`${this.baseUrl}/version`);
      const latency = Date.now() - start;
      if (!res.ok) throw new Error(`IUCN returned ${res.status}`);
      return { status: 'healthy', latency_ms: latency, last_checked: new Date() };
    } catch (err: any) {
      return { status: 'down', latency_ms: -1, last_checked: new Date(), error: err.message };
    }
  }

  async getConservationStatus(scientificName: string): Promise<ConservationResult> {
    const token = process.env.IUCN_API_TOKEN;
    
    if (!token) {
      logger.warn("IUCN_API_TOKEN missing. Using mocked IUCN provider.");
      return this.mockFallback(scientificName);
    }

    try {
      // 1. Fetch Species Status
      const statusRes = await fetch(`${this.baseUrl}/species/${encodeURIComponent(scientificName)}?token=${token}`);
      if (!statusRes.ok) throw new Error("IUCN species query failed");
      const statusData = await statusRes.json();
      
      const speciesResult = statusData.result?.[0];
      if (!speciesResult) {
        throw new Error("Species not found in IUCN Red List");
      }

      // 2. Fetch Threats
      const threatRes = await fetch(`${this.baseUrl}/threats/species/name/${encodeURIComponent(scientificName)}?token=${token}`);
      const threatData = threatRes.ok ? await threatRes.json() : { result: [] };
      const mainThreats = threatData.result?.slice(0, 3).map((t: any) => t.title).join(", ") || "No major threats recorded";

      // 3. Fetch Habitats
      const habitatRes = await fetch(`${this.baseUrl}/habitats/species/name/${encodeURIComponent(scientificName)}?token=${token}`);
      const habitatData = habitatRes.ok ? await habitatRes.json() : { result: [] };
      
      // Calculate fragility score based on number of suitable habitats (fewer = more fragile)
      // Highly simplified heuristic for architectural stub
      const suitableHabitats = habitatData.result?.filter((h: any) => h.suitability === "Suitable")?.length || 5;
      const fragilityScore = Math.max(0, 1.0 - (suitableHabitats / 10)); // e.g. 1 habitat = 0.9 fragility

      return {
        iucn_id: speciesResult.taxonid,
        threat_status: speciesResult.category,
        threat_level_summary: mainThreats,
        habitat_fragility_score: fragilityScore,
        raw_output: `IUCN Status: ${speciesResult.category}. Population trend: ${speciesResult.population_trend || 'Unknown'}.`
      };

    } catch (error: any) {
      logger.warn(`IUCN HTTP failed. Falling back to mock. Error: ${error.message}`);
      return this.mockFallback(scientificName);
    }
  }

  private mockFallback(scientificName: string): ConservationResult {
    // Simulated fallback behavior
    const isEndangered = scientificName.includes("Pongo") || scientificName.includes("tigris");
    return {
      threat_status: isEndangered ? "CR" : "LC",
      threat_level_summary: isEndangered ? "Habitat loss, poaching" : "Minimal threats",
      habitat_fragility_score: isEndangered ? 0.85 : 0.2,
      raw_output: `IUCN API unreachable. Local heuristic applied for ${scientificName}.`
    };
  }
}
