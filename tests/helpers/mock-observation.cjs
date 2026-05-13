function createMockObservation(overrides = {}) {
  return {
    observation_id: "OBS-TEST-001",
    reasoning_trace_id: "trace-test-001",
    scientific_name: "Pongo abelii",
    region_key: "region:3.2:98.1",
    ecological_confidence: 0.82,
    anomaly_score: 0.72,
    conservation_priority_score: 0.9,
    observed_at: "2026-04-13T09:30:00.000Z",
    iucn_status: "CR",
    habitat_boundary: "fragmented",
    activity_pattern: "diurnal",
    reviewer_confirmed: true,
    migration_alignment_score: 0.78,
    habitat_match_score: 0.42,
    ...overrides,
  };
}

function createObservationSet(count = 3, overrides = {}) {
  return Array.from({ length: count }, (_, index) =>
    createMockObservation({
      observation_id: `OBS-TEST-${String(index + 1).padStart(3, "0")}`,
      reasoning_trace_id: `trace-test-${String(index + 1).padStart(3, "0")}`,
      observed_at: new Date(Date.UTC(2026, 3, 1 + index * 5, 9, 30, 0)).toISOString(),
      ...overrides,
    }),
  );
}

module.exports = {
  createMockObservation,
  createObservationSet,
};
