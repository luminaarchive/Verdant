---
name: nali-field-operations-features
description: Build ranger/researcher field operations features with minimal useful UI and honest readiness.
---

## When To Use
Use for location memory, review queues, patrol planner, alerts, report generator, field templates, camera trap, surveys, and offline conflict.

## Inspect First
`src/components/observation/`, `src/app/(app)/`, `src/lib/field-templates/`, `src/lib/survey-protocols/`, `docs/FIELD_OPERATIONS_MANUAL.md`.

## Required Checks
Protect sensitive locations, preserve audit trails, support reviewer workflow, provide WhatsApp-friendly output where useful.

## Do Not Do
Do not overbuild UI or claim production readiness for scaffolds.

## Verification
Run affected tests, typecheck, and route-specific Playwright QA.

## Expected Output
Small operational increments that make fieldwork more structured and reviewable.

## Token Efficiency
Inspect route/component pair plus matching lib only.
