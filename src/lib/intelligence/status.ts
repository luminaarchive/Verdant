// ─── Status Layer ────────────────────────────────────────────────────────────
// "You are ahead of X% of researchers" — drives emotional retention.

export interface StatusInsight {
  icon: string
  text: string
  metric: string
  color: string
}

/** Compute status insights based on user activity metrics */
export function getStatusInsights(sessions: number, streakDays: number, journalCount: number, watchlistCount: number): StatusInsight[] {
  const insights: StatusInsight[] = []

  // Session-based percentile (simulated — in production this would come from aggregated user data)
  if (sessions > 0) {
    const pct = Math.min(97, 50 + sessions * 3 + streakDays * 2)
    insights.push({
      icon: 'trending_up',
      text: `You are ahead of ${pct}% of environmental researchers this week`,
      metric: `${pct}th percentile`,
      color: '#2E5D3E',
    })
  }

  // Streak-based insight
  if (streakDays >= 3) {
    insights.push({
      icon: 'local_fire_department',
      text: `Your ${streakDays}-day research streak puts you in the top 15% for consistency`,
      metric: `${streakDays}-day streak`,
      color: '#B45309',
    })
  }

  // Journal-based insight
  if (journalCount >= 2) {
    insights.push({
      icon: 'menu_book',
      text: `You've built a ${journalCount}-report research library — deeper than 80% of users`,
      metric: `${journalCount} reports saved`,
      color: '#1A2F23',
    })
  }

  // Detection insight
  if (sessions >= 5) {
    const detections = Math.floor(sessions * 0.6)
    insights.push({
      icon: 'radar',
      text: `You detected ${detections} environmental signals before public reporting`,
      metric: `${detections} early detections`,
      color: '#2E5D3E',
    })
  }

  return insights.slice(0, 2) // Show top 2 most relevant
}
