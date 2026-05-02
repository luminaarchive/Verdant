// ─── Environmental Memory Engine ────────────────────────────────────────────
// Tracks user research patterns, detects recurring themes, surfaces related prior work.
// Uses localStorage for persistence — zero-dependency, client-side only.

export interface ResearchMemory {
  topics: TopicCluster[]
  recentQueries: string[]
  specialization: string | null
  lastUpdated: string
}

export interface TopicCluster {
  topic: string
  count: number
  lastResearched: string
  relatedQueries: string[]
}

const STORAGE_KEY = 'verdant-research-memory'

const TOPIC_PATTERNS: [RegExp, string][] = [
  [/coral|reef|bleach/i, 'Coral Reef Ecology'],
  [/ocean|marine|sea|fisheries|coastal/i, 'Marine Science'],
  [/forest|deforest|timber|logging|canopy/i, 'Forest Ecology'],
  [/species|extinct|endangered|iucn|red list/i, 'Species Conservation'],
  [/climate|warming|temperature|carbon|emission/i, 'Climate Science'],
  [/biodiversity|ecosystem|habitat/i, 'Biodiversity'],
  [/peat|wetland|mangrove|swamp/i, 'Wetland Ecology'],
  [/bird|avian|ornithol/i, 'Ornithology'],
  [/insect|pollinator|entomol/i, 'Entomology'],
  [/fung|mycor|mushroom/i, 'Mycology'],
  [/plant|flora|botany|vegetation/i, 'Botany'],
  [/geol|tectonic|volcano|seismic/i, 'Geology'],
  [/policy|regulation|law|governance/i, 'Environmental Policy'],
  [/grant|fund|donor|ngo/i, 'Conservation Funding'],
  [/restor|rewild|rehabilit/i, 'Ecosystem Restoration'],
  [/indonesia|borneo|sumatra|java|kalimantan|sulawesi|papua/i, 'Indonesian Environment'],
  [/amazon|brazil|congo|africa/i, 'Tropical Ecosystems'],
  [/esg|sustain|corporate/i, 'ESG & Sustainability'],
]

function detectTopics(query: string): string[] {
  const matches: string[] = []
  for (const [pattern, topic] of TOPIC_PATTERNS) {
    if (pattern.test(query)) matches.push(topic)
  }
  return matches.length > 0 ? matches : ['General Environmental Research']
}

function inferSpecialization(clusters: TopicCluster[]): string | null {
  if (clusters.length === 0) return null
  const sorted = [...clusters].sort((a, b) => b.count - a.count)
  if (sorted[0].count >= 3) return sorted[0].topic
  return null
}

export function getMemory(): ResearchMemory {
  if (typeof window === 'undefined') return { topics: [], recentQueries: [], specialization: null, lastUpdated: '' }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return { topics: [], recentQueries: [], specialization: null, lastUpdated: '' }
}

export function recordQuery(query: string): void {
  if (typeof window === 'undefined') return
  const memory = getMemory()
  const topics = detectTopics(query)

  // Update recent queries (keep last 20)
  memory.recentQueries = [query, ...memory.recentQueries.filter(q => q !== query)].slice(0, 20)

  // Update topic clusters
  for (const topic of topics) {
    const existing = memory.topics.find(t => t.topic === topic)
    if (existing) {
      existing.count++
      existing.lastResearched = new Date().toISOString()
      existing.relatedQueries = [query, ...existing.relatedQueries.filter(q => q !== query)].slice(0, 5)
    } else {
      memory.topics.push({ topic, count: 1, lastResearched: new Date().toISOString(), relatedQueries: [query] })
    }
  }

  memory.specialization = inferSpecialization(memory.topics)
  memory.lastUpdated = new Date().toISOString()

  localStorage.setItem(STORAGE_KEY, JSON.stringify(memory))
}

export function getRelatedPriorWork(query: string): { topic: string; priorQueries: string[] }[] {
  const memory = getMemory()
  const topics = detectTopics(query)
  const related: { topic: string; priorQueries: string[] }[] = []

  for (const topic of topics) {
    const cluster = memory.topics.find(t => t.topic === topic)
    if (cluster && cluster.count > 0) {
      const priorQueries = cluster.relatedQueries.filter(q => q.toLowerCase() !== query.toLowerCase())
      if (priorQueries.length > 0) {
        related.push({ topic: cluster.topic, priorQueries: priorQueries.slice(0, 3) })
      }
    }
  }

  return related
}

export function getTopSpecializations(limit = 5): TopicCluster[] {
  const memory = getMemory()
  return [...memory.topics].sort((a, b) => b.count - a.count).slice(0, limit)
}
