import { VisionTool } from "@/lib/agent/tools/vision";
import { GBIFTool } from "@/lib/agent/tools/gbif";
import { IUCNTool } from "@/lib/agent/tools/iucn";
import { AnomalyTool } from "@/lib/agent/tools/anomaly";
import { logger } from "@/lib/logger";
import { AgentError, toAppError } from "@/lib/errors";
import type { AgentResult, ToolInput, ToolName } from "@/types/agent";
import type { Result } from "@/types/common";
import { config } from "@/lib/config";
import { IDENTIFY_PROMPT } from "@/lib/agent/prompts/versions";

// NOTE: You would normally inject Supabase client here to log to analysis_runs,
// but for simplicity we assume there's a logging function or we leave a comment.

export async function runNaLIAgent(input: ToolInput & { observationId: string }): Promise<Result<AgentResult>> {
  const startTime = Date.now();
  const toolsUsed: ToolName[] = [];
  let totalLatencyMs = 0;

  try {
    logger.info("Starting NaLI Agent Orchestration", { observationId: input.observationId });

    // Step 1: VisionTool
    const vision = new VisionTool();
    const visionOut = await vision.execute(input);
    toolsUsed.push(vision.name);
    totalLatencyMs += visionOut.latencyMs;

    let currentCandidates = visionOut.candidates || [];

    // Step 2: GBIFTool
    if (currentCandidates.length > 0) {
      const gbif = new GBIFTool();
      const gbifOut = await gbif.execute({ ...input, candidates: currentCandidates });
      toolsUsed.push(gbif.name);
      totalLatencyMs += gbifOut.latencyMs;
      if (gbifOut.candidates) {
        currentCandidates = gbifOut.candidates;
      }
    }

    let conservationStatus: string | undefined;
    
    // Step 3: IUCNTool
    if (currentCandidates.length > 0) {
      const iucn = new IUCNTool();
      const iucnOut = await iucn.execute({ ...input, candidates: currentCandidates });
      toolsUsed.push(iucn.name);
      totalLatencyMs += iucnOut.latencyMs;
      
      const rawIucn = iucnOut.raw as { category?: string } | undefined;
      if (rawIucn?.category) {
        conservationStatus = rawIucn.category;
      }
    }

    let isAnomaly = false;
    let anomalyReason: string | undefined;

    // Step 4: AnomalyTool
    if (currentCandidates.length > 0 && input.latitude && input.longitude) {
      const anomaly = new AnomalyTool();
      const anomalyOut = await anomaly.execute({ ...input, candidates: currentCandidates });
      toolsUsed.push(anomaly.name);
      totalLatencyMs += anomalyOut.latencyMs;

      const rawAnomaly = anomalyOut.raw as { isAnomaly?: boolean, reason?: string } | undefined;
      if (rawAnomaly) {
        isAnomaly = rawAnomaly.isAnomaly || false;
        anomalyReason = rawAnomaly.reason;
      }
    }

    const finalSpecies = currentCandidates.length > 0 ? currentCandidates[0] : null;
    const finalConfidence = finalSpecies?.confidence || 0;

    const agentResult: AgentResult = {
      observationId: input.observationId,
      finalSpecies,
      confidence: finalConfidence,
      isAnomaly,
      anomalyReason,
      conservationStatus,
      toolsUsed,
      totalLatencyMs,
      promptVersion: IDENTIFY_PROMPT.version,
      modelName: config.anthropic.model,
    };

    logger.info("NaLI Agent Orchestration completed", { 
      observationId: input.observationId,
      finalSpecies: finalSpecies?.scientificName,
      confidence: finalConfidence
    });

    // TODO: Log entire run to analysis_runs table in Supabase for each tool

    return {
      success: true,
      data: agentResult,
    };
  } catch (error) {
    logger.error("NaLI Agent Orchestration failed", { error, observationId: input.observationId });
    return {
      success: false,
      error: toAppError(error),
    };
  }
}
