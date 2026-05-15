import {
  bridgeError,
  GbifOccurrenceContext,
  GbifSpeciesMatch,
  nowIso,
  ScientificBridgeResponse,
} from "../types";

const GBIF_BASE = "https://api.gbif.org/v1";

export async function matchGbifSpecies(scientificName: string): Promise<ScientificBridgeResponse<GbifSpeciesMatch>> {
  const url = `${GBIF_BASE}/species/match?name=${encodeURIComponent(scientificName)}`;

  try {
    const response = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
    if (!response.ok) throw new Error(`GBIF species match returned ${response.status}`);
    const json = (await response.json()) as {
      usageKey?: number;
      scientificName?: string;
      canonicalName?: string;
      rank?: string;
      status?: string;
      confidence?: number;
      matchType?: string;
    };

    return {
      status: "live",
      sourceName: "GBIF",
      timestamp: nowIso(),
      confidenceContribution: Math.min(0.25, (json.confidence ?? 0) / 400),
      data: {
        usageKey: json.usageKey,
        scientificName: json.scientificName ?? scientificName,
        canonicalName: json.canonicalName,
        rank: json.rank,
        status: json.status,
        confidence: json.confidence,
        matchType: json.matchType,
      },
      rawReference: {
        url,
        summary: "GBIF species backbone match. Public reads usually do not require authentication.",
      },
    };
  } catch (error) {
    return {
      status: "degraded",
      sourceName: "GBIF",
      timestamp: nowIso(),
      confidenceContribution: 0,
      data: null,
      rawReference: { url, summary: "GBIF species match request failed." },
      error: bridgeError(error),
    };
  }
}

export async function lookupGbifOccurrenceContext(
  scientificName: string,
  country = "ID",
): Promise<ScientificBridgeResponse<GbifOccurrenceContext>> {
  const match = await matchGbifSpecies(scientificName);
  const taxonKey = match.data?.usageKey;

  if (!taxonKey) {
    return {
      status: match.status === "live" ? "fallback" : match.status,
      sourceName: "GBIF",
      timestamp: nowIso(),
      confidenceContribution: 0,
      data: {
        occurrenceCount: 0,
        distributionConfidence: "unknown",
      },
      rawReference: match.rawReference,
      error: match.error ?? "No GBIF taxon key found.",
    };
  }

  const globalUrl = `${GBIF_BASE}/occurrence/search?taxonKey=${taxonKey}&limit=0`;
  const countryUrl = `${GBIF_BASE}/occurrence/search?taxonKey=${taxonKey}&country=${encodeURIComponent(country)}&limit=0`;

  try {
    const [globalResponse, countryResponse] = await Promise.all([
      fetch(globalUrl, { next: { revalidate: 60 * 60 * 24 } }),
      fetch(countryUrl, { next: { revalidate: 60 * 60 * 24 } }),
    ]);
    if (!globalResponse.ok || !countryResponse.ok) throw new Error("GBIF occurrence lookup failed");

    const globalJson = (await globalResponse.json()) as { count?: number };
    const countryJson = (await countryResponse.json()) as { count?: number };
    const occurrenceCount = globalJson.count ?? 0;
    const countryOccurrenceCount = countryJson.count ?? 0;

    return {
      status: "live",
      sourceName: "GBIF",
      timestamp: nowIso(),
      confidenceContribution: countryOccurrenceCount > 0 ? 0.12 : 0.02,
      data: {
        taxonKey,
        country,
        occurrenceCount,
        countryOccurrenceCount,
        distributionConfidence:
          countryOccurrenceCount > 50 ? "high" : countryOccurrenceCount > 0 ? "medium" : "low",
      },
      rawReference: {
        url: countryUrl,
        summary: "GBIF occurrence count used only as distribution context, not proof of a specific field observation.",
      },
    };
  } catch (error) {
    return {
      status: "degraded",
      sourceName: "GBIF",
      timestamp: nowIso(),
      confidenceContribution: 0,
      data: null,
      rawReference: { url: countryUrl, summary: "GBIF occurrence request failed." },
      error: bridgeError(error),
    };
  }
}
