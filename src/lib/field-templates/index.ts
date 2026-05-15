export type FieldTemplateKind = "bird" | "mammal" | "reptile" | "threat" | "track_scat" | "camera_trap" | "patrol";

export type EvidenceType =
  | "photo"
  | "audio"
  | "track"
  | "scat"
  | "nest"
  | "camera_trap"
  | "snare"
  | "habitat_damage"
  | "conflict_report";

export type FieldTemplate = {
  kind: FieldTemplateKind;
  labelEn: string;
  labelId: string;
  evidenceTypes: EvidenceType[];
  requiredFields: string[];
};

export const fieldTemplates: FieldTemplate[] = [
  {
    kind: "bird",
    labelEn: "Bird observation",
    labelId: "Observasi burung",
    evidenceTypes: ["photo", "audio", "nest"],
    requiredFields: ["speciesCandidate", "count", "habitat", "behavior", "gps"],
  },
  {
    kind: "mammal",
    labelEn: "Mammal observation",
    labelId: "Observasi mamalia",
    evidenceTypes: ["photo", "track", "scat", "camera_trap"],
    requiredFields: ["speciesCandidate", "count", "habitat", "gps"],
  },
  {
    kind: "reptile",
    labelEn: "Reptile observation",
    labelId: "Observasi reptil",
    evidenceTypes: ["photo", "track", "nest"],
    requiredFields: ["speciesCandidate", "habitat", "gps"],
  },
  {
    kind: "threat",
    labelEn: "Threat report",
    labelId: "Laporan ancaman",
    evidenceTypes: ["photo", "snare", "habitat_damage", "conflict_report"],
    requiredFields: ["threatType", "severity", "gps", "notes"],
  },
  {
    kind: "track_scat",
    labelEn: "Track or scat",
    labelId: "Jejak atau kotoran",
    evidenceTypes: ["photo", "track", "scat"],
    requiredFields: ["evidenceType", "scaleReference", "habitat", "gps"],
  },
  {
    kind: "camera_trap",
    labelEn: "Camera trap record",
    labelId: "Catatan kamera trap",
    evidenceTypes: ["camera_trap", "photo"],
    requiredFields: ["cameraId", "deploymentId", "timestamp", "speciesCandidate"],
  },
  {
    kind: "patrol",
    labelEn: "Patrol note",
    labelId: "Catatan patroli",
    evidenceTypes: ["photo", "conflict_report", "habitat_damage"],
    requiredFields: ["routeSegment", "team", "timeWindow", "notes"],
  },
];
