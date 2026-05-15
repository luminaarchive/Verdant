# Current NaLI State

Status date: 2026-05-15.

## Repo State

- Branch: `main`
- Latest commit before this work: `67269d5`
- Working tree at audit start: only untracked previous QA screenshots/logs were present.
- `.git/index.lock`: not present during audit.
- `.env*`: ignored by `.gitignore`; no `.env.local` was staged.

## Implemented Live In Code

- Next.js 16 App Router app with landing, auth, dashboard, observe, review, archive, map, monitoring, alerts, patrol plan, verify, privacy, contact, and system pages.
- Public species demo using NaLI golden-set references and mandatory non-verified demo labels.
- Verified Indonesian species visuals in `public/species/` and `src/lib/species/speciesVisuals.ts`.
- Scientific bridge modules under `src/lib/scientific-bridge/`.
- Evidence hash library, H3 anomaly library, Darwin Core helpers, voice-to-form, deterministic patrol planner, WhatsApp/PDF export.
- Sensitive species policy, observation quality scoring, field templates, and survey protocol scaffolds.
- Supabase migration scaffolds for PostGIS, location memory, hashes, review actions, roles, threat events, realtime alerts, and user scores.

## Scaffolded / Requires Activation

- IUCN/eBird/FIRMS/GFW/BirdNET/Claude adapters require API keys.
- FIRMS/GFW scheduled import is not active.
- Supabase Realtime table/trigger requires live DB validation and publication.
- Observer credibility scoring needs live review-action validation.
- Camera trap, transect, point count, patrol route, and timed survey protocols are foundations only.
- Fine-tuning strategy and synthetic examples exist; no model has been fine-tuned.

## Missing / Must Not Be Claimed

- No live payment integration.
- No verified institutional deployments/testimonials.
- No production threat data import.
- No legal admissibility guarantee for hashes.
- No automatic verification bypass for sensitive species.
- No configured SOP vault path.

## MCP And Workflow Status

See `docs/CODEX_MCP_STACK.md` and `docs/WORKFLOW_POWER_TOOLS_RESEARCH.md`.

## Dependency/Audit Status

`exifr` was installed for evidence metadata. `npm audit --audit-level=moderate` currently reports 18 vulnerabilities, mainly through Next.js and OpenTelemetry/protobuf transitive packages. This work did not run `npm audit fix` because it could upgrade framework/runtime behavior beyond the scoped dependency add.

## Production Validation Status

Completed locally on 2026-05-15:

- `npm run check:i18n`: passed, 398 translation keys matched.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed on Next.js 16.2.4 with webpack.
- `npm run verify`: passed, including build, typecheck, i18n, public demo tests, field intelligence tests, fine-tuning tests, reasoning tests, longitudinal tests, and golden-set pipeline validation.
- `npm run validate:production`: completed with Supabase/storage/RLS checks skipped locally because required Supabase env vars were not configured in this shell.
- `npm run seo:google-checklist`: printed indexing checklist and ranking caveat.
- `npm run bench`: passed baseline benchmark.
- `node scripts/prepare-finetune-dataset.cjs && node scripts/evaluate-decision-grade-output.cjs`: passed and created `data/fine-tuning/nali_finetune_combined.preview.jsonl`.

Playwright MCP QA passed for landing desktop/mobile, public demo, Orangutan/Pongo no-panda guard, `/verify`, `/privacy`, `/contact`, and unauthenticated `/system` redirect to `/login`. Authenticated routes were not tested because no test user credentials were available in this session.

Supabase MCP read-only validation against documented NaLI project `wvpplfjrbndzxlgpuicn` confirmed PostGIS, `observations.location` geography, `h3_cell_res7`, nearby RPC, hashes, anomaly flags, review actions, user roles, threat events, user scores, realtime alerts, private `observation_media` bucket, and populated species references. Security advisors still report legacy research tables without RLS and several callable `SECURITY DEFINER` functions; these remain unresolved live-database risks and were not changed destructively.
