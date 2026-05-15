---
name: nali-conservation-data-sources
description: Maintain source-backed biodiversity, threat, audio, and export data source decisions.
---

## When To Use
Use for GBIF, IUCN, eBird, iNaturalist, EOL, Catalogue of Life, FIRMS, GFW, Darwin Core, BirdNET, and future datasets.

## Inspect First
`docs/NALI_DATA_SOURCE_MATRIX.md`, `src/lib/scientific-bridge/`, `src/lib/threats/`, `docs/API_ENV_SETUP.md`.

## Required Checks
Confirm source authority, auth/API key, free/paid status, env var, fallback, confidence contribution, and source label.

## Do Not Do
Do not treat community data as authoritative truth. Do not fail the app when optional keys are missing.

## Verification
Providers must return live/configured/unconfigured/degraded/fallback and never leak secrets.

## Expected Output
Auditable provider behavior and docs that separate source context from field verification.

## Token Efficiency
Use provider-specific files; avoid reading unrelated agent modules.
