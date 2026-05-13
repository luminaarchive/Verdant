# NaLI Release QA

NaLI release checks must preserve the platform as conservation-grade ecological intelligence infrastructure. Do not introduce chatbot, social, or generic SaaS workflows during release validation.

## Required Environment Variables

Browser-safe public:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

Server-only secret:

- `SUPABASE_SERVICE_ROLE_KEY`

## Optional Provider Environment Variables

These provider keys may be absent in local development. Missing optional keys should report as unavailable or unconfigured, not crash the local UI.

- `IUCN_API_KEY`
- `BIRDNET_API_KEY`
- `ANTHROPIC_API_KEY`
- `SENTRY_DSN`
- `VERCEL_ANALYTICS_ID` if used

`SUPABASE_SERVICE_ROLE_KEY` must never be exposed client-side or prefixed with `NEXT_PUBLIC_`.

## Local Verification Commands

Run the full release verification sequence before deployment:

```bash
npm run lint
npm run typecheck
npm run build
npm run test:reasoning
npm run test:longitudinal
npm run test:golden
npm run verify
node tests/e2e/smoke-observation-flow.cjs
npm run validate:vercel-env
npm run validate:supabase
npm run validate:storage
npm run validate:rls
npm run validate:production
```

Expected notes:

- `npm run lint` may report existing image optimization warnings, but it should exit successfully.
- `npm run verify` runs build, typecheck, operational reasoning tests, longitudinal tests, and golden-set regression.
- `node tests/e2e/smoke-observation-flow.cjs` validates the local product loop with mock persistence and skips live Supabase writes when required environment variables are missing.
- Production validation scripts print `SKIPPED` when local env vars are missing. Do not interpret skipped checks as production readiness.

## Supabase Migration Checklist

Apply migrations in filename order from `supabase/migrations/`:

1. `001_nali_schema.sql`
2. `003_durable_jobs.sql`
3. `004_export_durability.sql`
4. `005_auth_signup_repair.sql`
5. `006_security_hardening_rls_and_function_exec.sql`
6. `007_policy_tightening_followup.sql`
7. `008_internal_tables_service_role_policies.sql`
8. `009_storage_public_bucket_listing_fix.sql`
9. `010_add_profile_columns.sql`
10. `011_create_avatars_bucket.sql`
11. `012_durable_engine.sql`
12. `013_observation_field_log_foundation.sql`
13. `014_auth_profile_role_metadata.sql`
14. `015_nali_domain_architecture.sql`
15. `016_nali_autonomous_infrastructure.sql`
16. `017_nali_human_review_system.sql`
17. `018_nali_audio_foundation.sql`
18. `019_ecological_reasoning_operational_runtime.sql`
19. `020_longitudinal_ecological_intelligence.sql`

After migration:

- Confirm RLS policies are enabled on protected tables.
- Confirm service-role-only internal tables are not accessible through anon client paths.
- Confirm observation storage buckets and policies match field media upload requirements.
- Confirm `019_ecological_reasoning_operational_runtime.sql` has added `reasoning_snapshot`, `signal_snapshot`, and `reasoning_trace_id`.
- Confirm `020_longitudinal_ecological_intelligence.sql` has created ecological memory, patterns, alerts, confidence evolution, and replay tables.
- Run `npm run validate:supabase` against the target environment to confirm expected tables and operational reasoning columns are reachable.

## Supabase Live Validation

Run:

```bash
npm run validate:supabase
```

This checks Supabase connection, expected tables, operational reasoning columns, the `observation_media` bucket, private bucket behavior, and a safe insert/select probe when the target schema allows it.

If required env vars are missing, the script exits 0 with skipped messages. If env vars are present but schema is broken, the script fails with an actionable error.

## Storage Bucket Validation

Run:

```bash
npm run validate:storage
```

The script validates:

- private `observation_media` bucket exists
- public access is disabled
- signed URL generation works
- test path follows `/{user_id}/{observation_id}/{checksum}.jpg`
- tiny probe file uploads and cleans up

## RLS Validation

Run:

```bash
npm run validate:rls
```

The script checks anonymous access against private observation tables and confirms `species_reference` remains readable. If real auth test users are not provided, it reports partial checks instead of pretending cross-user isolation was proven.

