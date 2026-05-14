# NaLI Agentic Feature Roadmap

## Live In This Branch

- Public species demo with NaLI golden-set fallback.
- Local verified species visuals under `public/species`.
- Landing sections for source-backed workflow, agentic differentiation, pricing, trust, and demo disclaimers.
- Evidence hash library and `/verify` page.
- H3 anomaly library and tests.
- Location Memory API/panel backed by planned PostGIS RPC.
- Review queue and review action API.
- Darwin Core CSV/DwC-A export route.
- Voice-to-form assistive component.
- Patrol planner deterministic fallback with WhatsApp/PDF export.
- Map page changed from simulated points to persisted layer fetch.

## Scaffolded, Requires Activation

- PostGIS migration `022_agentic_field_intelligence.sql`.
- `observation_hashes`, `observation_anomaly_flags`, `user_roles`, `review_actions`, `notifications`, `threat_events`, `realtime_alerts`, `user_scores`.
- Supabase Realtime alert table and observe-page subscriber.
- FIRMS/GFW threat fetchers.
- Observer credibility score trigger.

## Requires API Keys

- `IUCN_API_KEY` for live Red List calls.
- `NASA_FIRMS_API_KEY` for FIRMS imports.
- `GFW_API_KEY` when selected GFW datasets require authentication.
- `ANTHROPIC_API_KEY` for Claude patrol plan generation beyond deterministic fallback.

## Requires Production Validation

- RLS policy behavior for reviewer/admin roles.
- Exact coordinate export permissions for CR/EN species.
- Realtime channel subscription in authenticated regional contexts.
- Scheduled threat imports and retention policy.
- Governance before any GBIF publishing workflow.
