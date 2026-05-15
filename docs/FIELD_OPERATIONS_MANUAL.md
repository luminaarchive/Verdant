# NaLI Field Operations Manual

Status date: 2026-05-15.

## Intended Users

Rangers, conservation NGO staff, biology students, field researchers, biodiversity survey teams, patrol coordinators, and reviewer/validator teams in Indonesia.

## Operational Principles

- Record evidence, not just species names.
- Protect sensitive coordinates.
- Keep uncertainty visible.
- Route CR/EN, wildlife crime, threat, and high-anomaly cases to human review.
- Export only verified observations by default.
- Treat threat pulse as indicative, not official.

## Live / Partial Workflows

1. Public user tries species lookup demo.
2. Authenticated user creates observation with media/GPS/notes.
3. NaLI stores structured observation and optional source context.
4. H3 flags and evidence hash can be attached when migrations are active.
5. Reviewer/admin reviews queue and records action.
6. Verified records can be exported to Darwin Core.
7. Patrol planner ranks available NaLI signals with deterministic fallback.

## Scaffolded Workflows

- Threat import from FIRMS/GFW.
- Realtime alerts per region/H3 area.
- Camera trap batch mode.
- Transect/point-count/timed survey protocols.
- Conservation weekly/monthly reports.
- Area/project workspace roles.

## Requires API Keys

See `docs/API_ENV_SETUP.md`.

## Requires Edge/Cron Activation

Threat imports and scheduled reports.

## Unproven

Field usability in low-signal Indonesian patrol conditions still needs real pilot testing.

## What Must Not Be Claimed

Do not claim NaLI replaces ranger leadership, government assessment, expert review, or forensic/legal validation.
