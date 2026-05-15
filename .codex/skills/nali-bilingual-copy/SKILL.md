---
name: nali-bilingual-copy
description: Maintain complete English and Indonesian copy coverage for NaLI.
---

## When To Use
Use when adding UI text, docs summaries, disclaimers, or SEO copy.

## Inspect First
`src/lib/i18n/translations/en.ts`, `src/lib/i18n/translations/id.ts`, `scripts/check-i18n-coverage.cjs`.

## Required Checks
Add both EN and ID text. Allowed shared terms include NaLI, Latin species names, GBIF, IUCN, GPS, API, NASA FIRMS, Global Forest Watch, H3, Darwin Core.

## Do Not Do
Do not leave English operational sentences in Indonesian UI.

## Verification
Run `npm run check:i18n`.

## Expected Output
Bilingual, field-appropriate copy with honest uncertainty.

## Token Efficiency
Patch only relevant translation branches.
