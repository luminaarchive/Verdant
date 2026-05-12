# NaLI - Wildlife Field Intelligence Agent

AI-powered species identification and field intelligence for rangers, researchers, and wildlife enthusiasts in Indonesia.

## What it does

NaLI is an AI Agent that identifies wildlife species from photos, audio, or text descriptions. It cross-references GBIF and IUCN Red List data in real-time, detects anomalous observations, and automatically generates field logs.

## Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS, PWA
- **AI Agent**: Claude claude-sonnet-4-20250514 (Vision), GBIF API, IUCN Red List API
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

Keys needed:
- Anthropic API key: https://console.anthropic.com
- Supabase project: https://supabase.com
- IUCN API key: https://apiv3.iucnredlist.org/api/v3/token

## Architecture

User (field) → PWA → Next.js API → NaLI Orchestrator → Claude Vision + GBIF + IUCN + Anomaly Check → Supabase
