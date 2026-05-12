import { config } from "../../config";
import type { AgentTool, ToolInput, ToolOutput, SpeciesCandidate } from "../../../types/agent";
import { logger } from "../../logger";
import { AgentError } from "../../errors";

export default class GBIFTool implements AgentTool {
  name: "gbif" = "gbif";
  version: string = "1.0.0";

  async execute(input: ToolInput): Promise<ToolOutput> {
    if (!input.candidates || input.candidates.length === 0) {
      throw new AgentError("Missing candidates in ToolInput", "INVALID_INPUT", this.name);
    }

    const topCandidate = input.candidates[0];
    const scientificName = topCandidate.scientificName;
    const startTime = Date.now();

    try {
      logger.debug("Querying GBIF match API", { scientificName });
      
      const matchResponse = await fetch(
        `${config.gbif.apiBase}/species/match?name=${encodeURIComponent(scientificName)}&strict=false`
      );
      
      if (!matchResponse.ok) {
        throw new Error(`GBIF Match API failed: ${matchResponse.statusText}`);
      }
      
      const gbifMatch = await matchResponse.json();
      
      if (gbifMatch.matchType === "NONE" || !gbifMatch.usageKey) {
        return {
          success: true,
          candidates: input.candidates,
          confidence: 0,
          latencyMs: Date.now() - startTime,
          raw: { gbifMatch },
        };
      }

      const usageKey = gbifMatch.usageKey;
      logger.debug("Querying GBIF species & occurrence API", { usageKey });

      const [speciesResponse, occurrenceResponse] = await Promise.all([
        fetch(`${config.gbif.apiBase}/species/${usageKey}`),
        fetch(`${config.gbif.apiBase}/occurrence/search?taxonKey=${usageKey}&country=ID&limit=5`),
      ]);

      if (!speciesResponse.ok || !occurrenceResponse.ok) {
        throw new Error("GBIF subsequent APIs failed");
      }

      const gbifSpecies = await speciesResponse.json();
      const indonesianOccurrences = await occurrenceResponse.json();

      const confidence = gbifMatch.matchType === "EXACT" ? 1.0 : 0.6;

      const updatedCandidates: SpeciesCandidate[] = [
        {
          ...topCandidate,
          gbifTaxonKey: usageKey,
        },
        ...input.candidates.slice(1),
      ];

      return {
        success: true,
        candidates: updatedCandidates,
        confidence,
        latencyMs: Date.now() - startTime,
        raw: {
          gbifMatch,
          gbifSpecies,
          indonesianOccurrences,
        },
      };

    } catch (error) {
      const latencyMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("GBIF tool failed", { error: errorMessage, latencyMs });
      
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
      error: "GBIF unavailable",
      latencyMs: 0,
    };
  }
}
