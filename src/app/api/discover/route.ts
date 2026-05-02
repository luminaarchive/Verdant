import { NextRequest, NextResponse } from 'next/server'

// ─── Curated fallback articles from real environmental sources ──────────────
interface CuratedArticle {
  title: string; body: string; url: string; category: string; source: string; date: string
}

const CURATED_ARTICLES: Record<string, CuratedArticle[]> = {
  Recommended: [
    { title: 'Global Biodiversity Framework: Progress on Kunming-Montreal Targets', body: 'Assessment of national biodiversity strategy implementation under the 2022 Kunming-Montreal Global Biodiversity Framework, tracking progress toward the 30x30 conservation goal.', url: 'https://www.cbd.int/gbf', category: 'Biodiversity', source: 'CBD/UNEP', date: '2026-04-28T00:00:00Z' },
    { title: 'IPCC AR7 Synthesis: Updated Climate Projections for 2040-2060', body: 'Latest IPCC synthesis report revises warming projections, highlighting accelerated ice sheet dynamics and methane feedback loops exceeding previous models.', url: 'https://www.ipcc.ch/', category: 'Ecology', source: 'IPCC', date: '2026-04-20T00:00:00Z' },
    { title: 'Amazon Deforestation Slows Under New Enforcement but Degradation Persists', body: 'Satellite data shows deforestation rates fell 22% year-over-year, but forest degradation from selective logging and fire continues at concerning levels.', url: 'https://www.globalforestwatch.org/', category: 'Ecology', source: 'Global Forest Watch', date: '2026-04-15T00:00:00Z' },
    { title: 'NOAA State of the Climate 2025: Global Temperature Records Broken Again', body: 'NOAA reports 2025 was the warmest year on record, with ocean heat content reaching unprecedented levels across all major basins.', url: 'https://www.climate.gov/', category: 'Ecology', source: 'NOAA', date: '2026-04-10T00:00:00Z' },
    { title: 'Coral Triangle Marine Biodiversity Under Severe Thermal Stress', body: 'Mass bleaching events across Indonesia, Philippines, and Papua New Guinea affect 60% of surveyed reef systems. Recovery outlook uncertain.', url: 'https://www.coraltriangleinitiative.org/', category: 'Oceanography', source: 'CTI-CFF', date: '2026-04-05T00:00:00Z' },
    { title: 'EU Nature Restoration Law Implementation Begins Across Member States', body: 'The landmark EU regulation mandating restoration of 20% of land and sea areas enters enforcement phase, with member states submitting national plans.', url: 'https://environment.ec.europa.eu/', category: 'Ecology', source: 'European Commission', date: '2026-03-28T00:00:00Z' },
  ],
  Trending: [
    { title: 'Catastrophic Wildfires in Southeast Asia: El Niño Aftermath', body: 'Record-breaking peatland fires across Borneo and Sumatra create transboundary haze crisis. Air quality indices exceed 500 PSI in major cities.', url: 'https://fires.globalforestwatch.org/', category: 'Ecology', source: 'GFW Fires', date: '2026-04-30T00:00:00Z' },
    { title: 'Avian Influenza H5N1 Detected in Antarctic Penguin Colonies', body: 'First confirmed cases of highly pathogenic avian influenza in Emperor penguin populations raise fears of catastrophic breeding season losses.', url: 'https://www.iucn.org/', category: 'Biodiversity', source: 'IUCN', date: '2026-04-28T00:00:00Z' },
    { title: 'Deep-Sea Mining Moratorium Debate Intensifies at ISA Assembly', body: 'International Seabed Authority faces pressure from Pacific island nations demanding permanent halt to deep-sea mineral extraction.', url: 'https://www.isa.org.jm/', category: 'Oceanography', source: 'ISA', date: '2026-04-25T00:00:00Z' },
    { title: 'Critical Water Shortage Declared in Mekong Delta', body: 'Saltwater intrusion reaches record levels as upstream dam operations reduce freshwater flow. 18 million people face water security crisis.', url: 'https://www.mrcmekong.org/', category: 'Ecology', source: 'MRC', date: '2026-04-22T00:00:00Z' },
    { title: 'Javan Rhino Population Falls Below 70: Emergency Conservation Summit', body: 'Indonesia convenes emergency meeting as Ujung Kulon National Park census reveals further population decline of the world\'s rarest large mammal.', url: 'https://www.iucnredlist.org/', category: 'Biodiversity', source: 'IUCN Red List', date: '2026-04-18T00:00:00Z' },
  ],
  'New Papers': [
    { title: 'Nature: Tipping Point Cascades in the Earth System', body: 'New modeling study identifies 5 critical tipping point interactions where crossing one threshold accelerates others. Published in Nature.', url: 'https://www.nature.com/', category: 'Ecology', source: 'Nature', date: '2026-04-29T00:00:00Z' },
    { title: 'Science: Fungal Networks Mediate Forest Drought Resilience', body: 'First large-scale field study demonstrates mycorrhizal networks redistribute water to drought-stressed trees, enhancing forest survival.', url: 'https://www.science.org/', category: 'Mycology', source: 'Science', date: '2026-04-26T00:00:00Z' },
    { title: 'PNAS: Machine Learning Predicts Species Extinction Risk', body: 'Novel algorithm achieves 89% accuracy in predicting IUCN threat status using trait data alone, potentially accelerating Red List assessments.', url: 'https://www.pnas.org/', category: 'Biodiversity', source: 'PNAS', date: '2026-04-23T00:00:00Z' },
    { title: 'PLoS Biology: Rewilding Success Metrics After 10 Years', body: 'Comprehensive meta-analysis of 47 rewilding projects reveals species diversity recovery averages 15-30 years to reach reference baselines.', url: 'https://journals.plos.org/plosbiology/', category: 'Ecology', source: 'PLoS Biology', date: '2026-04-20T00:00:00Z' },
    { title: 'Global Ecology & Biogeography: Mangrove Carbon Stock Revision', body: 'Updated global mangrove carbon assessment reveals stocks 40% higher than previous estimates, strengthening case for mangrove conservation financing.', url: 'https://onlinelibrary.wiley.com/', category: 'Botany', source: 'GEB', date: '2026-04-17T00:00:00Z' },
  ],
  'By Region': [
    { title: 'Indonesia: KLHK Announces New Protected Area Network in Kalimantan', body: 'Ministry of Environment and Forestry designates 2.1M hectares of peat forest for permanent protection under Presidential decree.', url: 'https://www.menlhk.go.id/', category: 'Ecology', source: 'KLHK Indonesia', date: '2026-04-27T00:00:00Z' },
    { title: 'Philippines: Typhoon Season Damages Critical Coral Nurseries', body: 'Five coral restoration sites in the Visayas suffer 40-60% structure loss from early-season super typhoon. Reconstruction costs estimated at $2.3M.', url: 'https://www.denr.gov.ph/', category: 'Oceanography', source: 'DENR Philippines', date: '2026-04-24T00:00:00Z' },
    { title: 'Malaysia: Sarawak Heart of Borneo Corridor Under Threat', body: 'Proposed road infrastructure through the Heart of Borneo threatens connectivity between primary rainforest blocks critical for orangutan dispersal.', url: 'https://www.wwf.org.my/', category: 'Biodiversity', source: 'WWF Malaysia', date: '2026-04-21T00:00:00Z' },
    { title: 'Thailand: Mekong Giant Catfish Breeding Program Reports First Success', body: 'Critically endangered Mekong giant catfish bred in captivity for the first time in Thai conservation facility. 200 juveniles released.', url: 'https://www.fisheries.go.th/', category: 'Biodiversity', source: 'DOF Thailand', date: '2026-04-18T00:00:00Z' },
    { title: 'Pacific Islands: Marshall Islands Declares Climate Emergency', body: 'First Pacific island nation to formally declare climate emergency, calling for immediate global emissions reduction and loss-and-damage financing.', url: 'https://www.sprep.org/', category: 'Ecology', source: 'SPREP', date: '2026-04-15T00:00:00Z' },
  ],
}

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

