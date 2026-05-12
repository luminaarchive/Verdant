export type ConservationStatus = 
  | "EX" 
  | "EW" 
  | "CR" 
  | "EN" 
  | "VU" 
  | "NT" 
  | "LC" 
  | "DD" 
  | "NE";

export type PopulationTrend = "increasing" | "decreasing" | "stable" | "unknown";

export type SpeciesReference = {
  id: string;
  gbifTaxonKey: number;
  iucnId: string;
  scientificName: string;
  commonNameId: string;
  commonNameEn: string;
  family: string;
  order: string;
  class: string;
  isEndemicIndonesia: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GeoJSON = {
  type: string;
  coordinates: unknown;
};

export type SpeciesCache = {
  id: string;
  speciesRefId: string;
  source: "gbif" | "iucn";
  sourceVersion: string;
  conservationStatus: ConservationStatus;
  distributionGeojson: GeoJSON | null;
  threats: string[];
  populationTrend: PopulationTrend;
  cachedAt: string;
  ttlExpiresAt: string;
};
