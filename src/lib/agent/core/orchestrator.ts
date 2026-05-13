// NaLI: Workflow Runtime Orchestrator
import { AgentTool, ToolOutput, EventSeverity } from "./types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { metricsEngine, OrchestrationTrace } from "@/lib/metrics";

export class ObservationOrchestrator {
  private pipeline: AgentTool[];
  private observationId: string;
  private orchestratorRunId: string | null = null;
  private db: any;
  private confidenceCalibration: any = {};
  private trace: OrchestrationTrace | null = null;

  constructor(observationId: string, pipeline: AgentTool[]) {
    this.observationId = observationId;
    this.pipeline = pipeline;
  }

  /**
   * Initializes the DB client and starts the run.
   */
  async start() {
    this.db = await createServerSupabaseClient();
    this.trace = metricsEngine.startTrace(this.observationId);
    
    // 1. Create orchestrator_run
    const { data, error } = await this.db.from('orchestrator_runs').insert({
      observation_id: this.observationId,
      status: 'running',
    }).select('id').single();

    if (error) {
      console.error("Failed to init orchestrator_run", error);
      return;
    }
    this.orchestratorRunId = data.id;

    await this.emitEvent('ORCHESTRATION_STARTED', 'info', { pipeline_length: this.pipeline.length, trace_id: this.trace.trace_id });
  }

  /**
   * Executes the pipeline asynchronously.
   */
  async executeWorkflow() {
    if (!this.orchestratorRunId) await this.start();
    
    let totalLatency = 0;
    let finalStatus = 'completed';
    let failedTool = null;
    let finalConfidence = 0;

    for (let i = 0; i < this.pipeline.length; i++) {
      const tool = this.pipeline[i];
      const startTime = Date.now();
      let retryCount = 0;
      let fallbackUsed = false;
      let output: ToolOutput;

      await this.emitEvent(`${tool.name.toUpperCase()}_STARTED`, 'info', { version: tool.version });
      await this.updateProcessingStage(this.mapToolToStage(tool.name));

      try {
        output = await tool.execute({ observationId: this.observationId });
        
        // Track confidence and calibration
        if (output.score_breakdown && output.score_breakdown.confidence) {
          finalConfidence = output.score_breakdown.confidence;
          this.confidenceCalibration[tool.name] = output.score_breakdown;
        }

      } catch (err) {
        if (tool.fallback) {
          fallbackUsed = true;
          await this.emitEvent(`FALLBACK_TRIGGERED`, 'warning', { tool: tool.name });
          output = await tool.fallback({ observationId: this.observationId }, err);
        } else {
          output = {
            status: 'error',
            latency_ms: Date.now() - startTime,
            score_breakdown: {},
            raw_output: err instanceof Error ? err.message : 'Unknown tool error',
            error: 'Tool execution failed completely without fallback.'
          };
        }
      }

      totalLatency += output.latency_ms;

      // Persist analysis_run
      await this.db.from('analysis_runs').insert({
        observation_id: this.observationId,
        tool_name: tool.name,
        tool_version: tool.version,
        status: output.status,
        latency_ms: output.latency_ms,
        score_breakdown: output.score_breakdown,
        raw_output: output.raw_output,
        error: output.error,
        retry_count: retryCount,
        fallback_used: fallbackUsed,
        execution_order: i + 1,
        completed_at: new Date().toISOString()
      });

      if (this.trace) {
        metricsEngine.logToolExecution(this.trace, tool.name, output.latency_ms, output.status !== 'error', retryCount);
      }

      if (output.status === 'error') {
        failedTool = tool.name;
        finalStatus = 'error';
        await this.emitEvent(`${tool.name.toUpperCase()}_FAILED`, 'error', { error: output.error });
        break; 
      } else if (output.status === 'warning') {
        finalStatus = 'warning';
        await this.emitEvent(`${tool.name.toUpperCase()}_COMPLETED_WITH_WARNINGS`, 'warning', output.score_breakdown);
      } else {
        await this.emitEvent(`${tool.name.toUpperCase()}_COMPLETED`, 'info', output.score_breakdown);
      }
    }

    // Wrap up Orchestrator Run
    await this.db.from('orchestrator_runs').update({
      status: finalStatus,
      completed_at: new Date().toISOString(),
      total_latency_ms: totalLatency,
      total_tools_executed: this.pipeline.length,
      final_confidence: finalConfidence,
      final_result_status: failedTool ? `Failed at ${failedTool}` : 'Success'
    }).eq('id', this.orchestratorRunId);

    // Synthesize Confidence (Phase 10)
    const synthesizedCalibration = this.synthesizeConfidence(finalConfidence);

    // Update observation
    await this.db.from('observations').update({
      processing_stage: finalStatus === 'error' ? 'failed' : 'completed',
      observation_status: finalStatus === 'error' ? 'failed' : 'identified',
      confidence_calibration: synthesizedCalibration
    }).eq('id', this.observationId);

    await this.emitEvent('ORCHESTRATION_COMPLETED', finalStatus === 'error' ? 'error' : 'info', { finalStatus });

    if (this.trace) {
      metricsEngine.endTrace(this.trace, finalStatus as 'completed' | 'failed' | 'degraded');
    }
  }

  /**
   * Phase 10: Confidence & Uncertainty Engine
   * Synthesizes provider outputs to explicitly explain certainty and uncertainty.
   */
  private synthesizeConfidence(baseConfidence: number) {
    const contributors: { type: 'positive' | 'negative', reason: string }[] = [];
    let adjustedConfidence = baseConfidence;

    // Evaluate GBIF (Density)
    const gbifScore = this.confidenceCalibration['GBIF Cross-check']?.occurrence_density_score;
    if (gbifScore !== undefined) {
      if (gbifScore > 0.8) {
        contributors.push({ type: 'positive', reason: "Strong regional occurrence match in GBIF" });
        adjustedConfidence += 0.05;
      } else if (gbifScore < 0.2) {
        contributors.push({ type: 'negative', reason: "Limited regional occurrence records, potential anomaly" });
        adjustedConfidence -= 0.15;
      }
    }

    // Evaluate Vision (Quality - if integrated in future, for now stubbed)
    const visionConfidence = this.confidenceCalibration['Vision Engine']?.confidence;
    if (visionConfidence !== undefined) {
      if (visionConfidence > 0.9) {
        contributors.push({ type: 'positive', reason: "Clear species morphology detected by Vision model" });
      } else if (visionConfidence < 0.6) {
        contributors.push({ type: 'negative', reason: "Ambiguous morphological features detected" });
      }
    }

    return {
      base_confidence: baseConfidence,
      adjusted_confidence: Math.min(Math.max(adjustedConfidence, 0), 1),
      contributors,
      raw_tool_scores: this.confidenceCalibration
    };
  }

  private async emitEvent(type: string, severity: EventSeverity, payload: any) {
    if (!this.db) return;
    await this.db.from('observation_events').insert({
      observation_id: this.observationId,
      event_type: type,
      severity,
      payload
    });
  }

  private async updateProcessingStage(stage: string) {
    if (!this.db) return;
    await this.db.from('observations').update({ processing_stage: stage }).eq('id', this.observationId);
  }

  private mapToolToStage(toolName: string): string {
    const map: Record<string, string> = {
      'Vision Engine': 'identifying',
      'GBIF Cross-check': 'gbif_analysis',
      'IUCN Analysis': 'iucn_analysis',
      'Anomaly Detection': 'anomaly_check'
    };
    return map[toolName] || 'processing';
  }
}