## Vercel Deployment Checklist

- Confirm Vercel deploys from the GitHub `main` branch.
- Set all required environment variables in the Vercel project.
- Mark `NEXT_PUBLIC_*` variables as public-safe and keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- Set optional provider keys only when the provider integration is ready for operational use.
- Verify `npm run build` is the Vercel build command.
- Confirm protected routes redirect unauthenticated users to `/login`.
- Run `npm run validate:vercel-env` locally and compare against the Vercel Environment Variables screen.

## Health Endpoint Check

After deployment, call:

```bash
curl https://<deployment-domain>/api/health
```

Expected structure:

- `app: "ok"`
- `database: "ok"` or `"degraded"`
- `storage: "ok"` or `"degraded"`
- `providers.status: "available"`, `"degraded"`, or `"unconfigured"`
- `timestamp`
- `version`

Investigate `degraded` before release if it affects core observation, storage, or review workflows.

## Protected Route Smoke Test

Unauthenticated requests should redirect to `/login`:

- `/archive`
- `/observe`
- `/observation/<id>`
- `/monitoring`
- `/cases`
- `/alerts`
- `/system`

Authenticated sessions should load the field workspace without exposing unrelated user records.

## Observation Flow Smoke Test

1. Sign in with a test user.
2. Open `/observe`.
3. Submit a field observation with an image, field notes, and GPS coordinates.
4. Confirm the API returns `observationId` and does not show success if persistence fails.
5. Confirm storage writes the media under `/{user_id}/{observation_id}/{checksum}.<ext>`.
6. Confirm `observation_media` contains a record for the uploaded media.
7. Wait for background analysis or trigger `/api/agent/analyze` manually with the observation ID if local background execution is interrupted.
8. Confirm observation events include `OBSERVATION_CREATED`, `MEDIA_UPLOADED`, `ORCHESTRATION_STARTED`, `REASONING_SYNTHESIZED`, and `OBSERVATION_COMPLETED` or `OBSERVATION_FAILED`.
9. Confirm `/archive` shows the persisted observation.
10. Open `/observation/<id>` and confirm reasoning trace, signal snapshot, review recommendation, priority explanation, provider runs, linked cases, and events render as structured audit sections.

For live Node-side persistence validation, set a disposable authenticated test user ID:

```bash
NALI_LIVE_TEST_USER_ID=<auth-user-uuid> node tests/e2e/smoke-observation-flow.cjs
```

This creates a test observation, runs the mock orchestrator against live Supabase, verifies reasoning/events persisted, and deletes the test observation. Without `NALI_LIVE_TEST_USER_ID`, the live write is skipped.

## E2E Observation Manual Checklist

1. Register or sign in with a test account.
2. Create a field observation from `/observe`.
3. Upload an image that passes MIME and file-size validation.
4. Wait for analysis to complete or use the manual analysis route for local fallback.
5. Open `/archive` and verify the record is real persisted data.
6. Open `/observation/<id>` and inspect reasoning and signal snapshots.
7. Open `/monitoring`, `/cases`, and `/alerts`; confirm they show real data or honest empty states.
8. Check `/api/health`.
9. Check `/system` for E2E readiness checks.

## Monitoring, Cases, And Alerts Smoke Test

- `/monitoring` shows regional ecological intelligence, anomaly clusters, confidence drift, and linked cases.
- `/cases` shows field case severity, reviewer assignment, linked observations, linked clusters, and operational notes.
- `/alerts` shows ecological alerts with evidence links, trace IDs, severity, and confidence.
- Empty states should explain what field data is needed next.

## Known Limitations

- Optional provider keys may be unavailable in local and preview environments.
- The development rate limiter is in-memory and should be replaced with Redis or Upstash for multi-instance production enforcement.
- Health checks can report degraded if Supabase tables, storage policies, or service role access are not configured.
- Some existing views still use plain image elements and may produce non-blocking lint warnings.
- Local background execution may complete after the HTTP response; use the persisted event trail to verify analysis completion.
- Validation scripts do not create auth users. Live persistence tests require an explicit disposable `NALI_LIVE_TEST_USER_ID`.
