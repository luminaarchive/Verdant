import { createServerSupabaseClient } from "../supabase/server";
import { getObservationById, createObservation } from "../supabase/queries/observations";
import { runNaLIAgent } from "../agent/core/orchestrator";
import { shouldFlagForReview } from "../agent/scoring/confidence";
import { uploadObservationPhoto, uploadObservationAudio } from "../storage/upload";
import { toAppError } from "../errors";
import { logger } from "../logger";
import type { Result, ObservationStatus } from "../../types/common";
import type { Observation } from "../../types/observation";
import type { AgentResult, ToolInput } from "../../types/agent";

export class ObservationService {
  async createAndAnalyze(
    userId: string,
    input: {
      photoFile?: File;
      audioFile?: File;
      textDescription?: string;
      latitude: number;
      longitude: number;
      accuracyMeters: number;
    }
  ): Promise<Result<{ observationId: string; agentResult: AgentResult }>> {
    const observationId = crypto.randomUUID();
    let photoUrl: string | undefined;
    let photoChecksum: string | null = null;
    let audioUrl: string | undefined;
    let audioChecksum: string | null = null;

    try {
      if (input.photoFile) {
        const res = await uploadObservationPhoto(userId, observationId, input.photoFile);
        if (!res.success) throw res.error;
        photoUrl = res.data.url;
        photoChecksum = res.data.checksum;
      }

      if (input.audioFile) {
        const res = await uploadObservationAudio(userId, observationId, input.audioFile);
        if (!res.success) throw res.error;
        audioUrl = res.data.url;
        audioChecksum = res.data.checksum;
      }

      const photoStorageRef = photoUrl ? `${userId}/${observationId}/photo.${input.photoFile!.name.split('.').pop() || 'jpg'}` : null;
      const audioStorageRef = audioUrl ? `${userId}/${observationId}/audio.${input.audioFile!.name.split('.').pop() || 'mp3'}` : null;

      const dbInput = {
        id: observationId,
        user_id: userId,
        latitude: input.latitude,
        longitude: input.longitude,
        accuracy_meters: input.accuracyMeters,
        text_description: input.textDescription || null,
        status: "pending",
        photo_storage_url: photoStorageRef,
        photo_checksum: photoChecksum,
        audio_storage_url: audioStorageRef,
        audio_checksum: audioChecksum,
        is_anomaly: false,
        review_status: "unreviewed",
        qa_flag: false,
        verified_by_human: false,
      } as unknown as Partial<Observation>;

      const obsResult = await createObservation(dbInput);
      if (!obsResult.success) throw obsResult.error;

      const toolInput: ToolInput = {
        photoUrl,
        audioUrl,
        text: input.textDescription,
        latitude: input.latitude,
        longitude: input.longitude,
      };

      const orchestratorRes = await runNaLIAgent({ observationId, ...toolInput });
      if (!orchestratorRes.success) throw orchestratorRes.error;
      const agentResult = orchestratorRes.data;

      const flagForReview = shouldFlagForReview(agentResult.confidence, agentResult.isAnomaly);
      const newStatus: ObservationStatus = flagForReview ? "review_needed" : "identified";

      const supabase = await createServerSupabaseClient();
      
      let finalSpeciesRefId: string | null = null;
      if (agentResult.finalSpecies?.gbifTaxonKey) {
        const { upsertSpeciesReference } = await import("../supabase/queries/species");
        const speciesRes = await upsertSpeciesReference({
          gbif_taxon_key: agentResult.finalSpecies.gbifTaxonKey,
          scientific_name: agentResult.finalSpecies.scientificName,
          iucn_id: agentResult.finalSpecies.iucnId || null,
          common_name_id: agentResult.finalSpecies.commonNameId || null,
        } as any);
        
        if (speciesRes.success && speciesRes.data) {
          finalSpeciesRefId = speciesRes.data.id;
        }
      }

      const { error: updateError } = await supabase
        .from("observations")
        .update({
          final_species_ref_id: finalSpeciesRefId,
          confidence_level: agentResult.confidence,
          is_anomaly: agentResult.isAnomaly,
          status: newStatus,
        })
        .eq("id", observationId);

      if (updateError) throw updateError;

      const { error: analysisError } = await supabase
        .from("analysis_runs")
        .insert({
          observation_id: observationId,
          model_name: agentResult.modelName,
          prompt_version: agentResult.promptVersion,
          tool_used: agentResult.toolsUsed.length > 0 ? agentResult.toolsUsed[agentResult.toolsUsed.length - 1] : "vision",
          candidate_species: agentResult.finalSpecies ? JSON.parse(JSON.stringify([agentResult.finalSpecies])) : [],
          score_per_tool: { final: agentResult.confidence },
          latency_ms: agentResult.totalLatencyMs,
          raw_output: JSON.parse(JSON.stringify(agentResult)),
        });

      if (analysisError) logger.warn("Failed to insert analysis run", { analysisError });

      return {
        success: true,
        data: { observationId, agentResult },
      };

    } catch (error) {
      logger.error("Error in createAndAnalyze", { error, observationId });
      try {
        const supabase = await createServerSupabaseClient();
        await supabase
          .from("observations")
          .update({ status: "review_needed" })
          .eq("id", observationId);
      } catch (updateErr) {
        logger.error("Failed to update status on error", { updateErr });
      }
      return { success: false, error: toAppError(error) };
    }
  }

  async getObservationDetail(
    userId: string,
    observationId: string
  ): Promise<Result<Observation>> {
    const res = await getObservationById(observationId);
    if (!res.success) return res;
    
    const obsUserId = res.data.userId || (res.data as any).user_id;
    if (obsUserId !== userId) {
      return { success: false, error: toAppError(new Error("Unauthorized")) };
    }
    return res;
  }
}

export const observationService = new ObservationService();
