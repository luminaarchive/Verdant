import { bridgeError, CatalogueOfLifeContext, nowIso, ScientificBridgeResponse } from "../types";

const COL_DATASET_KEY = 314965;

export async function lookupCatalogueOfLifeTaxon(
  scientificName: string,
): Promise<ScientificBridgeResponse<CatalogueOfLifeContext>> {
  const url = `https://api.checklistbank.org/dataset/${COL_DATASET_KEY}/nameusage/search?q=${encodeURIComponent(
    scientificName,
  )}&limit=1`;

  try {
    const response = await fetch(url, { next: { revalidate: 60 * 60 * 24 * 7 } });
    if (!response.ok) throw new Error(`Catalogue of Life lookup returned ${response.status}`);
    const json = (await response.json()) as {
      result?: Array<{ id?: string; usage?: { name?: { scientificName?: string }; status?: string; rank?: string } }>;
    };
    const first = json.result?.[0];

    return {
      status: "live",
      sourceName: "Catalogue of Life",
      timestamp: nowIso(),
      confidenceContribution: first ? 0.05 : 0.01,
      data: {
        usageId: first?.id,
        scientificName: first?.usage?.name?.scientificName ?? scientificName,
        status: first?.usage?.status,
        rank: first?.usage?.rank,
        datasetKey: COL_DATASET_KEY,
      },
      rawReference: {
        url,
        summary: "Catalogue of Life ChecklistBank search used as taxonomy cross-check.",
      },
    };
  } catch (error) {
    return {
      status: "degraded",
      sourceName: "Catalogue of Life",
      timestamp: nowIso(),
      confidenceContribution: 0,
      data: null,
      rawReference: { url, summary: "Catalogue of Life request failed." },
      error: bridgeError(error),
    };
  }
}
