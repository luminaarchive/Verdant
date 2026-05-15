import { bridgeError, INaturalistContext, nowIso, ScientificBridgeResponse } from "../types";

const INAT_BASE = "https://api.inaturalist.org/v1";

export async function lookupInaturalistTaxon(
  scientificName: string,
): Promise<ScientificBridgeResponse<INaturalistContext>> {
  const url = `${INAT_BASE}/taxa?q=${encodeURIComponent(scientificName)}&per_page=1`;

  try {
    const response = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
    if (!response.ok) throw new Error(`iNaturalist taxa lookup returned ${response.status}`);
    const json = (await response.json()) as {
      results?: Array<{ id?: number; name?: string; preferred_common_name?: string; observations_count?: number }>;
    };
    const first = json.results?.[0];

    return {
      status: "live",
      sourceName: "iNaturalist",
      timestamp: nowIso(),
      confidenceContribution: first ? 0.08 : 0.01,
      data: {
        taxonId: first?.id,
        name: first?.name ?? scientificName,
        preferredCommonName: first?.preferred_common_name,
        observationCount: first?.observations_count,
        communitySignal:
          "Community/citizen-science context only. NaLI must not treat iNaturalist observations as authoritative proof.",
      },
      rawReference: {
        url,
        summary: "iNaturalist taxa lookup used as community context, not as a verified field observation.",
      },
    };
  } catch (error) {
    return {
      status: "degraded",
      sourceName: "iNaturalist",
      timestamp: nowIso(),
      confidenceContribution: 0,
      data: null,
      rawReference: { url, summary: "iNaturalist request failed." },
      error: bridgeError(error),
    };
  }
}
