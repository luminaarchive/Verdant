function enabled(value: string | undefined, defaultValue = false) {
  if (value === undefined) return defaultValue;
  return value === "true" || value === "1";
}

const isProduction = process.env.NODE_ENV === "production";

export const devFlags = {
  enableDebugTracing: enabled(process.env.NALI_ENABLE_DEBUG_TRACING, false),
  enableMockProviders: enabled(process.env.NALI_ENABLE_MOCK_PROVIDERS, !isProduction),
  enableLongitudinalReplay: enabled(process.env.NALI_ENABLE_LONGITUDINAL_REPLAY, !isProduction),
  enableVerboseReasoningLogs: enabled(process.env.NALI_ENABLE_VERBOSE_REASONING_LOGS, false),
};
