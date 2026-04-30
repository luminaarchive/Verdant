// ─── Environmental Watchlist System ──────────────────────────────────────────
// Client-side watchlist management with localStorage persistence.
// Architecture-ready for Supabase migration when auth is active.

export type WatchlistType = 'species' | 'ecosystem' | 'policy' | 'climate' | 'conservation' | 'esg' | 'research'

export interface WatchlistItem {
  id: string
  type: WatchlistType
  title: string
  description: string
  query: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'paused' | 'resolved'
  addedAt: string
  lastCheckedAt?: string
  lastReportRunId?: string
  signals: WatchlistSignal[]
}

export interface WatchlistSignal {
  id: string
  timestamp: string
  severity: 'info' | 'important' | 'urgent'
  title: string
  description: string
  source: string
  dismissed: boolean
}

export const WATCHLIST_TYPES: { id: WatchlistType; label: string; icon: string; description: string }[] = [
  { id: 'species', label: 'Species', icon: 'pest_control', description: 'Track extinction risk, habitat threats, conservation status' },
  { id: 'ecosystem', label: 'Ecosystem', icon: 'forest', description: 'Monitor reef health, forest loss, biodiversity pressure' },
  { id: 'policy', label: 'Policy', icon: 'gavel', description: 'Track regulation changes, environmental policy updates' },
  { id: 'climate', label: 'Climate Risk', icon: 'thermostat', description: 'Monitor climate hazards, resilience, exposure shifts' },
  { id: 'conservation', label: 'Conservation', icon: 'park', description: 'Track intervention progress, funding, priority updates' },
  { id: 'esg', label: 'ESG / Sustainability', icon: 'shield', description: 'Track liability, sustainability risk, compliance exposure' },
  { id: 'research', label: 'Research Topic', icon: 'menu_book', description: 'Track new literature, consensus shifts, evidence gaps' },
]

const STORAGE_KEY = 'verdant-watchlists'

export function getWatchlists(): WatchlistItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch { return [] }
}

export function saveWatchlists(items: WatchlistItem[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function addWatchlistItem(item: Omit<WatchlistItem, 'id' | 'addedAt' | 'signals' | 'status'>): WatchlistItem {
  const items = getWatchlists()
  const newItem: WatchlistItem = {
    ...item,
    id: `wl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    addedAt: new Date().toISOString(),
    status: 'active',
    signals: [],
  }
  items.unshift(newItem)
  saveWatchlists(items)
  return newItem
}

export function removeWatchlistItem(id: string): void {
  const items = getWatchlists().filter(i => i.id !== id)
  saveWatchlists(items)
}

export function updateWatchlistItem(id: string, updates: Partial<WatchlistItem>): void {
  const items = getWatchlists()
  const idx = items.findIndex(i => i.id === id)
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...updates }
    saveWatchlists(items)
  }
}

export function addSignalToWatchlist(watchlistId: string, signal: Omit<WatchlistSignal, 'id' | 'timestamp' | 'dismissed'>): void {
  const items = getWatchlists()
  const idx = items.findIndex(i => i.id === watchlistId)
  if (idx !== -1) {
    items[idx].signals.unshift({
      ...signal,
      id: `sig_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      dismissed: false,
    })
    // Keep max 20 signals per item
    items[idx].signals = items[idx].signals.slice(0, 20)
    saveWatchlists(items)
  }
}

export function dismissSignal(watchlistId: string, signalId: string): void {
  const items = getWatchlists()
  const idx = items.findIndex(i => i.id === watchlistId)
  if (idx !== -1) {
    const sigIdx = items[idx].signals.findIndex(s => s.id === signalId)
    if (sigIdx !== -1) {
      items[idx].signals[sigIdx].dismissed = true
      saveWatchlists(items)
    }
  }
}

export function getActiveSignalCount(): number {
  return getWatchlists().reduce((count, item) =>
    count + item.signals.filter(s => !s.dismissed).length, 0
  )
}

export function getUrgentItems(): WatchlistItem[] {
  return getWatchlists().filter(i =>
    i.status === 'active' && (
      i.priority === 'critical' ||
      i.signals.some(s => s.severity === 'urgent' && !s.dismissed)
    )
  )
}
