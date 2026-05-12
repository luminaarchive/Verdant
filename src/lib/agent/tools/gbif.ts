import { AgentError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { AgentTool, ToolInput, ToolOutput, SpeciesCandidate } from "@/types/agent";

export class GBIFTool implements AgentTool {
  name = "gbif" as const;
  version = "1.0.0";

  async execute(input: ToolInput): Promise<ToolOutput> {
    const startTime = Date.now();
    logger.info("GBIFTool executing", { candidatesCount: input.candidates?.length });

    if (!input.candidates || input.candidates.length === 0) {
      return {
        success: true,
        latencyMs: Date.now() - startTime,
        candidates: [],
      };
    }

    try {
      const enrichedCandidates: SpeciesCandidate[] = [];

      // Max 3 candidates
      const candidatesToProcess = input.candidates.slice(0, 3);

      for (const candidate of candidatesToProcess) {
        const matchRes = await fetch(
          `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(candidate.scientificName)}&strict=false`
        );
        
        if (!matchRes.ok) {
          logger.warn(`GBIF match failed for ${candidate.scientificName}`, { status: matchRes.status });
          enrichedCandidates.push(candidate);
          continue;
        }

        const matchData = await matchRes.json();
        const taxonKey = matchData.usageKey || matchData.speciesKey || matchData.genusKey;

        let enriched = { ...candidate };

        if (taxonKey) {
          enriched.gbifTaxonKey = taxonKey;

          // Check occurrences in Indonesia
          const occRes = await fetch(
            `https://api.gbif.org/v1/occurrence/search?taxonKey=${taxonKey}&country=ID&limit=5`
          );

          if (occRes.ok) {
            const occData = await occRes.json();
            const count = occData.count || 0;
            
            if (count > 0) {
              // Increase confidence slightly, max +0.05
              const adjustment = Math.min(0.05, count * 0.001);
              enriched.confidence = Math.min(1.0, enriched.confidence + adjustment);
            } else {
              // Not found in Indonesia, lower confidence
              enriched.confidence = Math.max(0.0, enriched.confidence - 0.1);
            }
          }
        }

        enrichedCandidates.push(enriched);
      }

      // Sort again by confidence after adjustments
      enrichedCandidates.sort((a, b) => b.confidence - a.confidence);

      return {
        success: true,
        candidates: enrichedCandidates,
        confidence: enrichedCandidates[0]?.confidence || 0,
        latencyMs: Date.now() - startTime,
        raw: { processed: enrichedCandidates.length },
      };
    } catch (error) {
      logger.error("GBIFTool failed", { error });
      throw new AgentError(
        error instanceof Error ? error.message : "GBIF tool failed",
        "GBIF_FAILED",
        this.name
      );
    }
  }
}
