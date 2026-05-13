# NaLI Release QA

NaLI release checks must preserve the platform as conservation-grade ecological intelligence infrastructure. Do not introduce chatbot, social, or generic SaaS workflows during release validation.

## Required Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

## Optional Provider Environment Variables

These provider keys may be absent in local development. Missing optional keys should report as unavailable or unconfigured, not crash the local UI.

- `IUCN_API_KEY`
- `BIRDNET_API_KEY`
- `ANTHROPIC_API_KEY`

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
```

Expected notes:

- `npm run lint` may report existing image optimization warnings, but it should exit successfully.
- `npm run verify` runs build, typecheck, operational reasoning tests, longitudinal tests, and golden-set regression.

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

## Vercel Deployment Checklist

- Confirm Vercel deploys from the GitHub `main` branch.
- Set all required environment variables in the Vercel project.
- Set optional provider keys only when the provider integration is ready for operational use.
- Verify `npm run build` is the Vercel build command.
- Confirm protected routes redirect unauthenticated users to `/login`.

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
3. Submit a field observation with at least one input: photo, field notes, or other supported media.
4. Confirm latitude and longitude validation.
5. Confirm the observation appears in `/archive`.
6. Open the observation detail page.
7. Confirm reasoning trace, signal snapshot, review recommendation, and priority explanation render as structured audit sections.

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
