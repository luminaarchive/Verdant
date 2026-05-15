export type SurveyProtocolKind = "camera_trap_batch" | "transect" | "point_count" | "patrol_route" | "timed_survey";

export type SurveyProtocol = {
  kind: SurveyProtocolKind;
  labelEn: string;
  labelId: string;
  status: "scaffolded";
  requiredMetadata: string[];
};

export const surveyProtocols: SurveyProtocol[] = [
  {
    kind: "camera_trap_batch",
    labelEn: "Camera trap batch",
    labelId: "Batch kamera trap",
    status: "scaffolded",
    requiredMetadata: ["cameraId", "deploymentId", "startAt", "endAt", "mediaChecksum"],
  },
  {
    kind: "transect",
    labelEn: "Transect",
    labelId: "Transek",
    status: "scaffolded",
    requiredMetadata: ["transectId", "observer", "startPoint", "endPoint", "effortMinutes"],
  },
  {
    kind: "point_count",
    labelEn: "Point count",
    labelId: "Hitung titik",
    status: "scaffolded",
    requiredMetadata: ["pointId", "radiusMeters", "durationMinutes", "weather"],
  },
  {
    kind: "patrol_route",
    labelEn: "Patrol route",
    labelId: "Rute patroli",
    status: "scaffolded",
    requiredMetadata: ["routeId", "team", "startAt", "endAt"],
  },
  {
    kind: "timed_survey",
    labelEn: "Timed survey",
    labelId: "Survei berbatas waktu",
    status: "scaffolded",
    requiredMetadata: ["surveyId", "durationMinutes", "targetTaxa", "observer"],
  },
];
