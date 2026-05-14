# Agentic Migration Report

Migration file: `supabase/migrations/022_agentic_field_intelligence.sql`

## Additive Changes

- Enables PostGIS extension.
- Adds `observations.location` geography point.
- Adds `observations.h3_cell_res7`.
- Backfills `location` from latitude/longitude.
- Adds trigger to keep `location` synced.
- Adds nearby observation RPC with privacy-aware output.
- Adds evidence hash, anomaly flag, role, review action, notification, threat event, realtime alert, and user score tables.
- Adds hash verification RPC.
- Adds review score and realtime alert triggers.
- Adds golden-set species references for Bekantan, Gajah Sumatera, Maleo, and Cendrawasih.

## RLS / Privacy Notes

- Sensitive exact coordinates are not returned from `get_observations_nearby`.
- Cross-user location memory returns summarized entries only when observations are verified/public-safe under policy.
- `observation_hashes` has no update/delete policy.
- Threat and realtime tables are read-only to authenticated users and insert-only to service role.

## Rollback Notes

This migration is additive. A rollback should first disable dependent app features, then drop new triggers/functions, then drop new tables/columns only after exporting any records. Do not drop `observations.location` until all location memory and map features are disabled.
