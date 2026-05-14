export type DarwinCoreObservation = {
  id: string;
  scientific_name: string | null;
  local_name: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string | null;
  timestamp?: string | null;
  user_id: string | null;
  review_status?: string | null;
  verified_by_human?: boolean | null;
  field_case_id?: string | null;
  conservation_status?: string | null;
  sensitive?: boolean;
  canExportExactCoordinates?: boolean;
};

export type DarwinCoreOccurrence = {
  occurrenceID: string;
  scientificName: string;
  vernacularName: string;
  decimalLatitude: string;
  decimalLongitude: string;
  eventDate: string;
  recordedBy: string;
  basisOfRecord: "HumanObservation";
  occurrenceStatus: "present";
  eventID: string;
  geodeticDatum: "WGS84";
  coordinateUncertaintyInMeters: string;
  informationWithheld: string;
};

const headers: Array<keyof DarwinCoreOccurrence> = [
  "occurrenceID",
  "scientificName",
  "vernacularName",
  "decimalLatitude",
  "decimalLongitude",
  "eventDate",
  "recordedBy",
  "basisOfRecord",
  "occurrenceStatus",
  "eventID",
  "geodeticDatum",
  "coordinateUncertaintyInMeters",
  "informationWithheld",
];

function csvEscape(value: string) {
  if (!/[",\n]/.test(value)) return value;
  return `"${value.replaceAll('"', '""')}"`;
}

function isSensitiveStatus(status?: string | null) {
  return status === "CR" || status === "EN";
}

export function mapObservationToDarwinCore(observation: DarwinCoreObservation): DarwinCoreOccurrence {
  const exactCoordinatesAllowed =
    observation.canExportExactCoordinates === true ||
    (!observation.sensitive && !isSensitiveStatus(observation.conservation_status));
  const hasExactCoordinates =
    exactCoordinatesAllowed && typeof observation.latitude === "number" && typeof observation.longitude === "number";

  return {
    occurrenceID: observation.id,
    scientificName: observation.scientific_name ?? "",
    vernacularName: observation.local_name ?? "",
    decimalLatitude: hasExactCoordinates ? observation.latitude!.toFixed(6) : "",
    decimalLongitude: hasExactCoordinates ? observation.longitude!.toFixed(6) : "",
    eventDate: observation.created_at ?? observation.timestamp ?? "",
    recordedBy: observation.user_id ? `NaLI user ${observation.user_id}` : "NaLI observer",
    basisOfRecord: "HumanObservation",
    occurrenceStatus: "present",
    eventID: observation.field_case_id ?? observation.id,
    geodeticDatum: "WGS84",
    coordinateUncertaintyInMeters: hasExactCoordinates ? "" : "protected",
    informationWithheld: hasExactCoordinates ? "" : "Sensitive coordinates withheld by NaLI export policy.",
  };
}

export function serializeDarwinCoreCsv(records: DarwinCoreOccurrence[]) {
  const rows = [headers.join(",")];

  for (const record of records) {
    rows.push(headers.map((header) => csvEscape(record[header])).join(","));
  }

  return `${rows.join("\n")}\n`;
}

export function buildDarwinCoreArchiveFiles(records: DarwinCoreOccurrence[]) {
  return {
    "occurrence.txt": serializeDarwinCoreCsv(records),
    "meta.xml": `<?xml version="1.0" encoding="UTF-8"?>\n<archive xmlns="http://rs.tdwg.org/dwc/text/" metadata="eml.xml">\n  <core encoding="UTF-8" fieldsTerminatedBy="," linesTerminatedBy="\\n" fieldsEnclosedBy="&quot;" ignoreHeaderLines="1" rowType="http://rs.tdwg.org/dwc/terms/Occurrence">\n    <files><location>occurrence.txt</location></files>\n    ${headers.map((term, index) => `<field index="${index}" term="http://rs.tdwg.org/dwc/terms/${term}" />`).join("\n    ")}\n  </core>\n</archive>\n`,
    "eml.xml": `<?xml version="1.0" encoding="UTF-8"?>\n<eml:eml xmlns:eml="eml://ecoinformatics.org/eml-2.1.1" packageId="nali-dwc-a" system="NaLI">\n  <dataset>\n    <title>NaLI verified observation export</title>\n    <abstract><para>Darwin Core Archive generated from verified NaLI field observations. Sensitive coordinates may be withheld by export policy.</para></abstract>\n  </dataset>\n</eml:eml>\n`,
  };
}
