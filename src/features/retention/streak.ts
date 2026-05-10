// ─── Streak Client (localStorage-based) ─────────────────────────────────────

const STORAGE_KEY = 'verdant-streak'

interface StreakData {
  days: number
  lastDate: string | null
  stage: string
}

interface StreakInfo {
  days: number
  lastDate: string | null
  stage: string
  progress: number
  daysToNext: number
}

const STAGES = [
  { name: 'Seedling',    min: 0,  max: 2  },
  { name: 'Sapling',     min: 3,  max: 7  },
  { name: 'Young Tree',  min: 8,  max: 30 },
  { name: 'Mature',      min: 31, max: 90 },
  { name: 'Legendary',   min: 91, max: Infinity },
]

function getStageForDays(days: number): { name: string; progress: number; daysToNext: number } {
  for (let i = 0; i < STAGES.length; i++) {
    const s = STAGES[i]
    if (days >= s.min && days <= s.max) {
      const range = s.max === Infinity ? 1 : (s.max - s.min + 1)
      const progress = s.max === Infinity ? 100 : Math.min(100, ((days - s.min) / range) * 100)
      const daysToNext = s.max === Infinity ? 0 : (s.max - days + 1)
      return { name: s.name, progress, daysToNext }
    }
  }
  return { name: 'Seedling', progress: 0, daysToNext: 3 }
}

function readStreak(): StreakData {
  if (typeof window === 'undefined') return { days: 0, lastDate: null, stage: 'Seedling' }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { days: 0, lastDate: null, stage: 'Seedling' }
    return JSON.parse(raw) as StreakData
  } catch {
    return { days: 0, lastDate: null, stage: 'Seedling' }
  }
}

function writeStreak(data: StreakData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getStreak(): StreakInfo {
  const data = readStreak()
  const info = getStageForDays(data.days)
  return {
    days: data.days,
    lastDate: data.lastDate,
    stage: info.name,
    progress: info.progress,
    daysToNext: info.daysToNext,
  }
}

export function recordActivity(): void {
  if (typeof window === 'undefined') return

  const data = readStreak()
  const today = new Date().toISOString().split('T')[0]

  if (data.lastDate === today) return // Already recorded today

  let newDays: number
  if (data.lastDate) {
    const last = new Date(data.lastDate)
    const now = new Date(today)
    const diffMs = now.getTime() - last.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      newDays = data.days + 1 // Consecutive day
    } else {
      newDays = 1 // Streak broken — reset
    }
  } else {
    newDays = 1 // First activity
  }

  const info = getStageForDays(newDays)
  writeStreak({ days: newDays, lastDate: today, stage: info.name })
}
