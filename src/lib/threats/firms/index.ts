import type { ThreatFetcherState } from "../types";

export async function fetchFirmsThreatEvents(): Promise<ThreatFetcherState> {
  const apiKey = process.env.NASA_FIRMS_API_KEY;

  if (!apiKey) {
    return {
      configured: false,
      reason: "NASA_FIRMS_API_KEY is not configured.",
      events: [],
    };
  }

  return {
    configured: false,
    reason:
      "FIRMS fetcher is scaffolded. Select sensor product, Indonesia bounding boxes, retention policy, and cron owner before enabling imports.",
    events: [],
  };
}
