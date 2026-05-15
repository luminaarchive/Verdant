export * from "./types";
export * from "./firms";
export * from "./gfw";

import type { ThreatEvent } from "./types";

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
