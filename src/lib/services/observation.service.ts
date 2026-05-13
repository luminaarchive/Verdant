import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ObservationOrchestrator } from "@/lib/agent/core/orchestrator";
import { storageService } from "@/lib/services/storage.service";
import { MockVisionTool } from "@/lib/agent/tools/vision.mock";
import { MockGBIFTool } from "@/lib/agent/tools/gbif.mock";
import { MockIUCNTool } from "@/lib/agent/tools/iucn.mock";
import { MockAnomalyTool } from "@/lib/agent/tools/anomaly.mock";

export class ObservationService {
  /**
   * Phase F: Status Machine
   * Explicit transitions ensuring backend dictates state.
   */
  async updateProcessingStage(observationId: string, stage: string) {
    const supabase = await createServerSupabaseClient();
    await supabase.from('observations').update({ processing_stage: stage }).eq('id', observationId);
  }

  async updateReviewStatus(observationId: string, status: 'unreviewed' | 'verified' | 'rejected') {
    const supabase = await createServerSupabaseClient();
    await supabase.from('observations').update({ review_status: status }).eq('id', observationId);
  }

  /**
   * Creates the observation record and triggers async orchestration.
   * Immediately returns the observation ID to the client.
   */
  async submitObservation(userId: string, input: {
    latitude: number;
    longitude: number;
    textDescription?: string;
    mediaFile?: File;
  }): Promise<string> {
    const supabase = await createServerSupabaseClient();
    const observationId = crypto.randomUUID();

    // 1. Insert base observation
    const { error: obsError } = await supabase.from('observations').insert({
      id: observationId,
      user_id: userId,
      latitude: input.latitude,
      longitude: input.longitude,
      text_description: input.textDescription,
      processing_stage: 'uploaded',
      observation_status: 'pending'
    });

    if (obsError) throw obsError;

    // 2. Handle Media if present
    if (input.mediaFile) {
      // Stub checksum logic
      const checksum = crypto.randomUUID(); 
      const mediaData = await storageService.uploadObservationMedia(userId, observationId, input.mediaFile, checksum);
      await storageService.registerMediaRecord(
        observationId, 
        input.mediaFile.type.startsWith('audio') ? 'audio' : 'photo', 
        mediaData.storage_url, 
        checksum
      );
    }

    // 3. Emit Initial Event
    await supabase.from('observation_events').insert({
      observation_id: observationId,
      event_type: 'OBSERVATION_CREATED',
      severity: 'info',
      payload: { has_media: !!input.mediaFile }
    });

    // 4. Trigger Orchestrator ASYNCHRONOUSLY
    // We intentionally do not await this, allowing it to run in the background.
    // In a strict Vercel Edge environment, waitUntil() might be needed, 
    // but standard Node runtimes allow detached promises.
    this.runOrchestratorBackground(observationId).catch(err => {
      console.error(`Orchestrator failed for ${observationId}`, err);
    });

    return observationId; // Return immediately
  }

  private async runOrchestratorBackground(observationId: string) {
    // Configurable pipeline (Phase B)
    const pipeline = [
      new MockVisionTool(),
      new MockGBIFTool(),
      new MockIUCNTool(),
      new MockAnomalyTool()
    ];

    const orchestrator = new ObservationOrchestrator(observationId, pipeline);
    await orchestrator.executeWorkflow();
  }
}

export const observationService = new ObservationService();
