import { bridgeError, EolContext, nowIso, ScientificBridgeResponse } from "../types";

const EOL_BASE = "https://eol.org/api";

export async function lookupEolContext(scientificName: string): Promise<ScientificBridgeResponse<EolContext>> {
  const url = `${EOL_BASE}/search/1.0.json?q=${encodeURIComponent(scientificName)}&page=1&exact=true`;

  try {
    const response = await fetch(url, { next: { revalidate: 60 * 60 * 24 * 7 } });
    if (!response.ok) throw new Error(`EOL search returned ${response.status}`);
    const json = (await response.json()) as { results?: Array<{ id?: number; title?: string }> };
    const first = json.results?.[0];

    return {
      status: "live",
      sourceName: "Encyclopedia of Life",
      timestamp: nowIso(),
      confidenceContribution: first ? 0.05 : 0.01,
      data: {
        pageId: first?.id,
        scientificName: first?.title ?? scientificName,
        commonNames: [],
        traitSignal: first ? "EOL page found; descriptions/traits should be summarized and cited before use." : undefined,
      },
      rawReference: {
        url,
        summary: "EOL search used to discover species page context. Description ingestion should remain cited and summarized.",
      },
    };
  } catch (error) {
    return {
      status: "degraded",
      sourceName: "Encyclopedia of Life",
      timestamp: nowIso(),
      confidenceContribution: 0,
      data: null,
      rawReference: { url, summary: "EOL request failed." },
      error: bridgeError(error),
    };
  }
}
