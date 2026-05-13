// NaLI: Review Recommendation Engine

export type ReviewRecommendation = "automatic_review_required" | "expert_validation_recommended" | "routine_archive_safe";

export interface ReviewRecommendationInput {
  ecological_confidence: number;
  conflict_count: number;
  rarity_score: number;
  conservation_priority_score: number;
  reviewer_reliability_weight?: number;
  anomaly_severity_score: number;
}

export interface ReviewRecommendationResult {
  automatic_review_required: boolean;
  expert_validation_recommended: boolean;
  routine_archive_safe: boolean;
  recommendation: ReviewRecommendation;
  reasons: string[];
}

function clamp(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

export function generateReviewRecommendation(
  input: ReviewRecommendationInput
): ReviewRecommendationResult {
  const confidence = clamp(input.ecological_confidence);
  const rarity = clamp(input.rarity_score);
  const priority = clamp(input.conservation_priority_score);
  const anomaly = clamp(input.anomaly_severity_score);
  const reviewerWeight = clamp(input.reviewer_reliability_weight ?? 0.5);
  const reasons: string[] = [];

  if (confidence < 0.6) {
    reasons.push("Ecological confidence remains below operational archive threshold.");
  }

  if (input.conflict_count > 0) {
    reasons.push("Provider or ecological context conflicts require synthesis-layer review.");
  }

  if (priority >= 0.72) {
    reasons.push("Conservation priority indicates high operational attention.");
  }

  if (rarity >= 0.7) {
    reasons.push("Rare or low-density occurrence increases validation importance.");
  }

  if (anomaly >= 0.65) {
    reasons.push("Anomaly severity exceeds field review threshold.");
  }

  if (reviewerWeight >= 0.75) {
    reasons.push("Expert reviewer weighting can materially improve final validation.");
  }

  const automatic = confidence < 0.55 || priority >= 0.82 || anomaly >= 0.78 || input.conflict_count >= 2;
  const expert = automatic || priority >= 0.6 || rarity >= 0.7 || input.conflict_count > 0;
  const routine = !automatic && !expert && confidence >= 0.8 && anomaly < 0.35 && priority < 0.42;

  if (reasons.length === 0) {
    reasons.push("High confidence and no high-risk operational signals.");
  }

  return {
    automatic_review_required: automatic,
    expert_validation_recommended: expert,
    routine_archive_safe: routine,
    recommendation: automatic
      ? "automatic_review_required"
      : expert
        ? "expert_validation_recommended"
        : "routine_archive_safe",
    reasons,
  };
}
