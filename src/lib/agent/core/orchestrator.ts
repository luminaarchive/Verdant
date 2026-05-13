// NaLI: Workflow Runtime Orchestrator
import { AgentTool, ToolOutput, EventSeverity } from "./types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { metricsEngine, OrchestrationTrace } from "@/lib/metrics";
import { evaluateHabitatContext } from "@/lib/agent/reasoning/habitat";
import { evaluateTemporalContext } from "@/lib/agent/reasoning/seasonality";
import { synthesizeEcologicalReasoning } from "@/lib/agent/reasoning/synthesis";
import { classifyProviderConflicts, ProviderConflict } from "@/lib/agent/reasoning/provider-conflicts";
import { generateReviewRecommendation } from "@/lib/agent/reasoning/review-recommendation";
import { evaluateCaseEscalationRules } from "@/lib/agent/reasoning/case-escalation";
import { explainConservationPriority } from "@/lib/agent/reasoning/priority-explanation";
import {
  buildOperationalReasoningSnapshot,
  buildOperationalSignalSnapshot,
  providerOutputToSignal,
  ProviderOutputRecord,
} from "@/lib/agent/reasoning/operational-runtime";
import type { FusionSignal } from "@/lib/agent/reasoning/multi-modal-fusion";
import { traceOrchestrationTiming, traceProviderTiming, traceReasoningTiming } from "@/lib/debug";
import { logger } from "@/lib/logger";

export class ObservationOrchestrator {
  private pipeline: AgentTool[];
  private observationId: string;
  private orchestratorRunId: string | null = null;
  private db: any;
  private confidenceCalibration: any = {};
  private trace: OrchestrationTrace | null = null;
  private reasoningTraceId: string = crypto.randomUUID();
  private providerOutputs: ProviderOutputRecord[] = [];

  constructor(observationId: string, pipeline: AgentTool[], dbClient?: any) {
    this.observationId = observationId;
    this.pipeline = pipeline;
    this.db = dbClient;
  }

  /**
   * Initializes the DB client and starts the run.
   */
  async start() {
    this.db = this.db ?? await createServerSupabaseClient();
    this.trace = metricsEngine.startTrace(this.observationId);
    
    // 1. Create orchestrator_run
    const { data, error } = await this.db.from('orchestrator_runs').insert({
      observation_id: this.observationId,
      status: 'running',
      reasoning_trace_id: this.reasoningTraceId,
    }).select('id').single();

    if (error) {
      logger.error("Failed to initialize orchestrator run", {
        observation_id: this.observationId,
        reasoning_trace_id: this.reasoningTraceId,
        error,
      });
      return;
    }
    this.orchestratorRunId = data.id;

    await this.emitEvent('ORCHESTRATION_STARTED', 'info', {
      pipeline_length: this.pipeline.length,
      trace_id: this.trace.trace_id,
    });
  }

