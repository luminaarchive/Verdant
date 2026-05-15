import { EBirdContext, nowIso, ScientificBridgeResponse } from "../types";

export async function lookupEbirdTaxonomy(scientificName: string): Promise<ScientificBridgeResponse<EBirdContext>> {
  const apiKey = process.env.EBIRD_API_KEY ?? "";

  if (!apiKey) {
    return {
      status: "unconfigured",
      sourceName: "eBird",
      timestamp: nowIso(),
      confidenceContribution: 0,
      data: {
        scientificName,
        occurrenceSignal: "unconfigured",
      },
      rawReference: {
        url: "https://documenter.getpostman.com/view/664302/S1ENwy59",
        summary: "eBird API access requires EBIRD_API_KEY. Keep bird occurrence context disabled until configured.",
      },
      error: "EBIRD_API_KEY is not configured.",
    };
  }

  return {
    status: "configured",
    sourceName: "eBird",
    timestamp: nowIso(),
    confidenceContribution: 0.04,
    data: {
      scientificName,
      occurrenceSignal: "configured",
    },
    rawReference: {
      url: "https://documenter.getpostman.com/view/664302/S1ENwy59",
      summary: "eBird key is configured. Taxonomy/nearby observation endpoints should be called from a cached server route.",
    },
  };
}
