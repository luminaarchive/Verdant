import { createClient } from '@/services/supabase/client'

export async function recalculateReputation(userId: string) {
  const sb = createClient()
  
  // Get base user metrics
  const { data: profile } = await sb.from('user_profiles').select('research_count, streak_days').eq('id', userId).single()
  const { data: pubProfile } = await sb.from('public_profiles').select('verified_status').eq('user_id', userId).single()
  
  let score = 10 // Base score
  
  if (profile) {
    score += profile.research_count * 2
    score += profile.streak_days * 5
  }
  
  if (pubProfile && pubProfile.verified_status === 'approved') {
    score += 25 // Verification bonus
  }
  
  // Track other activities like exports
  const exportsCount = typeof window !== 'undefined' ? parseInt(localStorage.getItem('verdant-exports-count') ?? '0', 10) : 0
  score += exportsCount * 3
  
  // Determine rank based on score
  let rank = 'Observer'
  if (score >= 200) rank = 'Authority'
  else if (score >= 100) rank = 'Senior Analyst'
  else if (score >= 50) rank = 'Analyst'
  else if (score >= 25) rank = 'Contributor'
  
  // Update the score in DB
  await sb.from('user_reputation_scores').upsert({
    user_id: userId,
    score,
    rank,
    last_calculated_at: new Date().toISOString()
  })
  
  return { score, rank }
}
