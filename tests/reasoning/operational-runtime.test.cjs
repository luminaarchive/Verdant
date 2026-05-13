require("../helpers/register-ts.cjs");

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildOperationalReasoningSnapshot,
  buildOperationalSignalSnapshot,
} = require("../../src/lib/agent/reasoning/operational-runtime");
const {
  classifyProviderConflicts,
} = require("../../src/lib/agent/reasoning/provider-conflicts");
const {
  generateReviewRecommendation,
} = require("../../src/lib/agent/reasoning/review-recommendation");
const {
  evaluateCaseEscalationRules,
} = require("../../src/lib/agent/reasoning/case-escalation");

test("classifies provider conflicts with severity and escalation influence", () => {
  const conflicts = classifyProviderConflicts({
    fusion: {
      conflict_detected: true,
      anomaly_score: 0.81,
      confidence_factors: {
        reduced_by: ["audio signal from BirdNET suggests Buceros rhinoceros"],
        strengthened_by: [],
      },
    },
    temporal: {
      anomaly_score: 0.78,
      reasoning: ["Observation falls outside expected migration timing."],
    },
    habitat: {
      anomaly_score: 0.73,
      reasoning: ["Habitat fragmentation increases anomaly probability."],
    },
  });

  assert.deepEqual(
    conflicts.map((conflict) => conflict.type).sort(),
    ["acoustic_conflict", "habitat_conflict", "taxonomy_conflict", "temporal_conflict"],
  );
  assert.ok(conflicts.every((conflict) => conflict.escalation_influence > 0));
});

test("review recommendation separates automatic review from routine archive", () => {
  const highRisk = generateReviewRecommendation({
    ecological_confidence: 0.54,
    conflict_count: 2,
    rarity_score: 0.82,
    conservation_priority_score: 0.88,
    reviewer_reliability_weight: 0.65,
    anomaly_severity_score: 0.79,
  });

  assert.equal(highRisk.automatic_review_required, true);
  assert.equal(highRisk.expert_validation_recommended, true);
  assert.equal(highRisk.routine_archive_safe, false);

  const routine = generateReviewRecommendation({
    ecological_confidence: 0.91,
    conflict_count: 0,
    rarity_score: 0.2,
    conservation_priority_score: 0.19,
    reviewer_reliability_weight: 0.4,
    anomaly_severity_score: 0.08,
  });

  assert.equal(routine.automatic_review_required, false);
  assert.equal(routine.expert_validation_recommended, false);
  assert.equal(routine.routine_archive_safe, true);
});

test("escalation rules create conservation operations cases", () => {
  const escalation = evaluateCaseEscalationRules({
    observation_id: "obs-1",
    reasoning_trace_id: "11111111-1111-4111-8111-111111111111",
    conservation_priority_category: "High Conservation Attention",
    conservation_priority_score: 0.91,
    iucn_status: "CR",
    occurrence_density_score: 0.12,
    habitat_fragmentation_score: 0.76,
    temporal_anomaly_score: 0.64,
    provider_conflicts: [
      {
        type: "taxonomy_conflict",
        severity: "high",
        reasoning_impact: "Provider taxonomic disagreement reduces confidence.",
        escalation_influence: 0.8,
      },
    ],
  });

  assert.equal(escalation.case_required, true);
  assert.ok(escalation.cases.some((fieldCase) => fieldCase.type === "endangered_species_escalation"));
  assert.ok(escalation.cases.every((fieldCase) => fieldCase.linked_observation_ids.includes("obs-1")));
});

test("operational snapshots keep signals separate from interpretation", () => {
  const signals = buildOperationalSignalSnapshot({
    reasoning_trace_id: "22222222-2222-4222-8222-222222222222",
    provider_outputs: [
      {
        tool_name: "Vision Engine",
        tool_version: "v4.1.mock",
        status: "completed",
        score_breakdown: { confidence: 0.88, image_quality: 0.95 },
        raw_output: "Detected morphological markers consistent with Pongo abelii.",
        latency_ms: 1200,
      },
    ],
    modality_signals: [
      {
        provider: "Vision Engine",
        modality: "vision",
        confidence: 0.88,
        scientific_name: "Pongo abelii",
      },
    ],
    environmental_signals: [],
    agreement_metrics: { agreement_score: 1, conflict_detected: false, anomaly_score: 0.1 },
    conflicts: [],
  });
  const reasoning = buildOperationalReasoningSnapshot({
    reasoning_trace_id: "22222222-2222-4222-8222-222222222222",
    ecological_confidence: 0.9,
    confidence_contributors: ["Clear species morphology detected by Vision model"],
    confidence_penalties: [],
    habitat_context: null,
    temporal_context: null,
    provider_conflicts: [],
    escalation_reasoning: [],
    review_recommendation: {
      automatic_review_required: false,
      expert_validation_recommended: false,
      routine_archive_safe: true,
      recommendation: "routine_archive_safe",
      reasons: ["High confidence and no high-risk operational signals."],
    },
    priority_explanation: ["No high-risk conservation signal dominates this observation."],
    synthesized_reasoning: ["Cross-modal ecological signals show strong agreement."],
  });

  assert.ok("provider_outputs" in signals);
  assert.ok(!("synthesized_reasoning" in signals));
  assert.ok("synthesized_reasoning" in reasoning);
  assert.ok(!("provider_outputs" in reasoning));
});
