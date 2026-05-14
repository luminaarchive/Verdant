# NaLI - Wildlife Field Intelligence for Indonesia

NaLI is an ecological field intelligence platform for Indonesian rangers, researchers, conservation NGOs, and biology students.

## What it does

NaLI structures wildlife observations from photos, audio, and field notes into source-backed ecological records. It supports species context, GBIF and IUCN enrichment, anomaly review recommendations, conservation-priority reasoning, field cases, bilingual English/Indonesian workflows, and export-ready scientific archives.

## Tech Stack

- **Frontend**: Next.js, Tailwind CSS, PWA-oriented field UI
- **Reasoning Runtime**: NaLI orchestrator, provider abstraction, ecological reasoning, longitudinal intelligence
- **Data Sources**: GBIF and IUCN integrations where configured, golden-set Indonesian species references for public demos
- **Database**: Supabase (PostgreSQL + RLS + Storage)
- **Deployment**: Vercel

## Getting Started

1. Clone the repo
2. Copy `.env.local.example` to `.env.local` and fill in your keys
3. Run the Supabase migration: `supabase/migrations/001_nali_schema.sql`
4. `npm install`
5. `npm run dev`

## Environment Variables

See `.env.local.example` for required variables.

Required and optional keys are documented in `docs/RELEASE_QA.md`.

Optional provider keys:
- Anthropic API key: https://console.anthropic.com
- Supabase project: https://supabase.com
- IUCN API key: https://apiv3.iucnredlist.org/api/v3/token

## Architecture

Observation Input -> Provider Signals -> Ecological Reasoning -> Confidence Calibration -> Conservation Prioritization -> Review Recommendation -> Field Cases -> Persistent Scientific Archive
