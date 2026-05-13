// NaLI: Golden Set Fixtures

export const GoldenSetFixtures = [
  {
    id: "fixture-happy-path-1",
    scenario: "Perfect Sumatran Tiger Observation",
    payload: {
      latitude: 3.2,
      longitude: 98.1,
      forceFailure: null, // Happy path
      expectedSpecies: "Panthera tigris sumatrae",
      expectedStatus: "completed"
    }
  },
  {
    id: "fixture-blurry-image",
    scenario: "Vision fails due to blurry image, triggers fallback",
    payload: {
      latitude: -2.5,
      longitude: 114.0,
      forceFailure: "vision_blurry",
      expectedStatus: "warning"
    }
  },
  {
    id: "fixture-gbif-timeout",
    scenario: "GBIF API times out, uses local cached occurrence",
    payload: {
      latitude: -8.5,
      longitude: 115.0, // Bali Starling
      forceFailure: "gbif_timeout",
      expectedStatus: "completed" // Because fallback works
    }
  },
  {
    id: "fixture-anomaly-critical",
    scenario: "Komodo Dragon spotted in Sumatra (Geographic Anomaly)",
    payload: {
      latitude: 3.2,
      longitude: 98.1, // Sumatra coordinates for Komodo
      forceFailure: "anomaly_critical",
      expectedStatus: "warning" // Triggers review
    }
  }
];
