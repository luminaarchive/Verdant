export interface Profile {
  id: string
  email: string
  full_name: string | null
  subscription_tier: 'seeds' | 'sapling' | 'forest_keeper'
  research_count_this_month: number
  research_limit: number
  created_at: string
}

export interface ResearchRequest {
  id: string
  user_id: string
  topic: string
  research_type: string
  location: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
}

export interface ResearchResult {
  id: string
  request_id: string
  title: string
  summary: string
  full_content: string
  sources: Source[]
  created_at: string
}

export interface Source {
  title: string
  url: string
  author: string | null
  year: number | null
}

export interface Streak {
  user_id: string
  current_streak: number
  longest_streak: number
  last_activity_date: string
  total_days_active: number
}

export interface VirtualTree {
  id: string
  user_id: string
  name: string
  species: string
  health: number
  growth_stage: number
  total_virtual_trees: number
  real_trees_planted: number
  last_watered: string
}
