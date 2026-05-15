export type ObservationQualityInput = {
  hasPhoto?: boolean;
  hasAudio?: boolean;
  hasGps?: boolean;
  hasHabitatNote?: boolean;
  hasTimestamp?: boolean;
  hasMediaChecksum?: boolean;
  hasEvidenceHash?: boolean;
  reviewerValidated?: boolean;
  description?: string | null;
};

export type ObservationQualityResult = {
  score: number;
  band: "low" | "medium" | "high";
  reasons: string[];
};

export function scoreObservationQuality(input: ObservationQualityInput): ObservationQualityResult {
  const reasons: string[] = [];
  let score = 0;

  if (input.hasPhoto) {
    score += 15;
    reasons.push("photo evidence present");
  }
  if (input.hasAudio) {
    score += 10;
    reasons.push("audio evidence present");
  }
  if (input.hasGps) {
    score += 15;
    reasons.push("GPS present");
  }
  if (input.hasHabitatNote) {
    score += 10;
    reasons.push("habitat note present");
  }
  if (input.hasTimestamp) {
    score += 10;
    reasons.push("timestamp present");
  }
  if (input.hasMediaChecksum) {
    score += 10;
    reasons.push("media checksum present");
  }
  if (input.hasEvidenceHash) {
    score += 15;
    reasons.push("evidence hash present");
  }
  if (input.reviewerValidated) {
    score += 10;
    reasons.push("reviewer validation present");
  }
  if ((input.description ?? "").trim().length >= 80) {
    score += 5;
    reasons.push("description is field-useful");
  }

  return {
    score: Math.min(100, score),
    band: score >= 75 ? "high" : score >= 45 ? "medium" : "low",
    reasons,
  };
}
