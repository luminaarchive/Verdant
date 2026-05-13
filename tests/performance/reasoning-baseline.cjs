process.env.NALI_LOG_LEVEL = "error";

require("../helpers/register-ts.cjs");

const { performance } = require("node:perf_hooks");
const { synthesizeEcologicalReasoning } = require("../../src/lib/agent/reasoning/synthesis");
const { buildRegionalBaseline } = require("../../src/lib/agent/reasoning/ecological-baselines");
const { detectLongitudinalPatterns } = require("../../src/lib/agent/reasoning/pattern-detection");
const { ObservationOrchestrator } = require("../../src/lib/agent/core/orchestrator");
const { createObservationSet, createMockReasoningInput } = require("../helpers/index.cjs");
const { MockVisionTool } = require("../../src/lib/agent/tools/vision.mock");
const { MockGBIFTool } = require("../../src/lib/agent/tools/gbif.mock");
const { MockIUCNTool } = require("../../src/lib/agent/tools/iucn.mock");
const { MockAnomalyTool } = require("../../src/lib/agent/tools/anomaly.mock");

function percentile(values, pct) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * pct))];
}

async function measure(label, iterations, fn) {
  const durations = [];
  for (let index = 0; index < iterations; index += 1) {
    const start = performance.now();
    await fn(index);
    durations.push(performance.now() - start);
  }

  return {
    label,
    iterations,
    avg_ms: Number((durations.reduce((sum, value) => sum + value, 0) / durations.length).toFixed(2)),
    p95_ms: Number(percentile(durations, 0.95).toFixed(2)),
    max_ms: Number(Math.max(...durations).toFixed(2)),
  };
}

function createMockDb() {
  return {
    from() {
      return {
        insert() {
          return {
            select() {
              return {
                single: async () => ({ data: { id: "run-test-001" }, error: null }),
              };
            },
          };
        },
        upsert: async () => ({ error: null }),
        update() {
          return {
            eq: async () => ({ error: null }),
          };
        },
      };
    },
  };
}

async function run() {
  const observations = createObservationSet(12);
  const baseline = buildRegionalBaseline({
    region_key: "region:3.2:98.1",
    observations,
    expected_species_density: { "Pongo abelii": 2 },
    expected_habitat_consistency: 0.78,
    expected_migration_alignment: 0.74,
  });

  const results = [];
  results.push(
    await measure("reasoning synthesis", 25, () => {
      synthesizeEcologicalReasoning(createMockReasoningInput());
    }),
  );

  results.push(
    await measure("longitudinal pattern detection", 25, () => {
      detectLongitudinalPatterns({ observations, baselines: [baseline], window_days: 30 });
    }),
  );

  results.push(
    await measure("orchestrator runtime with mock providers", 3, async (index) => {
      const orchestrator = new ObservationOrchestrator(
        `bench-observation-${index}`,
        [new MockVisionTool(), new MockGBIFTool(), new MockIUCNTool(), new MockAnomalyTool()],
        createMockDb(),
      );
      await orchestrator.executeWorkflow();
    }),
  );

  console.table(results);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
