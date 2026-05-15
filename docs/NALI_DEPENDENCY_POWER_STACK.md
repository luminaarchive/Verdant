# NaLI Dependency Power Stack

Status date: 2026-05-15.

| Dependency | Purpose | Status | Why it exists | Risk |
| --- | --- | --- | --- | --- |
| `h3-js` | H3 res7 anomaly grid | Installed | Spatial indexing for first-record/unusual activity flags | Sparse data can overflag |
| `jszip` | Darwin Core Archive zip | Installed | DwC-A export support | Use only in export code |
| `exifr` | Media EXIF evidence extraction | Installed this session | Near-term evidence metadata/checksum workflow | Strip sensitive GPS before public/export views |
| `leaflet`, `react-leaflet` | Map UI | Installed | Existing map/field layer surfaces | SSR/client boundary care |
| `jspdf` | Patrol/report PDF | Installed | Patrol planner PDF export | Client bundle size |
| `@supabase/supabase-js`, `@supabase/ssr` | Backend/auth/storage | Installed | Core persistence/RLS/storage | Service role must stay server-side |
| `@anthropic-ai/sdk` | Optional agentic assistance | Installed | Existing optional analysis/planning path | No expensive public calls |

## Not Installed

LangChain, CrewAI, AutoGPT frameworks, Hermes Agent, GSD package, `papaparse`, and Python-heavy BirdNET were not installed. Current NaLI needs small auditable modules, not generic orchestration weight.

## Audit

`npm audit --audit-level=moderate` reports 18 vulnerabilities. Do not claim production security readiness until framework/transitive fixes are evaluated and applied safely.

## What Requires API Keys

`IUCN_API_KEY`, `EBIRD_API_KEY`, `NASA_FIRMS_API_KEY`, `GFW_API_KEY`, `ANTHROPIC_API_KEY`, `BIRDNET_API_KEY`.

## What Must Not Be Claimed

No payment, no live threat import, no BirdNET production inference, no external institutional usage, and no model fine-tune are live.
