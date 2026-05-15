---
name: nali-seo-google-readiness
description: Keep NaLI technically crawlable without spam or ranking guarantees.
---

## When To Use
Use for metadata, JSON-LD, sitemap, robots, canonical URLs, and search-readiness docs.

## Inspect First
`src/lib/seo/site.ts`, `src/app/layout.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `docs/SEO_GOOGLE_SEARCH_READINESS.md`.

## Required Checks
Natural keywords, canonical, OG/Twitter, WebSite/SoftwareApplication schema, and no hidden text or doorway pages.

## Do Not Do
Do not guarantee rankings. Do not keyword stuff.

## Verification
Run `npm run seo:google-checklist` and inspect rendered metadata when routes change.

## Expected Output
Search-ready implementation with honest indexing checklist.

## Token Efficiency
Use route-specific checks.
