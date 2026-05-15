export type ThreatSource = "firms" | "gfw" | "nali";
export type ThreatType = "fire" | "deforestation" | "field_report";

export type ThreatEvent = {
  source: ThreatSource;
  type: ThreatType;
  latitude: number;
  longitude: number;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
  rawPayload: Record<string, unknown>;
};

export type ThreatFetcherState =
  | { configured: true; events: ThreatEvent[] }
  | { configured: false; reason: string; events: ThreatEvent[] };
