import { createClient } from '@/lib/supabase/client'

export interface ReputationScore {
  score: number
  rank: string
  last_calculated_at: string
}

export async function getUserReputation(userId: string): Promise<ReputationScore> {
  const sb = createClient()
  const { data } = await sb
    .from('user_reputation_scores')
    .select('*')
    .eq('user_id', userId)
    .single()
    
  if (data) {
    return {
      score: data.score,
      rank: data.rank,
      last_calculated_at: data.last_calculated_at
    }
  }
  
  return {
    score: 10,
    rank: 'Observer',
    last_calculated_at: new Date().toISOString()
  }
}
