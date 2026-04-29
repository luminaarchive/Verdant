import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const today = new Date().toISOString().split('T')[0]
  
  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!streak) return NextResponse.json({ error: 'Streak not found' }, { status: 404 })

  const lastDate = streak.last_activity_date
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  let newStreak = 1
  if (lastDate === yesterdayStr) {
    newStreak = streak.current_streak + 1
  } else if (lastDate === today) {
    return NextResponse.json({ streak: streak.current_streak })
  }

  const longestStreak = Math.max(newStreak, streak.longest_streak)

  await supabase.from('streaks').update({
    current_streak: newStreak,
    longest_streak: longestStreak,
    last_activity_date: today,
    total_days_active: streak.total_days_active + 1,
    updated_at: new Date().toISOString()
  }).eq('user_id', user.id)

  // Update tree health
  await supabase.from('virtual_trees').update({
    health: Math.min(100, newStreak * 10),
    growth_stage: Math.min(5, Math.floor(newStreak / 7) + 1),
    last_watered: new Date().toISOString()
  }).eq('user_id', user.id)

  return NextResponse.json({ streak: newStreak, longest: longestStreak })
}
