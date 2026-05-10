// ─── Daily Intelligence Ritual ──────────────────────────────────────────────
// Generates a personalized daily brief that gives users a reason to return.

export interface DailyBrief {
  date: string
  greeting: string
  headline: string
  detail: string
  watchlistImpact: string | null
  signalCount: number
  icon: string
  color: string
  query: string // research link
}

const DAILY_BRIEFS: Omit<DailyBrief, 'date' | 'watchlistImpact' | 'signalCount'>[] = [
  {
    greeting: 'Good morning, researcher.',
    headline: 'Coral bleaching risk increased 14% this week in Southeast Asia',
    detail: 'NOAA Coral Reef Watch reports thermal stress levels exceeding the alert threshold across the Coral Triangle. This may affect marine biodiversity monitoring priorities.',
    icon: 'scuba_diving',
    color: '#C0392B',
    query: 'Coral bleaching Southeast Asia 2026 NOAA thermal stress analysis',
  },
  {
    greeting: 'Today\'s intelligence is ready.',
    headline: 'Amazon deforestation alerts surged 23% compared to last month',
    detail: 'INPE DETER data shows accelerated clearing in Pará and Mato Grosso states. Fire season forecasts suggest continued pressure through Q3.',
    icon: 'forest',
    color: '#B45309',
    query: 'Amazon deforestation INPE DETER 2026 monthly analysis',
  },
  {
    greeting: 'New signals detected overnight.',
    headline: 'IUCN assessment update: 847 species re-evaluated this quarter',
    detail: 'The latest Red List review reclassified 127 species to higher threat categories. Amphibians and freshwater fish show the steepest declines.',
    icon: 'pets',
    color: '#7C3AED',
    query: 'IUCN Red List quarterly update species reclassification analysis',
  },
  {
    greeting: 'Environmental intelligence for today.',
    headline: 'Global ocean temperatures reached new monthly high — 21.2°C average',
    detail: 'Copernicus ERA5 data confirms ocean surface temperatures exceeded pre-industrial baselines by 1.54°C. El Niño residual effects persist.',
    icon: 'thermostat',
    color: '#1D4ED8',
    query: 'Global ocean temperature anomaly Copernicus 2026 El Nino analysis',
  },
  {
    greeting: 'Your daily brief is ready.',
    headline: 'Permafrost methane emissions 3× higher than models predicted',
    detail: 'New satellite-based measurements from ESA reveal methane flux from Siberian permafrost significantly exceeds climate model projections.',
    icon: 'cloud',
    color: '#92400E',
    query: 'Permafrost methane emissions satellite ESA Siberia 2026 analysis',
  },
  {
    greeting: 'Critical updates this morning.',
    headline: 'EU Nature Restoration Law implementation begins across 12 member states',
    detail: 'The first binding ecosystem restoration targets take effect today. Agricultural and marine ecosystem restoration plans are now mandatory.',
    icon: 'gavel',
    color: '#2E5D3E',
    query: 'EU Nature Restoration Law implementation 2026 analysis',
  },
  {
    greeting: 'Intelligence digest for today.',
    headline: 'New study links microplastic density to coral disease prevalence',
    detail: 'Research published in Nature Ecology & Evolution demonstrates a 89% correlation between microplastic concentration and white syndrome in Indo-Pacific corals.',
    icon: 'science',
    color: '#C0392B',
    query: 'Microplastic coral disease Nature study analysis 2026',
  },
]

export function getDailyBrief(): DailyBrief {
  // Deterministic by date so the same brief shows all day
  const today = new Date()
  const dayIndex = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % DAILY_BRIEFS.length
  const base = DAILY_BRIEFS[dayIndex]

  // Check if any watchlists might be affected
  let watchlistImpact: string | null = null
  try {
    const wl = JSON.parse(localStorage.getItem('verdant-watchlists') ?? '[]')
    if (wl.length > 0) {
      watchlistImpact = `This may affect ${Math.min(wl.length, 2)} of your active watchlists.`
    }
  } catch { /* ignore */ }

  return {
    ...base,
    date: today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    watchlistImpact,
    signalCount: 3 + (today.getDate() % 5),
  }
}
