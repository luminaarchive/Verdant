// NaLI: Scientific Export System

export interface ScientificObservationPackage {
  observation_id: string;
  scientific_name: string;
  event_date: string;
  decimal_latitude?: number;
  decimal_longitude?: number;
  coordinate_uncertainty_in_meters?: number;
  basis_of_record?: "HumanObservation" | "MachineObservation" | "MaterialSample";
  occurrence_status?: "present" | "absent";
  confidence?: number;
  conservation_priority?: string;
  locality?: string;
  recorded_by?: string;
  media_urls?: string[];
  reasoning?: string[];
}

export interface GeoJsonFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  } | null;
  properties: Record<string, string | number | boolean | string[] | undefined>;
}

export function toDarwinCore(observation: ScientificObservationPackage): Record<string, string | number | undefined> {
  return {
    occurrenceID: observation.observation_id,
    scientificName: observation.scientific_name,
    eventDate: observation.event_date,
    decimalLatitude: observation.decimal_latitude,
    decimalLongitude: observation.decimal_longitude,
    coordinateUncertaintyInMeters: observation.coordinate_uncertainty_in_meters,
    basisOfRecord: observation.basis_of_record ?? "MachineObservation",
    occurrenceStatus: observation.occurrence_status ?? "present",
    locality: observation.locality,
    recordedBy: observation.recorded_by,
  };
}

export function toGeoJsonFeature(observation: ScientificObservationPackage): GeoJsonFeature {
  const hasCoordinates = typeof observation.decimal_latitude === "number" &&
    typeof observation.decimal_longitude === "number";

  return {
    type: "Feature",
    geometry: hasCoordinates
      ? {
          type: "Point",
          coordinates: [observation.decimal_longitude!, observation.decimal_latitude!],
        }
      : null,
    properties: {
      observation_id: observation.observation_id,
      scientific_name: observation.scientific_name,
      event_date: observation.event_date,
      coordinate_uncertainty_in_meters: observation.coordinate_uncertainty_in_meters,
      confidence: observation.confidence,
      conservation_priority: observation.conservation_priority,
      media_urls: observation.media_urls,
      reasoning: observation.reasoning,
    },
  };
}

function escapeCsv(value: string | number | undefined): string {
  if (value === undefined) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(observations: ScientificObservationPackage[]): string {
  const headers = [
    "observation_id",
    "scientific_name",
    "event_date",
    "decimal_latitude",
    "decimal_longitude",
    "coordinate_uncertainty_in_meters",
    "confidence",
    "conservation_priority",
  ];
  const rows = observations.map((observation) => [
    observation.observation_id,
    observation.scientific_name,
    observation.event_date,
    observation.decimal_latitude,
    observation.decimal_longitude,
    observation.coordinate_uncertainty_in_meters,
    observation.confidence,
    observation.conservation_priority,
  ].map(escapeCsv).join(","));

  return [headers.join(","), ...rows].join("\n");
}

export function packageScientificObservation(observation: ScientificObservationPackage) {
  return {
    darwin_core: toDarwinCore(observation),
    geojson: toGeoJsonFeature(observation),
    csv: toCsv([observation]),
  };
}
