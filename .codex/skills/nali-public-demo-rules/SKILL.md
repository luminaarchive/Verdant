---
name: nali-public-demo-rules
description: Keep public demo useful, source-backed, safe, and clearly non-verified.
---

## When To Use
Use for landing demo, public API routes, golden-set species, and demo result UI.

## Inspect First
`src/components/landing/PublicSpeciesDemo.tsx`, `src/lib/demo/species.ts`, `src/app/api/demo/species/route.ts`, `tests/demo/public-species-demo.test.cjs`.

## Required Checks
No login required, rate-limited, no expensive public AI calls, golden-set fallback, demo labels in EN/ID, CTA to field observation.

## Do Not Do
Do not imply public demo is a verified field observation or realtime data.

## Verification
Run `npm run test:demo` and Playwright on `/`.

## Expected Output
Structured source-backed demo result with disclaimer.

## Token Efficiency
Focus on demo files only.
