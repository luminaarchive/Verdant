type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  trace_id?: string;
  reasoning_trace_id?: string;
  orchestration_id?: string;
  observation_id?: string;
  provider?: string;
  [key: string]: unknown;
}

interface LogPayload extends LogContext {
  level: LogLevel;
  message: string;
  timestamp: string;
}

const isProduction = process.env.NODE_ENV === "production";
const logWeights: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function shouldEmit(level: LogLevel) {
  const configuredLevel = (process.env.NALI_LOG_LEVEL as LogLevel | undefined) ?? "info";
  if (logWeights[level] < (logWeights[configuredLevel] ?? logWeights.info)) {
    return false;
  }

  if (isProduction && level === "debug") {
    return process.env.NALI_ENABLE_DEBUG_TRACING === "true";
  }

  return true;
}

function log(level: LogLevel, message: string, context?: LogContext) {
  if (!shouldEmit(level)) return;

  const payload: LogPayload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };

  const output = JSON.stringify(payload);

  switch (level) {
    case "debug":
      console.debug(output);
      break;
    case "info":
      console.info(output);
      break;
    case "warn":
      console.warn(output);
      break;
    case "error":
      console.error(output);
      break;
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log("debug", message, context),
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext) => log("warn", message, context),
  error: (message: string, context?: LogContext) => log("error", message, context),
  child: (baseContext: LogContext) => ({
    debug: (message: string, context?: LogContext) => log("debug", message, { ...baseContext, ...context }),
    info: (message: string, context?: LogContext) => log("info", message, { ...baseContext, ...context }),
    warn: (message: string, context?: LogContext) => log("warn", message, { ...baseContext, ...context }),
    error: (message: string, context?: LogContext) => log("error", message, { ...baseContext, ...context }),
  }),
};
