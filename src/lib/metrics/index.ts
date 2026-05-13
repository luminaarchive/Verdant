// NaLI: Operational Observability System
import { logger } from "@/lib/logger";

export interface OrchestrationTrace {
  trace_id: string;
  observation_id: string;
  start_time: number;
  tools_invoked: string[];
  total_latency_ms?: number;
  status: 'running' | 'completed' | 'failed' | 'degraded';
}

export class MetricsEngine {
  /**
   * Generates a unique trace ID for deep distributed debugging
   */
  generateTraceId(): string {
    return `trc_${crypto.randomUUID().replace(/-/g, '')}`;
  }

  startTrace(observationId: string): OrchestrationTrace {
    const trace: OrchestrationTrace = {
      trace_id: this.generateTraceId(),
      observation_id: observationId,
      start_time: Date.now(),
      tools_invoked: [],
      status: 'running'
    };
    logger.info(`Trace Started: ${trace.trace_id}`, { observation_id: observationId });
    return trace;
  }

  logToolExecution(trace: OrchestrationTrace, toolName: string, latency: number, success: boolean, retryCount: number = 0) {
    trace.tools_invoked.push(toolName);
    logger.info(`Tool Executed: ${toolName}`, {
      trace_id: trace.trace_id,
      latency_ms: latency,
      success,
      retry_count: retryCount
    });
  }

  endTrace(trace: OrchestrationTrace, finalStatus: OrchestrationTrace['status']) {
    trace.total_latency_ms = Date.now() - trace.start_time;
    trace.status = finalStatus;
    
    logger.info(`Trace Ended: ${trace.trace_id}`, {
      observation_id: trace.observation_id,
      total_latency_ms: trace.total_latency_ms,
      status: trace.status,
      tools_count: trace.tools_invoked.length
    });
  }
}

export const metricsEngine = new MetricsEngine();