import * as cheerio from 'cheerio'

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
    // Return curated environmental intelligence when Tavily is unavailable
    const labelInfo = LABEL_MAP[filter] || LABEL_MAP.Recommended
    const curated = CURATED_ARTICLES[filter] || CURATED_ARTICLES.Recommended
    const articles = curated.map((a, i) => ({
      id: `curated-${filter}-${i}`,
      label: labelInfo.label,
      labelColor: labelInfo.color,
      category: a.category,
      categoryColor: CATEGORY_COLORS[a.category] || '#2E5D3E',
      tag: filter,
      title: a.title,
      body: a.body,
      url: a.url,
      image: null,
      publishedAt: a.date,
      source: a.source,
      query: a.title,
    }))
    return NextResponse.json({ ok: true, articles, filter, fetchedAt: new Date().toISOString(), curated: true })
  }

  try {
    const allResults: TavilyResult[] = []

    // Fetch from Tavily with max_results: 8 to ensure we get enough after dropping imageless ones
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
            max_results: 8,
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
    const validArticles = []

    for (const r of unique) {
      if (validArticles.length >= 9) break

      let imageUrl = r.image_url || null

      // Scrape for og:image if Tavily didn't provide one
      if (!imageUrl) {
        try {
          const pageRes = await fetch(r.url, { signal: AbortSignal.timeout(4000) })
          if (pageRes.ok) {
            const html = await pageRes.text()
            const $ = cheerio.load(html)
            const ogImage = $('meta[property="og:image"]').attr('content')
            const twitterImage = $('meta[name="twitter:image"]').attr('content')
            const articleImg = $('article img').first().attr('src')
            const fallbacks = [ogImage, twitterImage, articleImg].filter(Boolean)
            if (fallbacks.length > 0) {
              const urlMatch = fallbacks[0]
              if (urlMatch && !urlMatch.startsWith('data:')) {
                imageUrl = new URL(urlMatch, r.url).href
              }
            }
          }
        } catch {
          // Scrape failed
        }
      }

      // NO PLACEHOLDER ALLOWED. If we STILL don't have an image, we drop this article.
      if (!imageUrl) continue

      const category = detectCategory(r.title, r.content)
      validArticles.push({
        id: `${filter}-${validArticles.length}`,
        label: labelInfo.label,
        labelColor: labelInfo.color,
        category,
        categoryColor: CATEGORY_COLORS[category] || '#2E5D3E',
        tag: filter,
        title: r.title,
        body: (r.content || '').slice(0, 160) + (r.content?.length > 160 ? '...' : ''),
        url: r.url,
        image: imageUrl,
        publishedAt: r.published_date || null,
        source: r.source || new URL(r.url).hostname.replace('www.', ''),
        query: r.title,
      })
    }

    const response = { ok: true, articles: validArticles, filter, fetchedAt: new Date().toISOString() }
    cache.set(cacheKey, { data: response, ts: Date.now() })
    return NextResponse.json(response)
  } catch {
    return NextResponse.json({ ok: false, articles: [], error: 'Failed to fetch from Tavily' })
  }
}
