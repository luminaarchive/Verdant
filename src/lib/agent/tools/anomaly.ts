import { config } from "../../config";
import type { AgentTool, ToolInput, ToolOutput } from "../../../types/agent";
import { logger } from "../../logger";

export default class AnomalyTool implements AgentTool {
  name: "anomaly" = "anomaly";
  version: string = "1.0.0";

  async execute(input: ToolInput): Promise<ToolOutput> {
    if (!input.candidates || input.candidates.length === 0) {
      return { success: false, error: "Missing candidates in ToolInput", latencyMs: 0 };
    }

    if (input.latitude === undefined || input.longitude === undefined) {
      return { success: false, error: "Missing location data for anomaly check", latencyMs: 0 };
    }

    const topCandidate = input.candidates[0];
    
    if (!topCandidate.gbifTaxonKey) {
      return { success: false, error: "Missing gbifTaxonKey for anomaly check", latencyMs: 0 };
    }

    const startTime = Date.now();

    try {
      const { gbifTaxonKey } = topCandidate;
      const { latitude, longitude } = input;
      
      logger.debug("Running anomaly check via GBIF occurrences", { gbifTaxonKey, latitude, longitude });

      // 1. Check local radius (50km)
      const radiusResponse = await fetch(
        `${config.gbif.apiBase}/occurrence/search?taxonKey=${gbifTaxonKey}&decimalLatitude=${latitude}&decimalLongitude=${longitude}&radius=50&limit=1`
      );

      if (!radiusResponse.ok) {
        throw new Error(`GBIF local occurrence API failed: ${radiusResponse.statusText}`);
      }

      const radiusData = await radiusResponse.json();
      
      if (radiusData.count > 0) {
        return {
          success: true,
          confidence: 1.0,
          latencyMs: Date.now() - startTime,
          raw: {
            isAnomaly: false,
            nearbyOccurrences: radiusData.count,
          },
        };
      }

      // 2. No local occurrences. Check if exists in Indonesia at all.
      const countryResponse = await fetch(
        `${config.gbif.apiBase}/occurrence/search?taxonKey=${gbifTaxonKey}&country=ID&limit=1`
      );

      if (!countryResponse.ok) {
        throw new Error(`GBIF country occurrence API failed: ${countryResponse.statusText}`);
      }

      const countryData = await countryResponse.json();

      let isAnomaly = true;
      let anomalyReason = "";

      if (countryData.count > 0) {
        anomalyReason = "Species not previously recorded in this area";
      } else {
        anomalyReason = "Species has no recorded occurrences in Indonesia";
      }

      return {
        success: true,
        confidence: 1.0,
        latencyMs: Date.now() - startTime,
        raw: {
          isAnomaly,
          anomalyReason,
          nearbyOccurrences: 0,
        },
      };

    } catch (error) {
      const latencyMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("Anomaly tool failed", { error: errorMessage, latencyMs });
      
      return {
        success: false,
        error: errorMessage,
        latencyMs,
      };
    }
  }

  async fallback(): Promise<ToolOutput> {
    return {
      success: false,
      error: "Anomaly check unavailable",
      latencyMs: 0,
    };
  }
}