  /**
   * Executes the pipeline asynchronously.
   */
  async executeWorkflow() {
    if (!this.orchestratorRunId) await this.start();
    const orchestrationTiming = traceOrchestrationTiming(this.orchestratorRunId ?? "pending", {
      observation_id: this.observationId,
      reasoning_trace_id: this.reasoningTraceId,
    });
    
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
      const providerTiming = traceProviderTiming(tool.name, {
        observation_id: this.observationId,
        reasoning_trace_id: this.reasoningTraceId,
      });

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
      providerTiming.end({ status: output.status, latency_ms: output.latency_ms });

      totalLatency += output.latency_ms;

      // Persist analysis_run
      await this.db.from('analysis_runs').insert({
        observation_id: this.observationId,
        tool_name: tool.name,
        tool_version: tool.version,
        reasoning_trace_id: this.reasoningTraceId,
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

      this.providerOutputs.push({
        tool_name: tool.name,
        tool_version: tool.version,
        status: output.status,
        latency_ms: output.latency_ms,
        score_breakdown: output.score_breakdown,
        raw_output: output.raw_output,
        error: output.error,
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

    const reasoningTiming = traceReasoningTiming(this.reasoningTraceId, { observation_id: this.observationId });
    const operationalReasoning = this.synthesizeOperationalReasoning();
    reasoningTiming.end({
      ecological_confidence: operationalReasoning.reasoning.ecological_confidence,
      conflict_count: operationalReasoning.conflicts.length,
    });

    // Wrap up Orchestrator Run
    await this.db.from('orchestrator_runs').update({
      status: finalStatus,
      completed_at: new Date().toISOString(),
      total_latency_ms: totalLatency,
      total_tools_executed: this.pipeline.length,
      final_confidence: operationalReasoning.reasoning.ecological_confidence,
      conservation_priority_score: operationalReasoning.reasoning.conservation_priority.priority_score,
      review_recommendation: operationalReasoning.review.recommendation,
      final_result_status: failedTool ? `Failed at ${failedTool}` : 'Success'
    }).eq('id', this.orchestratorRunId);

    // Synthesize Confidence (Phase 10)
    const synthesizedCalibration = this.synthesizeConfidence(finalConfidence);
    const observationStatus = finalStatus === 'error'
      ? 'failed'
      : operationalReasoning.review.routine_archive_safe
        ? 'identified'
        : 'review_needed';
    const legacyStatus = finalStatus === 'error' ? 'review_needed' : observationStatus;

    // Update observation
    await this.db.from('observations').update({
      processing_stage: finalStatus === 'error' ? 'failed' : 'completed',
      observation_status: observationStatus,
      status: legacyStatus,
      review_status: operationalReasoning.review.automatic_review_required ? 'unreviewed' : 'unreviewed',
      qa_flag: operationalReasoning.review.automatic_review_required,
      confidence_level: operationalReasoning.reasoning.ecological_confidence,
      confidence_calibration: synthesizedCalibration,
      reasoning_trace_id: this.reasoningTraceId,
      reasoning_snapshot: operationalReasoning.reasoningSnapshot,
      signal_snapshot: operationalReasoning.signalSnapshot,
      scientific_name: operationalReasoning.scientificName === "Unknown species" ? null : operationalReasoning.scientificName,
      conservation_status: operationalReasoning.iucnStatus,
      conservation_priority_score: operationalReasoning.reasoning.conservation_priority.priority_score,
      conservation_priority_category: operationalReasoning.reasoning.conservation_priority.category,
    }).eq('id', this.observationId);

    await this.emitEvent('ECOLOGICAL_REASONING_SYNTHESIZED', 'info', {
      ecological_confidence: operationalReasoning.reasoning.ecological_confidence,
      conservation_priority: operationalReasoning.reasoning.conservation_priority,
      review_recommendation: operationalReasoning.review,
      provider_conflicts: operationalReasoning.conflicts,
    });
    await this.emitEvent('REASONING_SYNTHESIZED', 'info', {
      ecological_confidence: operationalReasoning.reasoning.ecological_confidence,
      conservation_priority: operationalReasoning.reasoning.conservation_priority,
      review_recommendation: operationalReasoning.review.recommendation,
      provider_conflict_count: operationalReasoning.conflicts.length,
    });

    if (operationalReasoning.caseEscalation.case_required) {
      await this.persistFieldCases(operationalReasoning.caseEscalation.cases);
      await this.emitEvent('FIELD_CASE_ESCALATION_DECIDED', 'warning', {
        triggered_rules: operationalReasoning.caseEscalation.triggered_rules,
        case_count: operationalReasoning.caseEscalation.cases.length,
      });
    }

    await this.emitEvent(
      finalStatus === 'error' ? 'OBSERVATION_FAILED' : 'OBSERVATION_COMPLETED',
      finalStatus === 'error' ? 'error' : 'info',
      { finalStatus },
    );
    await this.emitEvent('ORCHESTRATION_COMPLETED', finalStatus === 'error' ? 'error' : 'info', { finalStatus });

    if (this.trace) {
      metricsEngine.endTrace(this.trace, finalStatus === 'error' ? 'failed' : finalStatus === 'warning' ? 'degraded' : 'completed');
    }
    orchestrationTiming.end({ final_status: finalStatus, total_latency_ms: totalLatency });
  }

  private synthesizeOperationalReasoning() {
    const modalitySignals = this.providerOutputs.map(providerOutputToSignal);
    const scientificName = modalitySignals.find((signal) => signal.scientific_name)?.scientific_name ?? "Unknown species";
    const gbifOutput = this.providerOutputs.find((output) => output.tool_name === "GBIF Cross-check");
    const iucnOutput = this.providerOutputs.find((output) => output.tool_name === "IUCN Analysis");
    const anomalyOutput = this.providerOutputs.find((output) => output.tool_name === "Anomaly Detection");
    const occurrenceDensity = this.extractOccurrenceDensity(gbifOutput);
    const iucnStatus = this.extractIucnStatus(iucnOutput?.raw_output);
    const temporal = evaluateTemporalContext({
      observedAt: new Date(),
      species: {
        scientific_name: scientificName,
        seasonal_windows: [{ startMonth: 1, endMonth: 12 }],
        migration_windows: [{ startMonth: 1, endMonth: 12 }],
        breeding_windows: [{ startMonth: 1, endMonth: 12 }],
        activity_pattern: "cathemeral",
      },
    });
    const habitat = evaluateHabitatContext({
      biome: "lowland rainforest",
      occurrence_density_score: occurrenceDensity,
      environmental_metadata: {
        forest_cover_loss_score: iucnStatus === "CR" || iucnStatus === "EN" ? 0.62 : 0.25,
        ndvi_score: 0.58,
        land_use_boundary: occurrenceDensity < 0.3 ? "fragmented" : "edge",
      },
      species_habitat_preferences: [
        { biome: "lowland rainforest", affinity: 0.86 },
        { biome: "montane forest", affinity: 0.58 },
      ],
    });
    const reasoning = synthesizeEcologicalReasoning({
      signals: modalitySignals,
      temporal,
      habitat,
      conservation_priority: {
        iucn_status: iucnStatus,
        occurrence_density_score: occurrenceDensity,
        habitat_fragility_score: habitat.fragmentation_score,
        anomaly_severity_score: anomalyOutput?.score_breakdown.anomaly_score ?? 0,
        regional_conservation_sensitivity: iucnStatus === "CR" || iucnStatus === "EN" ? 0.88 : 0.45,
      },
    });
    const conflicts = classifyProviderConflicts({
      fusion: reasoning.fusion,
      temporal,
      habitat,
    });
    const anomalySeverity = Math.max(
      reasoning.fusion.anomaly_score,
      temporal.anomaly_score,
      habitat.anomaly_score,
      anomalyOutput?.score_breakdown.anomaly_score ?? 0,
    );
    const review = generateReviewRecommendation({
      ecological_confidence: reasoning.ecological_confidence,
      conflict_count: conflicts.length,
      rarity_score: 1 - occurrenceDensity,
      conservation_priority_score: reasoning.conservation_priority.priority_score,
      anomaly_severity_score: anomalySeverity,
    });
    const priorityExplanation = explainConservationPriority({
      iucn_status: iucnStatus,
      habitat_fragmentation_score: habitat.fragmentation_score,
      temporal_anomaly_score: temporal.anomaly_score,
      occurrence_density_score: occurrenceDensity,
      provider_conflicts: conflicts,
    });
    const caseEscalation = evaluateCaseEscalationRules({
      observation_id: this.observationId,
      reasoning_trace_id: this.reasoningTraceId,
      conservation_priority_category: reasoning.conservation_priority.category,
      conservation_priority_score: reasoning.conservation_priority.priority_score,
      iucn_status: iucnStatus,
      occurrence_density_score: occurrenceDensity,
      habitat_fragmentation_score: habitat.fragmentation_score,
      temporal_anomaly_score: temporal.anomaly_score,
      provider_conflicts: conflicts,
    });
    const signalSnapshot = buildOperationalSignalSnapshot({
      reasoning_trace_id: this.reasoningTraceId,
      provider_outputs: this.providerOutputs,
      modality_signals: modalitySignals,
      environmental_signals: [],
      agreement_metrics: {
        agreement_score: reasoning.fusion.agreement_score,
        conflict_detected: reasoning.fusion.conflict_detected,
        anomaly_score: reasoning.fusion.anomaly_score,
      },
      conflicts,
    });
    const reasoningSnapshot = buildOperationalReasoningSnapshot({
      reasoning_trace_id: this.reasoningTraceId,
      ecological_confidence: reasoning.ecological_confidence,
      confidence_contributors: reasoning.scientific_interpretation.confidence_strengthened_due_to,
      confidence_penalties: reasoning.scientific_interpretation.confidence_reduced_due_to,
      habitat_context: habitat,
      temporal_context: temporal,
      provider_conflicts: conflicts,
      escalation_reasoning: caseEscalation.triggered_rules,
      review_recommendation: review,
      priority_explanation: priorityExplanation,
      synthesized_reasoning: reasoning.scientific_interpretation.uncertainty_explanation,
    });

    return {
      modalitySignals,
      scientificName,
      iucnStatus,
      reasoning,
      conflicts,
      review,
      caseEscalation,
      signalSnapshot,
      reasoningSnapshot,
    };
  }

  private extractOccurrenceDensity(output?: ProviderOutputRecord): number {
    if (!output) return 0.5;
    if (typeof output.score_breakdown.occurrence_density_score === "number") {
      return output.score_breakdown.occurrence_density_score;
    }
    if (typeof output.score_breakdown.location_fit === "number") {
      return output.score_breakdown.location_fit;
    }
    if (typeof output.score_breakdown.match === "number") {
      return output.score_breakdown.match;
    }
    return output.raw_output.toLowerCase().includes("outdated") ? 0.4 : 0.5;
  }

  private extractIucnStatus(rawOutput?: string): string {
    const normalized = rawOutput?.toUpperCase() ?? "";
    const statuses = ["CR", "EN", "VU", "NT", "LC", "DD", "NE"];
    return statuses.find((status) => normalized.includes(`(${status})`) || normalized.includes(` ${status}`)) ?? "NE";
  }

  private async persistFieldCases(cases: Array<{ id: string; [key: string]: any }>) {
    if (!this.db || cases.length === 0) return;

    await this.db.from('field_cases').upsert(cases.map((fieldCase) => ({
      id: fieldCase.id,
      observation_id: this.observationId,
      reasoning_trace_id: this.reasoningTraceId,
      case_type: fieldCase.type,
      status: fieldCase.status,
      priority_score: fieldCase.priority_score,
      linked_observation_ids: fieldCase.linked_observation_ids,
      linked_ecological_patterns: fieldCase.linked_ecological_patterns,
      linked_anomaly_cluster_ids: fieldCase.linked_anomaly_cluster_ids,
      migration_grouping_id: fieldCase.migration_grouping_id,
      reviewer_assignment_ids: fieldCase.reviewer_assignment_ids,
      operational_notes: fieldCase.operational_notes,
      updated_at: new Date().toISOString(),
    })), { onConflict: 'id' });
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
      reasoning_trace_id: this.reasoningTraceId,
      payload: {
        ...payload,
        reasoning_trace_id: this.reasoningTraceId,
      }
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
      'Anomaly Detection': 'anomaly_check',
      'BirdNET Acoustic Engine': 'audio_analysis'
    };
    return map[toolName] || 'processing';
  }
}
