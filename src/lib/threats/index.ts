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

export async function fetchFirmsThreatEvents(): Promise<ThreatFetcherState> {
  const apiKey = process.env.NASA_FIRMS_API_KEY;
  if (!apiKey) {
    return {
      configured: false,
      reason: "NASA_FIRMS_API_KEY is not configured.",
      events: [],
    };
  }

  return {
    configured: false,
    reason:
      "FIRMS fetcher is scaffolded; enable the scheduled importer after selecting product, bbox, and retention policy.",
    events: [],
  };
}

export async function fetchGfwThreatEvents(): Promise<ThreatFetcherState> {
  const apiKey = process.env.GFW_API_KEY;
  if (!apiKey) {
    return {
      configured: false,
      reason: "GFW_API_KEY is not configured.",
      events: [],
    };
  }

  return {
    configured: false,
    reason: "GFW fetcher is scaffolded; enable after choosing alert dataset and authorization scope.",
    events: [],
  };
}

export function computeThreatPulseScore(events: ThreatEvent[]) {
  const weights = {
    low: 1,
    medium: 2,
    high: 4,
    critical: 7,
  };
  const raw = events.reduce((sum, event) => sum + weights[event.severity], 0);

  return Math.min(100, raw * 8);
}

export const threatPulseDisclaimer = {
  en: "Indicative threat index based on FIRMS fire data, GFW deforestation alerts, and NaLI field reports. Not an official government or scientific assessment.",
  id: "Indeks ancaman indikatif berdasarkan data titik api FIRMS, peringatan deforestasi GFW, dan laporan lapangan NaLI. Bukan penilaian resmi pemerintah atau lembaga ilmiah.",
};
