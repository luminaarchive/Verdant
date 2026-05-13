function createHabitatFixture(overrides = {}) {
  return {
    habitat_match_score: 0.76,
    fragmentation_score: 0.32,
    anomaly_score: 0.24,
    confidence_adjustment: 0.02,
    reasoning: ["Habitat context is consistent with species preference."],
    ...overrides,
  };
}

module.exports = {
  createHabitatFixture,
};
