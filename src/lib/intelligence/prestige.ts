// ─── Prestige Unlock System ─────────────────────────────────────────────────
// Computes a prestige title based on user activity. Identity > features.

export interface PrestigeLevel {
  id: string
  title: string
  icon: string
  minSessions: number
  minStreak: number
  description: string
}

export const PRESTIGE_LEVELS: PrestigeLevel[] = [
  { id: 'observer',           title: 'Observer',                   icon: 'visibility',        minSessions: 0,   minStreak: 0,  description: 'Beginning your environmental intelligence journey' },
  { id: 'sentinel',           title: 'Species Sentinel',           icon: 'pets',              minSessions: 3,   minStreak: 2,  description: 'Actively tracking species and biodiversity signals' },
  { id: 'analyst',            title: 'Climate Analyst',            icon: 'thermostat',        minSessions: 8,   minStreak: 5,  description: 'Consistently analyzing climate and environmental data' },
  { id: 'strategist',         title: 'Biodiversity Strategist',    icon: 'hub',               minSessions: 15,  minStreak: 7,  description: 'Developing strategic insights across ecosystems' },
  { id: 'guardian',           title: 'Policy Guardian',            icon: 'shield',            minSessions: 25,  minStreak: 14, description: 'Monitoring policy frameworks and regulatory impacts' },
  { id: 'architect',          title: 'Ecosystem Architect',        icon: 'architecture',      minSessions: 40,  minStreak: 21, description: 'Designing holistic environmental intervention strategies' },
  { id: 'fellow',             title: 'Earth Intelligence Fellow',  icon: 'military_tech',     minSessions: 60,  minStreak: 30, description: 'Elite-tier environmental intelligence authority' },
]

export function getPrestigeLevel(sessions: number, streakDays: number): PrestigeLevel {
  let current = PRESTIGE_LEVELS[0]
  for (const level of PRESTIGE_LEVELS) {
    if (sessions >= level.minSessions && streakDays >= level.minStreak) {
      current = level
    }
  }
  return current
}

export function getNextPrestigeLevel(sessions: number, streakDays: number): PrestigeLevel | null {
  const current = getPrestigeLevel(sessions, streakDays)
  const idx = PRESTIGE_LEVELS.indexOf(current)
  if (idx >= PRESTIGE_LEVELS.length - 1) return null
  return PRESTIGE_LEVELS[idx + 1]
}

export function getPrestigeProgress(sessions: number, streakDays: number): number {
  const current = getPrestigeLevel(sessions, streakDays)
  const next = getNextPrestigeLevel(sessions, streakDays)
  if (!next) return 100

  const sessionProgress = Math.min(100, ((sessions - current.minSessions) / (next.minSessions - current.minSessions)) * 100)
  const streakProgress = Math.min(100, ((streakDays - current.minStreak) / (next.minStreak - current.minStreak)) * 100)
  return Math.floor((sessionProgress + streakProgress) / 2)
}
