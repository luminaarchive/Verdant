function createTemporalFixture(overrides = {}) {
  return {
    anomaly_score: 0.18,
    confidence_adjustment: 0.04,
    reasoning: ["Observation timing aligns with expected regional activity window."],
    review_recommendations: [],
    ...overrides,
  };
}

module.exports = {
  createTemporalFixture,
};
