# Camera Trap And Survey Protocols

Status date: 2026-05-15.

## Live

Type-level scaffolds exist in `src/lib/survey-protocols/index.ts` and `src/lib/field-templates/index.ts`.

## Scaffolded Protocols

- Camera trap batch mode.
- Transect mode.
- Point count.
- Patrol route.
- Timed survey.

## Required Metadata

Each protocol defines required metadata such as camera/deployment IDs, observer, time window, route, effort minutes, GPS points, and media checksum.

## Requires API Keys

None for scaffolds. Future camera trap AI may require separate model service setup.

## Requires Edge/Cron Activation

None yet.

## Unproven

- No production batch upload UI.
- No SpeciesNet/MegaDetector/BirdNET local integration.
- No validated Indonesian survey SOP templates.

## Must Not Be Claimed

Do not claim production camera trap automation or survey protocol compliance until UI, validation, export, and pilot checks exist.
