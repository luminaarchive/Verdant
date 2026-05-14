# NaLI API and Environment Setup

Never commit `.env.local` or service role keys.

| Env var                         | Required for                           | Scope                     | Free/paid         | Degraded state                                                   |
| ------------------------------- | -------------------------------------- | ------------------------- | ----------------- | ---------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase client/server access          | Public URL                | Supabase plan     | Dummy client, validation skipped                                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Authenticated browser requests         | Public anon key           | Supabase plan     | Auth/API unavailable                                             |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-only hash/anomaly/review writes | Service role, server only | Supabase plan     | App falls back where RLS permits and reports skipped persistence |
| `IUCN_API_KEY`                  | Live Red List enrichment               | IUCN API token            | Free registration | Golden-set/cache fallback                                        |
| `NASA_FIRMS_API_KEY`            | FIRMS fire import                      | FIRMS MAP_KEY             | Free registration | Threat fetcher reports unconfigured                              |
| `GFW_API_KEY`                   | GFW datasets requiring auth            | GFW token                 | Dataset dependent | GFW fetcher reports unconfigured                                 |
| `ANTHROPIC_API_KEY`             | Claude patrol plan parser/generator    | Server-only AI key        | Paid usage        | Deterministic patrol fallback                                    |

## Signup Steps

### IUCN Red List

1. Create an account at https://api.iucnredlist.org/.
2. Generate an API token.
3. Store it as `IUCN_API_KEY` in Vercel/Supabase server environment.

### NASA FIRMS

1. Request a MAP_KEY at https://firms.modaps.eosdis.nasa.gov/api/.
2. Store it as `NASA_FIRMS_API_KEY`.
3. Choose product, bbox, and retention before enabling cron.

### Global Forest Watch

1. Review datasets at https://data-api.globalforestwatch.org/.
2. Create credentials only if selected endpoints require them.
3. Store as `GFW_API_KEY`.

## Validation Commands

- `npm run check:i18n`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run verify`
- `npm run validate:production`
- `npm run seo:google-checklist`

## Live / Scaffolded Status

Live locally: demo, species visuals, SEO routes, field-intelligence libraries, verify page, review page, patrol planner fallback.

Live in Supabase after migration `20260514181110_agentic_field_intelligence`: PostGIS location memory schema, evidence hash table/RPC, anomaly flag table, review roles/actions, threat event table, realtime alert table, and observer credibility score table.

Scaffolded pending provider keys/scheduled activation: FIRMS/GFW threat imports, Claude-assisted patrol generation, production cron/Edge Function import jobs, and region-specific realtime alert operating procedures.
