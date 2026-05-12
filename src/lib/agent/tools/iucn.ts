import { config } from "@/lib/config";
import { AgentError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { AgentTool, ToolInput, ToolOutput } from "@/types/agent";

export class IUCNTool implements AgentTool {
  name = "iucn" as const;
  version = "1.0.0";

  async execute(input: ToolInput): Promise<ToolOutput> {
    const startTime = Date.now();
    logger.info("IUCNTool executing", { candidatesCount: input.candidates?.length });

    if (!input.candidates || input.candidates.length === 0) {
      return {
        success: true,
        latencyMs: Date.now() - startTime,
        candidates: [],
      };
    }

    try {
      const topCandidate = input.candidates[0];
      const encodedName = encodeURIComponent(topCandidate.scientificName);
      const url = `${config.iucn.apiBase}/species/${encodedName}?token=${config.iucn.apiKey}`;
      
      const res = await fetch(url);
      
      if (!res.ok) {
        logger.warn(`IUCN API returned ${res.status}`);
        return {
          success: true,
          candidates: input.candidates,
          latencyMs: Date.now() - startTime,
          raw: { iucnFound: false, status: res.status }
        };
      }

      const data = await res.json();
      
      let iucnRawData = null;
      if (data.result && data.result.length > 0) {
        const result = data.result[0];
        iucnRawData = {
          category: result.category,
          population_trend: result.population_trend,
        };
      }

      return {
        success: true,
        candidates: input.candidates,
        confidence: topCandidate.confidence,
        latencyMs: Date.now() - startTime,
        raw: iucnRawData,
      };

    } catch (error) {
      logger.error("IUCNTool failed", { error });
      throw new AgentError(
        error instanceof Error ? error.message : "IUCN tool failed",
        "IUCN_FAILED",
        this.name
      );
    }
  }
}
