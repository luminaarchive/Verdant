# Agentic Feature Roadmap

Status date: 2026-05-15.

## Live / Partial

- Public demo with golden-set fallback and non-verified labels.
- Source-backed scientific bridge scaffolds for GBIF/IUCN/eBird/iNat/EOL/COL.
- Location memory API/panel backed by planned PostGIS RPC.
- Evidence hash library and `/verify` route.
- H3 anomaly flag logic and tests.
- Review queue route and review action API.
- Darwin Core export helpers.
- Voice-to-form assistive UI.
- Deterministic patrol planner with WhatsApp/PDF export.

## Scaffolded

- FIRMS/GFW threat events and threat pulse.
- Supabase Realtime alerts.
- Observer credibility score.
- Field templates/evidence types.
- Camera trap batch, transect, point count, patrol route, and timed survey foundations.
- Conservation report generator concept.
- Project/area workspace model.
- Fine-tuning data/evaluator.

## Requires API Keys

`IUCN_API_KEY`, `EBIRD_API_KEY`, `NASA_FIRMS_API_KEY`, `GFW_API_KEY`, `ANTHROPIC_API_KEY`, `BIRDNET_API_KEY`.

## Requires Edge/Cron Activation

- FIRMS/GFW imports every 6 hours.
- Realtime alert trigger/publication validation.
- Optional report generation schedule.

## Unproven

- Production Supabase schema validation in current environment.
- Browser QA for all authenticated routes.
- Live threat data ingestion.
- Any fine-tuned model.

## Must Not Be Claimed

No live payments, institutional usage, legal admissibility, official threat assessment, or fully autonomous verification.
