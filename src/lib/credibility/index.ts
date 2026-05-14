export type CredibilityReviewAction = "verify" | "request_clarification" | "reject";

export type CredibilityScoreInput = {
  currentScore: number;
  action: CredibilityReviewAction;
  hadRevision?: boolean;
  conservationStatus?: string | null;
  hasPhoto?: boolean;
  hasGps?: boolean;
  hasDescription?: boolean;
  hasHabitat?: boolean;
  consistencyBonusEligible?: boolean;
};

export function scoreObservationReview(input: CredibilityScoreInput) {
  let delta = 0;

  if (input.action === "verify" && !input.hadRevision) delta += 10;
  if (input.action === "verify" && input.hadRevision) delta += 3;
  if (input.action === "reject") delta -= 5;
  if (input.action === "verify" && (input.conservationStatus === "EN" || input.conservationStatus === "CR")) {
    delta += 25;
  }
  if (input.hasPhoto && input.hasGps && input.hasDescription && input.hasHabitat) delta += 5;
  if (input.consistencyBonusEligible) delta += 20;

  const score = Math.max(0, input.currentScore + delta);

  return {
    score,
    delta,
    autoTrustEligible: score >= 150,
  };
}
