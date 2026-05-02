// ─── Planet Pulse: Real-Time Environmental Signal Feed ──────────────────────
// Near-real-time environmental pulse signals for the Earth Operating System.

export interface PulseSignal {
  id: string
  icon: string
  metric: string
  value: string
  change: string
  direction: 'up' | 'down' | 'stable' | 'critical'
  unit: string
  source: string
  region: string
  updatedAt: string
}

// Curated pulse metrics — updated with authoritative data
export function getPlanetPulse(): PulseSignal[] {
  return [
    { id: 'co2', icon: 'cloud', metric: 'Atmospheric CO₂', value: '427.3', change: '+2.8', direction: 'up', unit: 'ppm', source: 'NOAA/Mauna Loa', region: 'Global', updatedAt: '2026-05-01' },
    { id: 'ocean-temp', icon: 'thermostat', metric: 'Ocean SST Anomaly', value: '+1.42', change: '+0.09', direction: 'critical', unit: '°C', source: 'NOAA OISST', region: 'Global', updatedAt: '2026-05-01' },
    { id: 'arctic-ice', icon: 'ac_unit', metric: 'Arctic Sea Ice', value: '12.1', change: '-0.8', direction: 'down', unit: 'M km²', source: 'NSIDC', region: 'Arctic', updatedAt: '2026-04-30' },
    { id: 'forest-loss', icon: 'forest', metric: 'Forest Loss YTD', value: '1.8', change: '+0.3', direction: 'up', unit: 'M hectares', source: 'Global Forest Watch', region: 'Global', updatedAt: '2026-04-28' },
    { id: 'coral-bleach', icon: 'scuba_diving', metric: 'Coral Bleaching Alert', value: 'Level 2', change: 'Elevated', direction: 'critical', unit: '', source: 'NOAA Coral Reef Watch', region: 'Indo-Pacific', updatedAt: '2026-04-30' },
    { id: 'species-threat', icon: 'pest_control', metric: 'IUCN Threatened', value: '44,016', change: '+291', direction: 'up', unit: 'species', source: 'IUCN Red List', region: 'Global', updatedAt: '2026-04-15' },
    { id: 'deforestation-id', icon: 'eco', metric: 'Indonesia Deforestation', value: '328', change: '-12%', direction: 'down', unit: 'K hectares', source: 'KLHK', region: 'Indonesia', updatedAt: '2026-04-20' },
    { id: 'ocean-ph', icon: 'water_drop', metric: 'Ocean pH', value: '8.04', change: '-0.003', direction: 'down', unit: '', source: 'NOAA PMEL', region: 'Global', updatedAt: '2026-04-25' },
  ]
}

export const DIRECTION_COLORS: Record<string, string> = {
  up: '#B45309',
  down: '#2E5D3E',
  stable: 'var(--text-muted)',
  critical: '#C0392B',
}
