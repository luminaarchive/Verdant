function createProviderOutput(overrides = {}) {
  return {
    tool_name: "Vision Engine",
    tool_version: "test-v1",
    status: "completed",
    latency_ms: 120,
    score_breakdown: { confidence: 0.84 },
    raw_output: "Provider fixture output.",
    ...overrides,
  };
}

function createProviderOutputs() {
  return [
    createProviderOutput(),
    createProviderOutput({
      tool_name: "GBIF Cross-check",
      latency_ms: 90,
      score_breakdown: { match: 0.88 },
      raw_output: "Regional occurrence fixture output.",
    }),
  ];
}

module.exports = {
  createProviderOutput,
  createProviderOutputs,
};
