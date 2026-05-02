import { NextRequest, NextResponse } from 'next/server'

// ─── Tavily search queries per filter ───────────────────────────────────────
const FILTER_QUERIES: Record<string, string[]> = {
  Recommended: [
    'environmental science breakthrough 2025',
    'biodiversity conservation news 2025',
    'climate change ecology research 2025',
  ],
  Trending: [
    'trending environmental crisis news today',
    'deforestation wildfire ocean pollution breaking news',
    'IUCN endangered species update 2025',
  ],
  'New Papers': [
    'new ecology research paper published 2025',
    'biodiversity study journal nature science 2025',
    'climate oceanography new findings 2025',
  ],
  'By Region': [
    'Indonesia environmental news biodiversity 2025',
    'Southeast Asia conservation ecology news',
    'tropical rainforest species discovery Asia Pacific',
  ],
}

// ─── Category detection ─────────────────────────────────────────────────────
function detectCategory(title: string, content: string): string {
  const text = `${title} ${content}`.toLowerCase()
  if (/ocean|coral|marine|sea|reef/.test(text)) return 'Oceanography'
  if (/bird|mammal|species|wildlife|fauna|animal/.test(text)) return 'Biodiversity'
  if (/plant|flora|botany|tree|forest|vegetation/.test(text)) return 'Botany'
  if (/fungi|mushroom|mycol/.test(text)) return 'Mycology'
  if (/earthquake|tectonic|volcano|geol/.test(text)) return 'Geology'
  return 'Ecology'
}

const CATEGORY_COLORS: Record<string, string> = {
  Ecology: '#2E5D3E', Botany: '#4D7C0F', Oceanography: '#1D4ED8',
  Geology: '#92400E', Biodiversity: '#B45309', Mycology: '#7C3AED',
}

const LABEL_MAP: Record<string, { label: string; color: string }> = {
  Recommended: { label: "EDITOR'S PICK", color: '#B45309' },
  Trending: { label: 'TRENDING', color: '#6D28D9' },
  'New Papers': { label: 'NEW RESEARCH', color: '#2E5D3E' },
  'By Region': { label: 'REGIONAL', color: '#1D4ED8' },
}

// ─── In-memory cache ────────────────────────────────────────────────────────
const cache = new Map<string, { data: unknown; ts: number }>()
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

interface TavilyResult {
  title: string
  url: string
  content: string
  published_date?: string
  image_url?: string
  source?: string
}

export async function GET(request: NextRequest) {
  const filter = request.nextUrl.searchParams.get('filter') || 'Recommended'
  const force = request.nextUrl.searchParams.get('force') === 'true'

  const queries = FILTER_QUERIES[filter] || FILTER_QUERIES.Recommended
  const cacheKey = filter

  // Check cache
  if (!force) {
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }
  }

  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) {
    return NextResponse.json({ ok: false, articles: [], error: 'Tavily API key not configured' })
  }

  try {
    const allResults: TavilyResult[] = []

    for (const query of queries) {
      try {
        const res = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: apiKey,
            query,
            search_depth: 'basic',
            include_images: true,
            max_results: 4,
            topic: 'news',
          }),
          signal: AbortSignal.timeout(10_000),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.results) {
            allResults.push(...data.results.map((r: TavilyResult) => ({ ...r, _query: query })))
          }
        }
      } catch {
        // Skip individual query failures
      }
    }

    // Deduplicate by URL
    const seen = new Set<string>()
    const unique = allResults.filter(r => {
      if (seen.has(r.url)) return false
      seen.add(r.url)
      return true
    })

    const labelInfo = LABEL_MAP[filter] || LABEL_MAP.Recommended
    const articles = unique.slice(0, 9).map((r, i) => {
      const category = detectCategory(r.title, r.content)
      return {
        id: `${filter}-${i}`,
        label: labelInfo.label,
        labelColor: labelInfo.color,
        category,
        categoryColor: CATEGORY_COLORS[category] || '#2E5D3E',
        tag: filter,
        title: r.title,
        body: (r.content || '').slice(0, 160) + (r.content?.length > 160 ? '...' : ''),
        url: r.url,
        image: r.image_url || null,
        publishedAt: r.published_date || null,
        source: r.source || new URL(r.url).hostname.replace('www.', ''),
        query: r.title,
      }
    })

    const response = { ok: true, articles, filter, fetchedAt: new Date().toISOString() }
    cache.set(cacheKey, { data: response, ts: Date.now() })
    return NextResponse.json(response)
  } catch {
    return NextResponse.json({ ok: false, articles: [], error: 'Failed to fetch from Tavily' })
  }
}
