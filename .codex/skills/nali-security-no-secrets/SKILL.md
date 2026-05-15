---
name: nali-security-no-secrets
description: Prevent secret exposure, unsafe env usage, and sensitive coordinate leakage.
---

## When To Use
Use for env vars, API adapters, Supabase clients, public routes, exports, alerts, and logs.

## Inspect First
`.gitignore`, `src/lib/config/env.ts`, `src/lib/supabase/`, `src/lib/security/`, `docs/API_ENV_SETUP.md`.

## Required Checks
No `.env.local` committed, no service role in client bundle, optional provider keys server-side only, sensitive species policy applied.

## Do Not Do
Do not print secrets, create credentials, or expose exact CR/EN public coordinates.

## Verification
Use `rg` for secret-like keys and `NEXT_PUBLIC_` usage before staging.

## Expected Output
Safe adapters and docs that mark unconfigured services honestly.

## Token Efficiency
Use targeted secret scans instead of broad file reads.
