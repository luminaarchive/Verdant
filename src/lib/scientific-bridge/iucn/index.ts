import { bridgeError, IucnConservationContext, nowIso, ScientificBridgeResponse } from "../types";

const IUCN_BASE = "https://apiv3.iucnredlist.org/api/v3";

function getToken() {
  return process.env.IUCN_API_KEY ?? process.env.IUCN_API_TOKEN ?? "";
}

function summarizeTitles(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (item && typeof item === "object" && "title" in item) return String(item.title);
      if (item && typeof item === "object" && "code" in item) return String(item.code);
      return "";
    })
    .filter(Boolean)
    .slice(0, 5);
}

export async function lookupIucnConservationContext(
  scientificName: string,
): Promise<ScientificBridgeResponse<IucnConservationContext>> {
  const token = getToken();
  const encodedName = encodeURIComponent(scientificName);
  const statusUrl = `${IUCN_BASE}/species/${encodedName}`;

  if (!token) {
    return {
      status: "unconfigured",
      sourceName: "IUCN Red List",
      timestamp: nowIso(),
      confidenceContribution: 0,
      data: null,
      rawReference: {
        url: "https://api.iucnredlist.org/",
        summary: "IUCN Red List API requires IUCN_API_KEY. NaLI must use golden-set or cached status until configured.",
      },
      error: "IUCN_API_KEY is not configured.",
    };
  }

  try {
    const [statusResponse, threatsResponse, habitatsResponse, actionsResponse] = await Promise.all([
      fetch(`${statusUrl}?token=${token}`, { next: { revalidate: 60 * 60 * 24 * 7 } }),
      fetch(`${IUCN_BASE}/threats/species/name/${encodedName}?token=${token}`, {
        next: { revalidate: 60 * 60 * 24 * 7 },
      }),
      fetch(`${IUCN_BASE}/habitats/species/name/${encodedName}?token=${token}`, {
        next: { revalidate: 60 * 60 * 24 * 7 },
      }),
      fetch(`${IUCN_BASE}/measures/species/name/${encodedName}?token=${token}`, {
        next: { revalidate: 60 * 60 * 24 * 7 },
      }),
    ]);

    if (!statusResponse.ok) throw new Error(`IUCN status returned ${statusResponse.status}`);
    const statusJson = (await statusResponse.json()) as {
      result?: Array<{ category?: string; population_trend?: string; main_common_name?: string }>;
    };
    const first = statusJson.result?.[0];

    const threatsJson = threatsResponse.ok ? ((await threatsResponse.json()) as { result?: unknown[] }) : {};
    const habitatsJson = habitatsResponse.ok ? ((await habitatsResponse.json()) as { result?: unknown[] }) : {};
    const actionsJson = actionsResponse.ok ? ((await actionsResponse.json()) as { result?: unknown[] }) : {};

    const category = first?.category;
    const riskExplanation = category
      ? `${scientificName} has IUCN category ${category}. Treat this as conservation context, not automatic verification.`
      : "IUCN returned no category for this species name.";

    return {
      status: "configured",
      sourceName: "IUCN Red List",
      timestamp: nowIso(),
      confidenceContribution: category ? 0.2 : 0.03,
      data: {
        scientificName,
        category,
        populationTrend: first?.population_trend,
        threats: summarizeTitles(threatsJson.result),
        habitats: summarizeTitles(habitatsJson.result),
        conservationActions: summarizeTitles(actionsJson.result),
        riskExplanation,
      },
      rawReference: {
        url: "https://api.iucnredlist.org/api-docs",
        summary: "IUCN status, threats, habitat, and conservation action endpoints queried with server-side token.",
      },
    };
  } catch (error) {
    return {
      status: "degraded",
      sourceName: "IUCN Red List",
      timestamp: nowIso(),
      confidenceContribution: 0,
      data: null,
      rawReference: {
        url: "https://api.iucnredlist.org/api-docs",
        summary: "IUCN API request failed; no secret value is exposed in this error.",
      },
      error: bridgeError(error),
    };
  }
}
