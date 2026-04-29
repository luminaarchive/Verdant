import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await Client()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { topic, research_type, location } = await request.json()

  // Check research limit
  const { data: profile } = await supabase
    .from('profiles')
    .select('research_count_this_month, research_limit')
    .eq('id', user.id)
    .single()

  if (profile && profile.research_count_this_month >= profile.research_limit) {
    return NextResponse.json({ error: 'Research limit reached' }, { status: 429 })
  }

  // Create research request
  const { data: researchRequest } = await supabase
    .from('research_requests')
    .insert({ user_id: user.id, topic, research_type, location, status: 'processing' })
    .select()
    .single()

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL!,
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4-5',
        messages: [{
          role: 'user',
          content: `Kamu adalah Verdant AI, asisten riset lingkungan hidup untuk Indonesia dan dunia.
          
Buat laporan riset komprehensif tentang: "${topic}"
Kategori: ${research_type}
${location ? `Lokasi fokus: ${location}` : ''}

Format laporan dalam JSON dengan struktur:
{
  "title": "judul laporan",
  "summary": "ringkasan eksekutif 2-3 paragraf",
  "full_content": "laporan lengkap dengan section: Pendahuluan, Temuan Utama, Data & Statistik, Dampak Lingkungan, Rekomendasi",
  "sources": [{"title": "", "url": "", "author": "", "year": 0}]
}

Gunakan data dari: GBIF, IUCN Red List, NOAA, FAO, KLHK, arXiv, PubMed.
Bahasa Indonesia. Fakta-based, akademis.`
        }]
      })
    })

    const data = await response.json()
    const content = data.choices[0].message.content
    const clean = content.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    // Save result
    await supabase.from('research_results').insert({
      request_id: researchRequest.id,
      user_id: user.id,
      ...result
    })

    // Update request status
    await supabase.from('research_requests')
      .update({ status: 'completed' })
      .eq('id', researchRequest.id)

    // Increment research count
    await supabase.from('profiles')
      .update({ research_count_this_month: (profile?.research_count_this_month || 0) + 1 })
      .eq('id', user.id)

    // Log activity for streak
    await supabase.from('daily_activities')
      .insert({ user_id: user.id, activity_type: 'research' })

    return NextResponse.json({ success: true, request_id: researchRequest.id })

  } catch (error) {
    await supabase.from('research_requests')
      .update({ status: 'failed' })
      .eq('id', researchRequest.id)
    
    return NextResponse.json({ error: 'Research failed' }, { status: 500 })
  }
}
