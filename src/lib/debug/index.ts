import { devFlags } from "@/lib/config/flags";
import { logger, type LogContext } from "@/lib/logger";

export type TraceScope =
  | "runtime"
  | "provider"
  | "orchestration"
  | "reasoning"
  | "alert-generation";

export interface TraceTiming {
  scope: TraceScope;
  label: string;
  duration_ms: number;
  started_at: string;
  ended_at: string;
}

export function isDebugTracingEnabled() {
  return devFlags.enableDebugTracing;
}

export function createRuntimeTrace(scope: TraceScope, label: string, context: LogContext = {}) {
  const startedAt = new Date();
  const start = performance.now();

  if (isDebugTracingEnabled()) {
    logger.debug("Trace started", { ...context, scope, label, started_at: startedAt.toISOString() });
  }

  return {
    end(extraContext: LogContext = {}): TraceTiming {
      const endedAt = new Date();
      const timing = {
        scope,
        label,
        duration_ms: Number((performance.now() - start).toFixed(2)),
        started_at: startedAt.toISOString(),
        ended_at: endedAt.toISOString(),
      };

      if (isDebugTracingEnabled()) {
        logger.debug("Trace completed", { ...context, ...extraContext, ...timing });
      }

      return timing;
    },
  };
}

export function traceProviderTiming(provider: string, context: LogContext = {}) {
  return createRuntimeTrace("provider", provider, { ...context, provider });
}

export function traceOrchestrationTiming(orchestrationId: string, context: LogContext = {}) {
  return createRuntimeTrace("orchestration", orchestrationId, { ...context, orchestration_id: orchestrationId });
}

export function traceReasoningTiming(reasoningTraceId: string, context: LogContext = {}) {
  return createRuntimeTrace("reasoning", reasoningTraceId, { ...context, reasoning_trace_id: reasoningTraceId });
}

export function traceAlertGeneration(label: string, context: LogContext = {}) {
  return createRuntimeTrace("alert-generation", label, context);
}
