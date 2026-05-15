export * from "./types";
export * from "./provider-health";
export * from "./gbif";
export * from "./iucn";
export * from "./ebird";
export * from "./inaturalist";
export * from "./eol";
export * from "./catalogue-of-life";

import { lookupCatalogueOfLifeTaxon } from "./catalogue-of-life";
import { lookupEbirdTaxonomy } from "./ebird";
import { lookupEolContext } from "./eol";
import { lookupGbifOccurrenceContext } from "./gbif";
import { lookupInaturalistTaxon } from "./inaturalist";
import { lookupIucnConservationContext } from "./iucn";

export async function buildSourceBackedSpeciesContext(scientificName: string) {
  const [gbif, iucn, ebird, inaturalist, eol, catalogueOfLife] = await Promise.all([
    lookupGbifOccurrenceContext(scientificName),
    lookupIucnConservationContext(scientificName),
    lookupEbirdTaxonomy(scientificName),
    lookupInaturalistTaxon(scientificName),
    lookupEolContext(scientificName),
    lookupCatalogueOfLifeTaxon(scientificName),
  ]);

  return {
    scientificName,
    timestamp: new Date().toISOString(),
    providers: {
      gbif,
      iucn,
      ebird,
      inaturalist,
      eol,
      catalogueOfLife,
    },
    confidenceContribution: [gbif, iucn, ebird, inaturalist, eol, catalogueOfLife].reduce(
      (total, provider) => total + provider.confidenceContribution,
      0,
    ),
  };
}
