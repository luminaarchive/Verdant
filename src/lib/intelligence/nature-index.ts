// ─── World Nature Index: Proprietary Verdant Environmental Indices ──────────
// Flagship environmental indices that create a signature Verdant language.

export interface NatureIndex {
  id: string
  name: string
  score: number
  maxScore: number
  change: number // positive = improvement, negative = decline
  trend: 'improving' | 'declining' | 'stable' | 'critical'
  icon: string
  color: string
  description: string
  lastUpdated: string
}

export function getWorldNatureIndex(): NatureIndex[] {
  return [
    { id: 'bri', name: 'Biodiversity Risk Index', score: 34, maxScore: 100, change: -2.1, trend: 'declining', icon: 'pets', color: '#B45309', description: 'Global measure of species extinction risk acceleration across all taxonomic groups.' , lastUpdated: '2026-04-28' },
    { id: 'csi', name: 'Coral Survival Index', score: 41, maxScore: 100, change: -4.7, trend: 'critical', icon: 'scuba_diving', color: '#C0392B', description: 'Aggregate health score for global reef systems based on bleaching frequency, recovery rate, and thermal stress.' , lastUpdated: '2026-04-25' },
    { id: 'fci', name: 'Forest Cover Integrity', score: 62, maxScore: 100, change: -1.3, trend: 'declining', icon: 'forest', color: '#2E5D3E', description: 'Ratio of intact primary forest to historical baseline, weighted by carbon density and biodiversity value.' , lastUpdated: '2026-04-20' },
    { id: 'opi', name: 'Ocean Protection Index', score: 8.4, maxScore: 100, change: +0.6, trend: 'improving', icon: 'water_drop', color: '#1D4ED8', description: 'Percentage of ocean area under effective marine protection with enforcement verification.' , lastUpdated: '2026-04-22' },
    { id: 'pui', name: 'Policy Urgency Index', score: 78, maxScore: 100, change: +3.2, trend: 'declining', icon: 'gavel', color: '#7C3AED', description: 'Weighted score of environmental policy gaps against scientific consensus on intervention urgency.' , lastUpdated: '2026-04-30' },
    { id: 'rri', name: 'Restoration ROI Index', score: 56, maxScore: 100, change: +1.8, trend: 'improving', icon: 'eco', color: '#059669', description: 'Expected biodiversity return per dollar invested across global restoration project categories.' , lastUpdated: '2026-04-18' },
  ]
}

export const TREND_LABELS: Record<string, string> = {
  improving: '↑ Improving',
  declining: '↓ Declining',
  stable: '→ Stable',
  critical: '⚠ Critical',
}
