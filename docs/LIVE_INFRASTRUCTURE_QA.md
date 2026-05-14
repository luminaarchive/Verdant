# NaLI Live Infrastructure QA

NaLI live infrastructure validation proves that the deployed conservation operations system can use real authentication, private storage, database persistence, orchestration traces, and reasoning snapshots. It is not an AI feature checklist and does not validate chatbot, social, or generic dashboard behavior.

## Current Live Finding

The deployed application at `https://naliai.vercel.app` is configured against Supabase project `wvpplfjrbndzxlgpuicn`, which is now treated as the NaLI production target.

Read-only inspection found:

- Applied migrations: `003_durable_jobs`, `004_export_durability`, `20260504105835_auth_signup_repair_005`.
- NaLI critical tables were not present: `observations`, `observation_events`, `orchestrator_runs`, `analysis_runs`, `species_reference`, `field_cases`, `observation_cases`, `reviewer_profiles`.
- The private `observation_media` storage bucket was not present.
- Existing public tables appeared to belong to a legacy non-NaLI application, including research job/result tables, a legacy memory table, virtual tree data, and related profile/activity tables.

The operator has confirmed that this project should be migrated to NaLI. Legacy data was documented before activation, and the additive `nali_live_infrastructure_activation` migration has been applied. Legacy tables remain in place until a separate cleanup/export decision is made.

## Environment Setup

Required browser-safe variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

Required server-only variable:

- `SUPABASE_SERVICE_ROLE_KEY`

Optional server-only provider variables:

- `ANTHROPIC_API_KEY`
- `IUCN_API_KEY`
- `BIRDNET_API_KEY`
- `SENTRY_DSN`

Never expose `SUPABASE_SERVICE_ROLE_KEY` in client components, browser bundles, logs, screenshots, or Vercel public variables. It must not use a `NEXT_PUBLIC_` prefix.

## Supabase Setup

1. Confirm the production Supabase project ID and name before applying migrations.
2. Apply migrations from `supabase/migrations/` in filename order.
3. Confirm protected tables have RLS enabled.
4. Confirm user-scoped observation policies prevent broad anonymous reads.
5. Confirm public reference data, such as `species_reference`, remains readable where intended.
6. Run:

```bash
npm run validate:supabase
npm run validate:rls
```

Expected critical tables:

- `observations`
- `observation_media` or `observations_media`
- `analysis_runs`
- `observation_events`
- `orchestrator_runs`
- `species_reference`
- `field_cases`
- `observation_cases` if case linking is enabled
- `reviewer_profiles` if reviewer reputation is enabled

Expected operational columns on `observations`:

- `reasoning_snapshot`
- `signal_snapshot`
- `reasoning_trace_id`
- `conservation_priority_score`
- `conservation_priority_category`

## Storage Setup

The field media bucket must be private.

Expected bucket:

- `observation_media`

Expected path convention:

```text
{user_id}/{observation_id}/{checksum}.jpg
```

Validation steps:

1. Confirm bucket exists.
2. Confirm public access is disabled.
3. Confirm signed URL generation works.
4. Confirm tiny upload probe succeeds.
5. Confirm cleanup removes probe files.
6. Run:

```bash
npm run validate:storage
```

Uploads must fail honestly when the bucket is missing, MIME validation fails, file size is too large, or the storage policy rejects the write.

## Auth Validation

Use a disposable test account for live QA.

1. Register a test account.
2. Confirm profile creation succeeds.
3. Sign out.
4. Attempt invalid login and confirm a readable error.
5. Sign in with the test account.
6. Refresh the page and confirm the session persists.
7. Visit protected routes while signed out and confirm redirect to `/login`.
8. Confirm there are no auth loops, blank screens, hydration errors, or raw stack traces.

Protected routes:

- `/observe`
- `/archive`
- `/observation/<id>`
- `/monitoring`
- `/cases`
- `/alerts`
- `/system`

## Observation Flow Validation

Use a non-sensitive test image and non-sensitive coordinates.

1. Sign in with the disposable test account.
2. Open `/observe`.
3. Add field notes.
4. Add GPS values.
5. Upload an image.
6. Submit the field observation.
7. Confirm the API returns `observationId`.
8. Confirm the media path follows the private checksum convention.
9. Confirm the database record persists.
10. Confirm orchestration events persist.
11. Confirm `reasoning_snapshot`, `signal_snapshot`, and `reasoning_trace_id` persist.
12. Open `/archive` and verify the observation appears as real persisted data.
13. Open `/observation/<id>` and verify structured reasoning, signal summary, review recommendation, priority explanation, provider conflicts, and linked field cases if present.

If external provider keys are unavailable, fallback or mock provider output is acceptable for persistence validation. The UI must not claim external provider success when a provider is unconfigured.

## Browser QA Checklist

Routes:

- `/`
- `/login`
- `/register`
- `/observe`
- `/archive`
- `/monitoring`
- `/cases`
- `/alerts`
- `/system`
- `/observation/nonexistent-test-id`

Check:

- No chatbot, social, or generic SaaS workflow appears.
- Landing copy wraps naturally.
- Auth inputs and buttons remain readable.
- Protected routes redirect correctly when signed out.
- Empty states distinguish missing data from real alerts or cases.
- `/system` shows configured, degraded, or unverified states without exposing secret values.
- `/api/health` returns structured app, database, storage, provider, timestamp, and version status.
- Console contains no critical errors or hydration failures.

## Mobile QA Checklist

Viewport widths:

- `390px`
- `360px`

Check:

- Navigation remains reachable.
- Form fields do not collapse.
- Buttons do not overflow.
- Status cards remain readable.
- Observation detail audit sections do not force horizontal scrolling.
- Empty and fail states are concise and operational.

## Rollback Checklist

If live validation fails after deployment:

1. Promote the previous healthy Vercel deployment.
2. Confirm `/api/health` on the restored deployment.
3. Do not roll back Supabase migrations without a reviewed database rollback plan.
4. Preserve observation, media, reasoning, event, and field case records before schema changes.
5. Disable optional provider keys if provider failures are degrading core observation workflows.
6. Document the failed validation route, timestamp, console or API error, and affected table or bucket.

## Known Production Limitations

- Live Supabase schema activation requires additive migration validation before any legacy data cleanup.
- Local validation scripts skip live checks when required environment variables are absent.
- Full cross-user RLS validation requires two disposable authenticated test users.
- Optional provider keys can remain unconfigured; NaLI should report provider status honestly.
- The development rate limiter is in-memory and should be replaced with a shared store for multi-instance enforcement.
- Playwright live QA in this session reached the tool usage limit after the landing desktop check; further browser interaction requires renewed Playwright availability.
