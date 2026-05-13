require("../helpers/register-ts.cjs");

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createRegionKey,
  indexEcologicalMemory,
  filterTemporalWindow,
} = require("../../src/lib/agent/reasoning/ecological-memory");
const {
  detectLongitudinalPatterns,
} = require("../../src/lib/agent/reasoning/pattern-detection");
const {
  buildEcologicalSignalGraph,
} = require("../../src/lib/agent/reasoning/signal-graph");
const {
  correlateFieldCaseWithPattern,
} = require("../../src/lib/agent/reasoning/case-correlation");
const {
  generateEcologicalAlerts,
} = require("../../src/lib/alerts");
const {
  evolveTemporalConfidence,
} = require("../../src/lib/agent/reasoning/confidence-evolution");
const {
  buildRegionalBaseline,
  scoreAgainstBaseline,
} = require("../../src/lib/agent/reasoning/ecological-baselines");
const {
  replayReasoningHistory,
} = require("../../src/lib/agent/reasoning/reasoning-replay");
const {
  interpretEcosystemPatterns,
} = require("../../src/lib/agent/reasoning/ecosystem-interpretation");

const observations = [
  {
    observation_id: "obs-1",
    reasoning_trace_id: "trace-1",
    scientific_name: "Pongo abelii",
    region_key: "region:3.2:98.1",
    ecological_confidence: 0.81,
    anomaly_score: 0.76,
    conservation_priority_score: 0.91,
    observed_at: "2026-04-01T19:00:00.000Z",
    iucn_status: "CR",
    habitat_boundary: "fragmented",
    activity_pattern: "nocturnal",
    reviewer_confirmed: true,
    migration_alignment_score: 0.2,
    habitat_match_score: 0.34,
  },
  {
    observation_id: "obs-2",
    reasoning_trace_id: "trace-2",
    scientific_name: "Pongo abelii",
    region_key: "region:3.2:98.1",
    ecological_confidence: 0.84,
    anomaly_score: 0.72,
    conservation_priority_score: 0.89,
    observed_at: "2026-04-11T20:00:00.000Z",
    iucn_status: "CR",
    habitat_boundary: "fragmented",
    activity_pattern: "nocturnal",
    reviewer_confirmed: true,
    migration_alignment_score: 0.25,
    habitat_match_score: 0.38,
  },
  {
    observation_id: "obs-3",
    reasoning_trace_id: "trace-3",
    scientific_name: "Pongo abelii",
    region_key: "region:3.2:98.1",
    ecological_confidence: 0.77,
    anomaly_score: 0.8,
    conservation_priority_score: 0.93,
    observed_at: "2026-04-20T21:00:00.000Z",
    iucn_status: "CR",
    habitat_boundary: "agricultural_boundary",
    activity_pattern: "nocturnal",
    reviewer_confirmed: false,
    migration_alignment_score: 0.18,
    habitat_match_score: 0.28,
  },
];

test("indexes ecological memory by region, species, temporal windows, and reviewer signals", () => {
  const memory = indexEcologicalMemory(observations);

  assert.equal(createRegionKey(3.24, 98.14), "region:3.2:98.1");
  assert.equal(memory.by_region["region:3.2:98.1"].length, 3);
  assert.equal(memory.by_species["Pongo abelii"].length, 3);
  assert.equal(memory.reviewer_confirmed_signals.length, 2);
  assert.equal(filterTemporalWindow(observations, "2026-04-01T00:00:00.000Z", "2026-04-15T00:00:00.000Z").length, 2);
});

test("detects longitudinal ecological patterns against regional baselines", () => {
  const baseline = buildRegionalBaseline({
    region_key: "region:3.2:98.1",
    observations,
    expected_species_density: { "Pongo abelii": 1 },
    expected_habitat_consistency: 0.8,
    expected_migration_alignment: 0.75,
  });
  const patterns = detectLongitudinalPatterns({
    observations,
    baselines: [baseline],
    window_days: 30,
  });

  assert.ok(patterns.some((pattern) => pattern.pattern_type === "endangered_detection_cluster"));
  assert.ok(patterns.some((pattern) => pattern.pattern_type === "habitat_degradation"));
  assert.ok(patterns.some((pattern) => pattern.pattern_type === "migration_disruption"));
  assert.equal(scoreAgainstBaseline(observations[0], baseline).baseline_conflict, true);
});

test("builds ecological signal graph relationships across observations and cases", () => {
  const graph = buildEcologicalSignalGraph({
    observations,
    field_cases: [
      {
        id: "case-1",
        type: "endangered_species_escalation",
        status: "escalated",
        priority_score: 0.91,
        linked_observation_ids: ["obs-1"],
        linked_ecological_patterns: [],
        linked_anomaly_cluster_ids: [],
        reviewer_assignment_ids: ["reviewer-1"],
        operational_notes: [],
        created_at: "2026-04-01T00:00:00.000Z",
        updated_at: "2026-04-01T00:00:00.000Z",
      },
    ],
  });

  assert.ok(graph.nodes.some((node) => node.type === "region" && node.id === "region:3.2:98.1"));
  assert.ok(graph.edges.some((edge) => edge.relationship === "observed_in_region"));
  assert.ok(graph.edges.some((edge) => edge.relationship === "case_links_observation"));
});

test("correlates field cases, generates alerts, evolves confidence, and replays reasoning", () => {
  const patterns = detectLongitudinalPatterns({ observations, baselines: [], window_days: 30 });
  const correlated = correlateFieldCaseWithPattern({
    id: "case-1",
    type: "endangered_species_escalation",
    status: "escalated",
    priority_score: 0.91,
    linked_observation_ids: ["obs-1"],
    linked_ecological_patterns: [],
    linked_anomaly_cluster_ids: [],
    reviewer_assignment_ids: [],
    operational_notes: [],
    created_at: "2026-04-01T00:00:00.000Z",
    updated_at: "2026-04-01T00:00:00.000Z",
  }, patterns[0]);
  const alerts = generateEcologicalAlerts(patterns);
  const confidence = evolveTemporalConfidence({
    base_confidence: 0.72,
    confirmations: 2,
    reviewer_disagreements: 1,
    persistent_anomaly_clusters: 2,
  });
  const replay = replayReasoningHistory([
    { reasoning_trace_id: "trace-1", reasoning_version: "v1", provider_version: "vision-1", reviewer_override_count: 0, ecological_confidence: 0.72 },
    { reasoning_trace_id: "trace-1", reasoning_version: "v2", provider_version: "vision-2", reviewer_override_count: 1, ecological_confidence: 0.81 },
  ]);
  const interpretations = interpretEcosystemPatterns(patterns);

  assert.ok(correlated.linked_observation_ids.includes("obs-2"));
  assert.ok(alerts.some((alert) => alert.alert_type === "repeated_endangered_detection"));
  assert.ok(confidence.evolved_confidence > 0.72);
  assert.equal(replay.reasoning_trace_id, "trace-1");
  assert.ok(interpretations.every((item) => item.evidence_observation_ids.length > 0));
});
