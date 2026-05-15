---
name: nali-product-positioning
description: Keep NaLI positioned as Indonesia-first wildlife field intelligence, not a chatbot or generic AI SaaS.
---

## When To Use
Use for landing copy, docs, README, SEO, pricing, public demo, and product architecture decisions.

## Inspect First
`DESIGN.md`, `src/app/page.tsx`, `src/lib/i18n/translations/en.ts`, `src/lib/i18n/translations/id.ts`, `docs/NALI_AGENTIC_GAP_ANALYSIS.md`.

## Required Checks
Use `rg` for "chatbot", "wrapper", "just now", "realtime", "#1", "testimonial", "NGO", "university". Confirm claims are implemented or labeled planned/scaffolded.

## Do Not Do
Do not invent deployments, users, institutions, payment status, live integrations, realtime data, or legal admissibility.

## Verification
Run affected tests plus `npm run check:i18n` after copy changes. For landing changes, use Playwright only on `/` and affected language/mobile states.

## Expected Output
Concise positioning that says NaLI is source-backed, reviewable, exportable field intelligence for Indonesian conservation workflows.

## Token Efficiency
Read targeted files only. Summarize findings; do not paste whole translation files.
