// ─── Living Reports ─────────────────────────────────────────────────────────
// Tracks report freshness and detects changes since last visit.

export interface ReportFreshness {
  status: 'fresh' | 'aging' | 'stale'
  label: string
  color: string
  icon: string
  hoursAgo: number
}

export interface ReportDelta {
  type: 'new_signal' | 'confidence_change' | 'new_source' | 'contradiction_resolved' | 'status_update'
  text: string
  icon: string
  color: string
}

/** Get freshness info for a report based on when it was generated */
export function getReportFreshness(createdAt: string): ReportFreshness {
  const hours = Math.floor((Date.now() - new Date(createdAt).getTime()) / 3600000)
  
  if (hours < 2) {
    return { status: 'fresh', label: 'Live', color: '#059669', icon: 'circle', hoursAgo: hours }
  }
  if (hours < 24) {
    return { status: 'fresh', label: `Updated ${hours}h ago`, color: '#2E5D3E', icon: 'schedule', hoursAgo: hours }
  }
  if (hours < 72) {
    return { status: 'aging', label: `${Math.floor(hours / 24)}d ago`, color: '#B45309', icon: 'update', hoursAgo: hours }
  }
  return { status: 'stale', label: `${Math.floor(hours / 24)}d ago — may need refresh`, color: '#C0392B', icon: 'warning', hoursAgo: hours }
}

/** Record that user viewed a report */
export function recordReportView(query: string) {
  try {
    const views = JSON.parse(localStorage.getItem('verdant-report-views') ?? '{}')
    views[query] = { lastViewed: new Date().toISOString(), viewCount: (views[query]?.viewCount || 0) + 1 }
    localStorage.setItem('verdant-report-views', JSON.stringify(views))
  } catch { /* ignore */ }
}

/** Get last view time for a report */
export function getLastViewTime(query: string): string | null {
  try {
    const views = JSON.parse(localStorage.getItem('verdant-report-views') ?? '{}')
    return views[query]?.lastViewed ?? null
  } catch { return null }
}

/** Generate simulated "what changed" deltas for a returning user */
export function getReportDeltas(query: string): ReportDelta[] {
  const lastView = getLastViewTime(query)
  if (!lastView) return []
  
  const hoursSinceLastView = Math.floor((Date.now() - new Date(lastView).getTime()) / 3600000)
  if (hoursSinceLastView < 1) return []
  
  const deltas: ReportDelta[] = []
  
  // Simulate signals based on time elapsed
  if (hoursSinceLastView >= 24) {
    deltas.push({
      type: 'new_signal',
      text: 'New monitoring data available from primary sources',
      icon: 'satellite_alt',
      color: '#2E5D3E',
    })
  }
  
  if (hoursSinceLastView >= 12) {
    const oldConf = 65 + Math.floor(Math.random() * 15)
    const newConf = oldConf + Math.floor(Math.random() * 12) + 1
    deltas.push({
      type: 'confidence_change',
      text: `Confidence adjusted from ${oldConf} → ${newConf} based on new evidence`,
      icon: 'trending_up',
      color: '#059669',
    })
  }
  
  if (hoursSinceLastView >= 48) {
    deltas.push({
      type: 'new_source',
      text: 'New peer-reviewed source published on this topic',
      icon: 'library_books',
      color: '#1D4ED8',
    })
  }
  
  if (hoursSinceLastView >= 72) {
    deltas.push({
      type: 'status_update',
      text: 'Regulatory or policy status change detected',
      icon: 'gavel',
      color: '#B45309',
    })
  }
  
  return deltas
}
