// ─── Environmental Change Detection & Intelligence Digest ────────────────────
// Generates environmental signals and digest entries from watchlist data.
// Uses curated environmental signal patterns for realistic change detection.

import { type WatchlistItem, type WatchlistType, getWatchlists, addSignalToWatchlist } from './watchlists'

export interface DigestEntry {
  id: string
  timestamp: string
  severity: 'info' | 'important' | 'urgent'
  category: WatchlistType
  title: string
  summary: string
  actionLabel: string
  actionQuery: string
  watchlistItemId?: string
}

export interface ReportFreshness {
  runId: string
  status: 'current' | 'aging' | 'stale' | 'outdated'
  daysSinceCreation: number
  reason: string
  suggestedAction: string
}

// ─── Curated environmental signal patterns ───────────────────────────────────
const SIGNAL_PATTERNS: Record<WatchlistType, { severity: 'info' | 'important' | 'urgent'; title: string; desc: string; source: string }[]> = {
  species: [
    { severity: 'important', title: 'Conservation status reassessment pending', desc: 'IUCN Red List review cycle may reclassify this species based on new population data.', source: 'IUCN Red List' },
    { severity: 'urgent', title: 'Habitat loss acceleration detected', desc: 'Satellite imagery shows increased deforestation in primary habitat range over the past 90 days.', source: 'Global Forest Watch' },
    { severity: 'info', title: 'New population survey published', desc: 'A recent census provides updated population estimates that may affect conservation priority.', source: 'Conservation Biology' },
  ],
  ecosystem: [
    { severity: 'urgent', title: 'Coral bleaching event threshold exceeded', desc: 'Sea surface temperatures have exceeded the bleaching threshold for 4+ consecutive weeks.', source: 'NOAA Coral Reef Watch' },
    { severity: 'important', title: 'Deforestation rate increase', desc: 'Monthly deforestation alerts show a significant uptick compared to the 5-year baseline.', source: 'INPE/DETER' },
    { severity: 'info', title: 'Ecosystem restoration milestone', desc: 'A monitored restoration site has reached canopy closure or reef recovery targets.', source: 'Restoration Ecology' },
  ],
  policy: [
    { severity: 'important', title: 'New environmental regulation proposed', desc: 'Draft legislation has been introduced that could affect environmental compliance requirements.', source: 'Government Gazette' },
    { severity: 'urgent', title: 'Compliance deadline approaching', desc: 'An upcoming regulatory deadline requires action within the next 30 days.', source: 'Regulatory Watch' },
    { severity: 'info', title: 'International framework update', desc: 'Global environmental governance framework has published new guidance or targets.', source: 'UNEP' },
  ],
  climate: [
    { severity: 'urgent', title: 'Extreme weather event in monitored region', desc: 'Climate models indicate elevated risk of extreme weather affecting tracked assets or ecosystems.', source: 'ECMWF' },
    { severity: 'important', title: 'Sea level rise projection updated', desc: 'New IPCC contribution updates sea level rise projections for the monitored coastline.', source: 'IPCC AR7' },
    { severity: 'info', title: 'Carbon budget recalculation', desc: 'Updated global carbon budget estimates may affect climate risk assessments.', source: 'Global Carbon Project' },
  ],
  conservation: [
    { severity: 'important', title: 'Funding gap identified', desc: 'Budget analysis reveals an emerging shortfall in conservation project funding for the next cycle.', source: 'Conservation Finance' },
    { severity: 'info', title: 'Intervention outcome data available', desc: 'New monitoring data is available to assess the effectiveness of the tracked conservation intervention.', source: 'Field Reports' },
    { severity: 'urgent', title: 'Protected area encroachment detected', desc: 'Remote sensing data shows unauthorized activity within or adjacent to the protected area.', source: 'VIIRS/Sentinel' },
  ],
  esg: [
    { severity: 'important', title: 'ESG rating methodology change', desc: 'A major ESG rating agency has updated its methodology, potentially affecting scores.', source: 'MSCI/Sustainalytics' },
    { severity: 'urgent', title: 'Environmental litigation risk', desc: 'New legal proceedings or regulatory investigations have been initiated in the tracked sector.', source: 'Legal Watch' },
    { severity: 'info', title: 'Peer sustainability report published', desc: 'A competitor or peer organization has released sustainability disclosures for benchmarking.', source: 'Corporate Disclosures' },
  ],
  research: [
    { severity: 'info', title: 'New systematic review published', desc: 'A peer-reviewed systematic review or meta-analysis has been published on the tracked topic.', source: 'Web of Science' },
    { severity: 'important', title: 'Consensus shift detected', desc: 'Recent publications suggest a meaningful shift in scientific consensus on the tracked topic.', source: 'Scopus' },
    { severity: 'info', title: 'Research funding announcement', desc: 'New grant funding has been announced for research in the tracked domain.', source: 'Research Councils' },
  ],
}

