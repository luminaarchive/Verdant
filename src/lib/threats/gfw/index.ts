import type { ThreatFetcherState } from "../types";

export async function fetchGfwThreatEvents(): Promise<ThreatFetcherState> {
  const apiKey = process.env.GFW_API_KEY;

  if (!apiKey) {
    return {
      configured: false,
      reason: "GFW_API_KEY is not configured.",
      events: [],
    };
  }

  return {
    configured: false,
    reason:
      "GFW fetcher is scaffolded. Choose alert dataset, authorization scope, geometry policy, and attribution text before scheduled imports.",
    events: [],
  };
}
