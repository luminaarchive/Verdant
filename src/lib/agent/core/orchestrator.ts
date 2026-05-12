import VisionTool from "../tools/vision";
import GBIFTool from "../tools/gbif";
import IUCNTool from "../tools/iucn";
import AnomalyTool from "../tools/anomaly";
import { calculateFinalConfidence, selectTopCandidate, shouldFlagForReview } from "../scoring/confidence";
import type { AgentResult, ToolInput, ToolOutput, ToolName, SpeciesCandidate } from "../../../types/agent";
import { logger } from "../../logger";
import { MODEL_NAME, PROMPT_VERSIONS } from "../prompts/versions";

export class NaLIOrchestrator {
  private vision: VisionTool;
  private gbif: GBIFTool;
  private iucn: IUCNTool;
  private anomaly: AnomalyTool;

  constructor() {
    this.vision = new VisionTool();
    this.gbif = new GBIFTool();
    this.iucn = new IUCNTool();
    this.anomaly = new AnomalyTool();
  }

  async analyze(observationId: string, input: ToolInput): Promise<AgentResult> {
    const startTime = Date.now();
    const toolsUsed: ToolName[] = [];
    const toolOutputs: Partial<Record<ToolName, ToolOutput>> = {};

    let currentCandidates: SpeciesCandidate[] = [];

    // STEP 1: Vision
    if (input.photoUrl) {
      try {
        const visionResult = await this.vision.execute(input);
        toolOutputs.vision = visionResult;
        toolsUsed.push("vision");
        if (visionResult.success && visionResult.candidates) {
          currentCandidates = visionResult.candidates;
        }
      } catch (error) {
        logger.error("Vision tool failed in orchestrator", { error, observationId });
        toolOutputs.vision = await this.vision.fallback();
      }
    }

    // STEP 2: GBIF
    let gbifCandidates: SpeciesCandidate[] = [];
    if (currentCandidates.length > 0) {
      try {
        const gbifInput = { ...input, candidates: currentCandidates };
        const gbifResult = await this.gbif.execute(gbifInput);
        toolOutputs.gbif = gbifResult;
        toolsUsed.push("gbif");
        if (gbifResult.success && gbifResult.candidates) {
          gbifCandidates = gbifResult.candidates;
          const mergedTop = selectTopCandidate(currentCandidates, gbifCandidates);
          if (mergedTop) {
            currentCandidates = [mergedTop];
          }
        }
      } catch (error) {
        logger.error("GBIF tool failed in orchestrator", { error, observationId });
        toolOutputs.gbif = await this.gbif.fallback();
      }
    }

    // STEP 3: IUCN
    const visionConf = toolOutputs.vision?.confidence || 0;
    const gbifMatch = (toolOutputs.gbif?.confidence || 0) > 0;
    
    if (gbifMatch || visionConf > 0.5) {
      if (currentCandidates.length > 0) {
        try {
          const iucnInput = { ...input, candidates: currentCandidates };
          const iucnResult = await this.iucn.execute(iucnInput);
          toolOutputs.iucn = iucnResult;
          toolsUsed.push("iucn");
        } catch (error) {
          logger.error("IUCN tool failed in orchestrator", { error, observationId });
          toolOutputs.iucn = await this.iucn.fallback();
        }
      }
    }

    // STEP 4: Anomaly
    const topCandidate = selectTopCandidate(currentCandidates, gbifCandidates);
    let isAnomaly = false;
    let anomalyReason: string | undefined = undefined;

    if (topCandidate?.gbifTaxonKey && input.latitude !== undefined && input.longitude !== undefined) {
      try {
        const anomalyInput = { ...input, candidates: [topCandidate] };
        const anomalyResult = await this.anomaly.execute(anomalyInput);
        toolOutputs.anomaly = anomalyResult;
        toolsUsed.push("anomaly");
        
        if (anomalyResult.success && anomalyResult.raw) {
          const rawAnomaly = anomalyResult.raw as { isAnomaly: boolean; anomalyReason?: string };
          isAnomaly = rawAnomaly.isAnomaly;
          anomalyReason = rawAnomaly.anomalyReason;
        }
      } catch (error) {
        logger.error("Anomaly tool failed in orchestrator", { error, observationId });
        toolOutputs.anomaly = await this.anomaly.fallback();
      }
    }

    // STEP 5: Calculate final result
    const finalConfidence = calculateFinalConfidence(toolOutputs);
    let conservationStatus: string | undefined = undefined;
    
    if (toolOutputs.iucn?.success && toolOutputs.iucn.raw) {
      const rawIucn = toolOutputs.iucn.raw as { conservationStatus?: string };
      conservationStatus = rawIucn.conservationStatus;
    }

    if (toolsUsed.length === 0 || !topCandidate) {
      return {
        observationId,
        finalSpecies: null,
        confidence: 0,
        isAnomaly: false,
        toolsUsed: [],
        totalLatencyMs: Date.now() - startTime,
        promptVersion: PROMPT_VERSIONS.vision,
        modelName: MODEL_NAME,
      };
    }

    return {
      observationId,
      finalSpecies: topCandidate,
      confidence: finalConfidence,
      isAnomaly,
      anomalyReason,
      conservationStatus,
      toolsUsed,
      totalLatencyMs: Date.now() - startTime,
      promptVersion: PROMPT_VERSIONS.vision,
      modelName: MODEL_NAME,
    };
  }
}

export const naliOrchestrator = new NaLIOrchestrator();