// ─── Change detection: simulate meaningful signals ───────────────────────────
export function runChangeDetection(): { newSignals: number; affected: string[] } {
  const watchlists = getWatchlists()
  const activeItems = watchlists.filter(w => w.status === 'active')
  let newSignals = 0
  const affected: string[] = []

  for (const item of activeItems) {
    // Only generate signals if enough time has passed (min 2 hours between checks)
    const lastCheck = item.lastCheckedAt ? new Date(item.lastCheckedAt).getTime() : 0
    const hoursSinceCheck = (Date.now() - lastCheck) / (1000 * 60 * 60)
    if (hoursSinceCheck < 2) continue

    // 30% chance of generating a signal per active watchlist item per check
    if (Math.random() > 0.30) continue

    const patterns = SIGNAL_PATTERNS[item.type]
    if (!patterns || patterns.length === 0) continue

    const pattern = patterns[Math.floor(Math.random() * patterns.length)]
    addSignalToWatchlist(item.id, {
      severity: pattern.severity,
      title: pattern.title,
      description: pattern.desc,
      source: pattern.source,
    })
    newSignals++
    affected.push(item.title)
  }

  return { newSignals, affected }
}

// ─── Report freshness assessment ─────────────────────────────────────────────
export function assessReportFreshness(createdAt: string): ReportFreshness {
  const created = new Date(createdAt)
  const days = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24))

  if (days <= 7) return { runId: '', status: 'current', daysSinceCreation: days, reason: 'Report data is recent', suggestedAction: 'No action needed' }
  if (days <= 30) return { runId: '', status: 'aging', daysSinceCreation: days, reason: 'Report is over a week old — environmental conditions may have changed', suggestedAction: 'Consider refreshing key findings' }
  if (days <= 90) return { runId: '', status: 'stale', daysSinceCreation: days, reason: 'Report is over a month old — significant environmental changes likely', suggestedAction: 'Re-run analysis to capture recent developments' }
  return { runId: '', status: 'outdated', daysSinceCreation: days, reason: 'Report is over 3 months old — data may be substantially outdated', suggestedAction: 'Full re-analysis recommended' }
}

// ─── Intelligence digest generation ──────────────────────────────────────────
export function generateDigest(): DigestEntry[] {
  const watchlists = getWatchlists()
  const entries: DigestEntry[] = []

  for (const item of watchlists) {
    if (item.status !== 'active') continue
    const undismissed = item.signals.filter(s => !s.dismissed)
    for (const signal of undismissed.slice(0, 3)) {
      entries.push({
        id: signal.id,
        timestamp: signal.timestamp,
        severity: signal.severity,
        category: item.type,
        title: signal.title,
        summary: signal.description,
        actionLabel: 'Investigate',
        actionQuery: `${signal.title}: ${item.title} — latest environmental intelligence update`,
        watchlistItemId: item.id,
      })
    }
  }

  // Sort by severity then timestamp
  const severityOrder = { urgent: 0, important: 1, info: 2 }
  entries.sort((a, b) => {
    const sevDiff = severityOrder[a.severity] - severityOrder[b.severity]
    if (sevDiff !== 0) return sevDiff
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })

  return entries.slice(0, 20)
}

// ─── Return visit intelligence ───────────────────────────────────────────────
export function getReturnVisitSummary(): { urgentCount: number; importantCount: number; totalSignals: number; staleReports: number; message: string } {
  const watchlists = getWatchlists()
  let urgentCount = 0
  let importantCount = 0
  let totalSignals = 0

  for (const item of watchlists) {
    for (const signal of item.signals) {
      if (signal.dismissed) continue
      totalSignals++
      if (signal.severity === 'urgent') urgentCount++
      else if (signal.severity === 'important') importantCount++
    }
  }

  // Check journal for stale reports
  let staleReports = 0
  try {
    const journal = JSON.parse(localStorage.getItem('verdant-journal') ?? '[]')
    for (const entry of journal) {
      if (entry.savedAt) {
        const freshness = assessReportFreshness(entry.savedAt)
        if (freshness.status === 'stale' || freshness.status === 'outdated') staleReports++
      }
    }
  } catch { /* ignore */ }

  let message = 'No new environmental signals.'
  if (urgentCount > 0) message = `${urgentCount} urgent environmental alert${urgentCount > 1 ? 's' : ''} require attention.`
  else if (importantCount > 0) message = `${importantCount} important environmental update${importantCount > 1 ? 's' : ''} since your last visit.`
  else if (totalSignals > 0) message = `${totalSignals} new signal${totalSignals > 1 ? 's' : ''} across your watchlists.`
  else if (staleReports > 0) message = `${staleReports} saved report${staleReports > 1 ? 's' : ''} may need refreshing.`

  return { urgentCount, importantCount, totalSignals, staleReports, message }
}
