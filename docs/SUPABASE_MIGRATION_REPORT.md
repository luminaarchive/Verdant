# NaLI Supabase Migration Safety Report

Report generated for the confirmed NaLI production target before additive schema activation.

## Target Project

- Supabase project ref: `wvpplfjrbndzxlgpuicn`
- Production application: `https://naliai.vercel.app`
- Migration posture: additive NaLI activation first, no destructive cleanup during this phase
- Activation migration applied: `20260514071941_nali_live_infrastructure_activation`
- Agentic field intelligence migration applied: `20260514181110_agentic_field_intelligence`

## Existing Migration History

Live migration history currently contains:

- `003_durable_jobs`
- `004_export_durability`
- `20260504105835_auth_signup_repair_005`

The NaLI observation, reasoning, storage, field case, and longitudinal intelligence schema was not reflected before this phase.

After activation, live migration history includes `nali_live_infrastructure_activation` and `agentic_field_intelligence`.

## Existing Legacy Tables

Read-only inspection found these existing public tables:

- `daily_activities`
- `profiles`
- `research_job_events`
- `research_job_partial_results`
- `research_jobs`
- `research_requests`
- `research_results`
- `streaks`
- `user_profiles`
- legacy memory table
- `virtual_trees`

Legacy tables are not deleted by the NaLI activation migration. Any future cleanup should export row counts, ownership assumptions, and rollback notes before removal.

## RLS Snapshot Before NaLI Activation

RLS was enabled on most legacy tables, but disabled on:

- `research_job_events`
- `research_job_partial_results`
- `research_jobs`

NaLI activation does not weaken existing RLS policies and does not use public read policies for private observation records.

## Storage Snapshot Before NaLI Activation

No storage buckets were returned by read-only inspection. The NaLI activation migration creates the private `observation_media` bucket if it is missing.

## Planned NaLI Tables

The additive activation migration creates or validates:

- `users`
- `species_reference`
- `species_cache`
- `observations`
- `observation_media`
- `observation_events`
- `analysis_runs`
- `orchestrator_runs`
- `field_cases`
- `observation_cases`
- `reviewer_profiles`
- `offline_queue`
- `audit_logs`
- `ecological_memory_entries`
- `ecological_baselines`
- `longitudinal_patterns`
- `ecological_signal_graph_edges`
- `ecological_alerts`
- `confidence_evolution_events`
- `reasoning_replay_records`

Post-activation validation confirmed the critical NaLI tables exist.

## Required Observation Columns

The migration validates operational persistence columns:

- `reasoning_snapshot`
- `signal_snapshot`
- `reasoning_trace_id`
- `confidence_level`
- `review_status`
- `observation_status`
- `processing_stage`
- `conservation_priority_score`
- `conservation_priority_category`

Post-activation validation confirmed these required observation columns exist.

## Storage Bucket Changes

NaLI uses:

- bucket: `observation_media`
- access: private
- path convention: `{user_id}/{observation_id}/{checksum}.jpg`

Storage policies scope object access to the authenticated user's top-level folder. Server-side orchestration can use service-role credentials without exposing them to the browser.

## Seed Data

The migration seeds golden-set species used by local regression and field workflows:

- `Panthera tigris sumatrae`
- `Pongo tapanuliensis`
- `Pongo pygmaeus`
- `Dicerorhinus sumatrensis`
- `Nisaetus bartelsi`
- `Spizaetus bartelsi`
- `Varanus komodoensis`
- `Leucopsar rothschildi`

Post-activation validation confirmed these seed records exist.

The agentic field intelligence migration additionally seeds:

- `Nasalis larvatus`
- `Elephas maximus sumatranus`
- `Macrocephalon maleo`
- `Paradisaea apoda`

## Agentic Field Intelligence Additions

The applied additive migration adds:

- PostGIS-backed `observations.location`
- `observations.h3_cell_res7`
- `get_observations_nearby`
- `observation_hashes`
- `observation_anomaly_flags`
- `user_roles`
- `review_actions`
- `notifications`
- `threat_events`
- `realtime_alerts`
- `user_scores`
- `verify_observation_hash`

No destructive SQL is included. Rollback requires disabling dependent application features before dropping new objects.

Post-migration Supabase MCP validation confirmed PostGIS is enabled, `observations.location` and `observations.h3_cell_res7` exist, `get_observations_nearby` and `verify_observation_hash` exist, all eight new operational tables have RLS enabled, and the private `observation_media` bucket remains non-public.

## Risks

- Existing legacy tables remain in place and may still be reachable by old code paths if old deployments are restored.
- Cross-user RLS proof still requires two disposable authenticated test users.
- Provider keys are optional and may report unconfigured until production provider credentials are installed.
- Live observation upload requires the private storage bucket and object policies to be active.

## Rollback Notes

If activation causes operational issues:

1. Promote the previous healthy Vercel deployment.
2. Keep NaLI tables in place unless a reviewed database rollback is prepared.
3. Preserve observation, media, reasoning, event, and field case rows before any schema rollback.
4. Disable optional provider keys if provider failures degrade core observation workflows.
5. Re-run `npm run validate:production` with production environment variables after rollback or repair.
