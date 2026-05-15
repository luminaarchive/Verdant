---
name: nali-supabase-postgis-rls
description: Guide Supabase, PostGIS, RLS, storage, RPC, and realtime work for NaLI.
---

## When To Use
Use for migrations, RLS, buckets, location memory, evidence hashes, review roles, threat tables, alerts, and user scores.

## Inspect First
`supabase/migrations/`, `docs/SUPABASE_MIGRATION_REPORT.md`, `src/lib/supabase/`, `src/app/api/`.

## Required Checks
Enable RLS on exposed tables, avoid service role client-side, use PostGIS `geography(Point,4326)`, and protect sensitive coordinates.

## Do Not Do
Do not destructively alter tables without migration report and rollback notes. Do not create users or credentials.

## Verification
Run Supabase validation scripts/MCP where available: RLS, storage, live schema, advisors if connected.

## Expected Output
Additive migrations, permission-aware RPCs, and honest activation docs.

## Token Efficiency
Use `rg` for table/function names before reading full migrations.
