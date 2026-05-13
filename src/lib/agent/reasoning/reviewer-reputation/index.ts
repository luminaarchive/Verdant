// NaLI: Reviewer Reputation and Expert Weighting

export interface ReviewerReputationInput {
  reviewer_id: string;
  completed_reviews: number;
  confirmed_reviews: number;
  specialization_tags: string[];
  observation_taxon_tags: string[];
  confidence_overrides: {
    previous_confidence: number;
    reviewer_confidence: number;
    later_confirmed: boolean;
  }[];
}

export interface ReviewerReputationResult {
  reviewer_id: string;
  review_accuracy_score: number;
  reviewer_specialization: string[];
  reliability_weight: number;
  confidence_override_accuracy: number;
  reasoning: string[];
}

function clamp(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function round(value: number): number {
  return Number(value.toFixed(2));
}

export function calculateReviewerReputation(
  input: ReviewerReputationInput
): ReviewerReputationResult {
  const accuracy = input.completed_reviews === 0
    ? 0.5
    : clamp(input.confirmed_reviews / input.completed_reviews);
  const overrideAccuracy = input.confidence_overrides.length === 0
    ? 0.5
    : input.confidence_overrides.filter((override) => override.later_confirmed).length /
      input.confidence_overrides.length;
  const specializationMatches = input.observation_taxon_tags.filter((tag) =>
    input.specialization_tags.includes(tag)
  ).length;
  const specializationScore = input.observation_taxon_tags.length === 0
    ? 0.5
    : clamp(specializationMatches / input.observation_taxon_tags.length);
  const experienceScore = clamp(input.completed_reviews / 100);
  const reliability = clamp(
    accuracy * 0.46 + overrideAccuracy * 0.22 + specializationScore * 0.2 + experienceScore * 0.12
  );
  const reasoning: string[] = [];

  if (accuracy >= 0.8) {
    reasoning.push("Reviewer has high historical validation accuracy.");
  } else if (accuracy < 0.55) {
    reasoning.push("Reviewer accuracy remains limited and should receive conservative weighting.");
  }

  if (specializationScore >= 0.7) {
    reasoning.push("Reviewer specialization aligns with observation context.");
  }

  if (overrideAccuracy >= 0.75 && input.confidence_overrides.length > 0) {
    reasoning.push("Reviewer confidence overrides have been frequently confirmed.");
  }

  return {
    reviewer_id: input.reviewer_id,
    review_accuracy_score: round(accuracy),
    reviewer_specialization: input.specialization_tags,
    reliability_weight: round(reliability),
    confidence_override_accuracy: round(overrideAccuracy),
    reasoning,
  };
}
