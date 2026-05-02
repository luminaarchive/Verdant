// ─── Source Reliability Ranking ──────────────────────────────────────────────
// Assigns reliability tiers to sources for institutional trust.

export type ReliabilityTier = 'A+' | 'A' | 'B+' | 'B' | 'B-' | 'C'

export interface SourceReliability {
  tier: ReliabilityTier
  label: string
  color: string
  bgColor: string
}

const TIER_MAP: Record<ReliabilityTier, { label: string; color: string; bgColor: string }> = {
  'A+': { label: 'Gold Standard', color: '#059669', bgColor: 'rgba(5,150,105,0.08)' },
  'A':  { label: 'Highly Reliable', color: '#2E5D3E', bgColor: 'rgba(46,93,62,0.08)' },
  'B+': { label: 'Reliable', color: '#1D4ED8', bgColor: 'rgba(29,78,216,0.06)' },
  'B':  { label: 'Moderate', color: '#B45309', bgColor: 'rgba(180,83,9,0.06)' },
  'B-': { label: 'Limited', color: '#92400E', bgColor: 'rgba(146,64,14,0.06)' },
  'C':  { label: 'Unverified', color: '#C0392B', bgColor: 'rgba(192,57,43,0.06)' },
}

// Known source patterns and their reliability tiers
const SOURCE_PATTERNS: { pattern: RegExp; tier: ReliabilityTier }[] = [
  // A+ — peer-reviewed journals and premier institutions
  { pattern: /nature\b/i, tier: 'A+' },
  { pattern: /science\b/i, tier: 'A+' },
  { pattern: /pnas/i, tier: 'A+' },
  { pattern: /lancet/i, tier: 'A+' },
  { pattern: /cell\b/i, tier: 'A+' },
  { pattern: /ipcc/i, tier: 'A+' },
  { pattern: /iucn/i, tier: 'A+' },
  { pattern: /conservation biology/i, tier: 'A+' },
  { pattern: /ecology letters/i, tier: 'A+' },

  // A — government agencies and major scientific bodies
  { pattern: /noaa/i, tier: 'A' },
  { pattern: /nasa/i, tier: 'A' },
  { pattern: /esa\b/i, tier: 'A' },
  { pattern: /usgs/i, tier: 'A' },
  { pattern: /copernicus/i, tier: 'A' },
  { pattern: /who\b/i, tier: 'A' },
  { pattern: /unep/i, tier: 'A' },
  { pattern: /world bank/i, tier: 'A' },
  { pattern: /fao\b/i, tier: 'A' },
  { pattern: /global forest watch/i, tier: 'A' },
  { pattern: /annual review/i, tier: 'A' },

  // B+ — university research and well-known research institutes
  { pattern: /university|stanford|oxford|cambridge|mit|harvard/i, tier: 'B+' },
  { pattern: /kew garden/i, tier: 'B+' },
  { pattern: /smithsonian/i, tier: 'B+' },
  { pattern: /woods hole/i, tier: 'B+' },

  // B — NGO reports and reliable news
  { pattern: /wwf|world wildlife/i, tier: 'B' },
  { pattern: /greenpeace/i, tier: 'B' },
  { pattern: /mongabay/i, tier: 'B' },
  { pattern: /reuters|bbc|guardian/i, tier: 'B' },
  { pattern: /conservation international/i, tier: 'B' },

  // B- — government documents and regional sources
  { pattern: /government|ministry|department/i, tier: 'B-' },
  { pattern: /klhk|lipi|brin/i, tier: 'B-' },

  // C — everything else
  { pattern: /blog|opinion|editorial/i, tier: 'C' },
]

export function getSourceReliability(sourceTitle: string, sourceUrl?: string): SourceReliability {
  const fullText = `${sourceTitle} ${sourceUrl || ''}`
  
  for (const { pattern, tier } of SOURCE_PATTERNS) {
    if (pattern.test(fullText)) {
      return { tier, ...TIER_MAP[tier] }
    }
  }
  
  // Default to B- for unknown sources
  return { tier: 'B-', ...TIER_MAP['B-'] }
}

export function getTierInfo(tier: ReliabilityTier) {
  return TIER_MAP[tier]
}
