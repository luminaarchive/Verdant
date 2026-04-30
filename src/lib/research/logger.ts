// ─── Structured Logger ──────────────────────────────────────────────────────
// All backend operations MUST use this logger.
// Every log line includes: requestId, runId, step, duration, metadata.

export interface LogContext {
  requestId: string
  runId?: string
  pipelineSource?: 'gemini-direct' | 'n8n-fallback'
  step?: string
  durationMs?: number
  retryCount?: number
  failureStep?: string
  ip?: string
  [key: string]: unknown
}

function formatLog(level: string, message: string, ctx: Partial<LogContext> = {}): string {
  const timestamp = new Date().toISOString()
  const parts = [
    `[${timestamp}]`,
    `[${level}]`,
    ctx.requestId ? `[req:${ctx.requestId}]` : '',
    ctx.runId ? `[run:${ctx.runId}]` : '',
    ctx.step ? `[step:${ctx.step}]` : '',
    ctx.pipelineSource ? `[src:${ctx.pipelineSource}]` : '',
    message,
    ctx.durationMs !== undefined ? `(${ctx.durationMs}ms)` : '',
  ].filter(Boolean)

  return parts.join(' ')
}

export const log = {
  info(message: string, ctx: Partial<LogContext> = {}) {
    console.log(formatLog('INFO', message, ctx))
  },

  warn(message: string, ctx: Partial<LogContext> = {}) {
    console.warn(formatLog('WARN', message, ctx))
  },

  error(message: string, ctx: Partial<LogContext> = {}) {
    console.error(formatLog('ERROR', message, ctx))
  },

  step(step: string, message: string, ctx: Partial<LogContext> = {}) {
    console.log(formatLog('STEP', message, { ...ctx, step }))
  },

  metric(message: string, ctx: Partial<LogContext> & { [key: string]: unknown } = {}) {
    console.log(formatLog('METRIC', message, ctx))
  },
}

export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function generateRunId(): string {
  return `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function timer(): () => number {
  const start = Date.now()
  return () => Date.now() - start
}
