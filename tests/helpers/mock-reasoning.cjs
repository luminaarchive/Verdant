function createMockFusionSignal(overrides = {}) {
  return {
    provider: "Mock Vision Provider",
    modality: "image",
    confidence: 0.84,
    reliability: 0.86,
    direction: "supporting",
    reasoning: "Morphology supports target species.",
    ...overrides,
  };
}

function createMockReasoningInput(overrides = {}) {
  return {
    signals: [
      createMockFusionSignal(),
      createMockFusionSignal({
        provider: "GBIF Occurrence Provider",
        modality: "occurrence",
        confidence: 0.88,
        reasoning: "Regional occurrence density supports observation.",
      }),
    ],
    conservation_priority: {
      iucn_status: "CR",
      rarity_score: 0.9,
      occurrence_density_score: 0.72,
      habitat_fragility_score: 0.74,
      anomaly_severity_score: 0.68,
      reviewer_escalation_score: 0.7,
      regional_sensitivity_score: 0.82,
    },
    reviewer_reliability_weight: 0.75,
    ...overrides,
  };
}

module.exports = {
  createMockFusionSignal,
  createMockReasoningInput,
};
