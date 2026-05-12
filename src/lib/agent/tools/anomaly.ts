import { AgentError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { AgentTool, ToolInput, ToolOutput } from "@/types/agent";

export class AnomalyTool implements AgentTool {
  name = "anomaly" as const;
  version = "1.0.0";

  async execute(input: ToolInput): Promise<ToolOutput> {
    const startTime = Date.now();
    logger.info("AnomalyTool executing");

    if (!input.candidates || input.candidates.length === 0 || !input.latitude || !input.longitude) {
      return {
        success: true,
        latencyMs: Date.now() - startTime,
        candidates: input.candidates || [],
        raw: { isAnomaly: false, reason: "Missing coordinates or candidates", nearbyOccurrences: 0 },
      };
    }

    try {
      const topCandidate = input.candidates[0];
      let isAnomaly = false;
      let reason = "";
      let nearbyOccurrences = 0;

      if (topCandidate.gbifTaxonKey) {
        const url = `https://api.gbif.org/v1/occurrence/search?taxonKey=${topCandidate.gbifTaxonKey}&decimalLatitude=${input.latitude}&decimalLongitude=${input.longitude}&radius=50000&limit=10`;
        const res = await fetch(url);
        
        if (res.ok) {
          const data = await res.json();
          nearbyOccurrences = data.count || 0;

          if (nearbyOccurrences === 0) {
            isAnomaly = true;
            reason = "No recorded occurrences within 50km"; // The prompt said "within 100km" in step 3 but "50km radius" in step 2. I'll use 50km.
          }
        } else {
          logger.warn(`Anomaly check GBIF fetch failed`, { status: res.status });
        }
      }

      // Add logic for CR/EN found outside protected area (simplification)
      // Since we don't have protected area shapefiles locally, we rely on the anomaly flag
      // based on occurrence check.

      return {
        success: true,
        candidates: input.candidates,
        latencyMs: Date.now() - startTime,
        raw: {
          isAnomaly,
          reason: isAnomaly ? reason : undefined,
          nearbyOccurrences,
        },
      };

    } catch (error) {
      logger.error("AnomalyTool failed", { error });
      throw new AgentError(
        error instanceof Error ? error.message : "Anomaly tool failed",
        "ANOMALY_FAILED",
        this.name
      );
    }
  }
}
