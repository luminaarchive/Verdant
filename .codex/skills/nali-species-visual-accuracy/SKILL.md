---
name: nali-species-visual-accuracy
description: Prevent misleading species imagery in NaLI public and app UI.
---

## When To Use
Use when editing species cards, demo species, visuals, image assets, or alt text.

## Inspect First
`src/lib/species/speciesVisuals.ts`, `public/species/`, `tests/field-intelligence/species-visuals.test.cjs`, `src/lib/demo/species.ts`.

## Required Checks
Pongo must never show panda. Indonesian species must use verified local visuals or evidence-card fallback. Alt text must match the species.

## Do Not Do
Do not use panda, zebra, cheetah, generic safari, or misleading placeholders.

## Verification
Run `npm run test:field-intelligence` and inspect affected images if changed.

## Expected Output
Verified visual mapping or explicit no-photo fallback.

## Token Efficiency
Use `rg` for species names and forbidden terms.
