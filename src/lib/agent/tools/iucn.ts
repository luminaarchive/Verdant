import { config } from "../../config";
import type { AgentTool, ToolInput, ToolOutput } from "../../../types/agent";
import { logger } from "../../logger";
import { AgentError } from "../../errors";

export default class IUCNTool implements AgentTool {
  name: "iucn" = "iucn";
  version: string = "1.0.0";

  async execute(input: ToolInput): Promise<ToolOutput> {
    if (!input.candidates || input.candidates.length === 0) {
      throw new AgentError("Missing candidates in ToolInput", "INVALID_INPUT", this.name);
    }

    const topCandidate = input.candidates[0];
    const startTime = Date.now();

    try {
      const { apiKey, apiBase } = config.iucn;
      let speciesData = null;

      if (topCandidate.iucnId) {
        logger.debug("Querying IUCN by ID", { iucnId: topCandidate.iucnId });
        const res = await fetch(`${apiBase}/species/id/${topCandidate.iucnId}?token=${apiKey}`);
        if (!res.ok) throw new Error(`IUCN ID API failed: ${res.statusText}`);
        const data = await res.json();
        if (data.result && data.result.length > 0) {
          speciesData = data.result[0];
        }
      }

      if (!speciesData && topCandidate.scientificName) {
        logger.debug("Querying IUCN by Scientific Name", { scientificName: topCandidate.scientificName });
        const res = await fetch(`${apiBase}/species/${encodeURIComponent(topCandidate.scientificName)}?token=${apiKey}`);
        if (!res.ok) throw new Error(`IUCN Name API failed: ${res.statusText}`);
        const data = await res.json();
        if (data.result && data.result.length > 0) {
          speciesData = data.result[0];
        }
      }

      if (!speciesData) {
        // Treat as DD (Data Deficient) or not in database, rather than error
        return {
          success: true,
          candidates: input.candidates,
          confidence: 0,
          latencyMs: Date.now() - startTime,
          raw: {
            conservationStatus: "DD",
            populationTrend: "unknown",
            threats: [],
          },
        };
      }

      logger.debug("Querying IUCN threats", { scientificName: speciesData.scientific_name });
      const threatsRes = await fetch(`${apiBase}/species/threats/${encodeURIComponent(speciesData.scientific_name)}?token=${apiKey}`);
      let threatsList: any[] = [];
      if (threatsRes.ok) {
        const threatsData = await threatsRes.json();
        threatsList = threatsData.result || [];
      }

      const rawResult = {
        conservationStatus: speciesData.category || "DD",
        populationTrend: speciesData.population_trend || "unknown",
        threats: threatsList.map((t: any) => t.title),
      };

      return {
        success: true,
        candidates: input.candidates,
        confidence: 1.0,
        latencyMs: Date.now() - startTime,
        raw: rawResult,
      };

    } catch (error) {
      const latencyMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("IUCN tool failed", { error: errorMessage, latencyMs });
      
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
      error: "IUCN unavailable",
      latencyMs: 0,
    };
  }
}
