# NaLI Deployment

NaLI deploys as an ecological intelligence and conservation operations platform. Production releases should preserve observation-centric, reasoning-centric, and conservation-centric behavior.

## GitHub Main Branch Deployment

- `main` is the release branch.
- Vercel should be connected to `github.com/luminaarchive/NaLI`.
- Deployments should run from clean commits that pass local verification.
- Before merging or deploying, run:

```bash
npm run verify
node tests/e2e/smoke-observation-flow.cjs
```

## Vercel Environment Variables

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

Optional provider keys:

- `IUCN_API_KEY`
- `BIRDNET_API_KEY`
- `ANTHROPIC_API_KEY`

Optional keys can remain unset until their provider integrations are enabled. NaLI should report those providers as unavailable or unconfigured instead of failing the UI.

## Supabase Migration Order

Apply migrations in order from `supabase/migrations/`. Current release order:

```text
001_nali_schema.sql
003_durable_jobs.sql
004_export_durability.sql
005_auth_signup_repair.sql
006_security_hardening_rls_and_function_exec.sql
007_policy_tightening_followup.sql
008_internal_tables_service_role_policies.sql
009_storage_public_bucket_listing_fix.sql
010_add_profile_columns.sql
011_create_avatars_bucket.sql
012_durable_engine.sql
013_observation_field_log_foundation.sql
014_auth_profile_role_metadata.sql
015_nali_domain_architecture.sql
016_nali_autonomous_infrastructure.sql
017_nali_human_review_system.sql
018_nali_audio_foundation.sql
019_ecological_reasoning_operational_runtime.sql
020_longitudinal_ecological_intelligence.sql
```

After applying migrations, verify:

- Auth profile creation works for new users.
- RLS policies protect observation and review data.
- Operational runtime tables preserve traceability and replay data.
- Reasoning and signal snapshots remain separated.
- End-to-end observation persistence updates `reasoning_snapshot`, `signal_snapshot`, and `reasoning_trace_id`.

## Storage Bucket Notes

- Confirm field media buckets exist before production observation testing.
- Confirm the private `observation_media` bucket exists.
- Confirm bucket policies allow authenticated or service-role mediated upload paths required by field observations.
- Confirm observation media paths follow `/{user_id}/{observation_id}/{checksum}.<ext>`.
- Keep sensitive biodiversity media and coordinates protected by the existing security and obfuscation rules.
- Do not expose endangered species media or precise coordinates through public bucket listing.

## Production Observation Smoke Test

1. Register or sign in with a test account.
2. Open `/observe`.
3. Create an observation with image, notes, and GPS coordinates.
4. Confirm the UI receives an `observationId` and links to `/observation/<id>`.
5. Confirm media exists in private Supabase storage and `observation_media`.
6. Confirm the orchestrator persists `analysis_runs`, `observation_events`, `reasoning_snapshot`, and `signal_snapshot`.
7. Open `/archive` and verify the observation is listed from persisted data.
8. Open `/observation/<id>` and verify reasoning trace, review recommendation, priority explanation, provider conflicts, and linked cases.
9. Open `/monitoring`, `/cases`, and `/alerts`; verify real records appear or empty states clearly say what data is needed.
10. Check `/api/health` and `/system`.

## Health Check URL

Use the deployment health endpoint after every release:

```text
https://<deployment-domain>/api/health
```

Release-ready health should show:

- `app: "ok"`
- `database: "ok"`
- `storage: "ok"`
- provider status appropriate for configured keys

Provider status may be `unconfigured` for optional future integrations.

## System Readiness URL

Authenticated operators can inspect deployment readiness at:

```text
https://<deployment-domain>/system
```

The page should show auth, Supabase, storage, observation route, orchestrator, health endpoint, provider configuration, and verification commands.

## Protected Route Check

Unauthenticated users should be redirected to `/login` for:

- `/archive`
- `/observe`
- `/observation/<id>`
- `/monitoring`
- `/cases`
- `/alerts`
- `/system`

Authenticated users should be able to load the private field workspace.

## Rollback Note

If a production deployment fails:

1. Promote the previous healthy Vercel deployment.
2. Confirm `/api/health` on the restored deployment.
3. Avoid rolling back Supabase migrations unless a migration-specific rollback has been reviewed.
4. If database rollback is required, preserve observation, reasoning, event, and audit records before changing schema state.
