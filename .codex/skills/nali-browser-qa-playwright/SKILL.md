---
name: nali-browser-qa-playwright
description: Use Playwright only on affected NaLI routes for visual, console, and overflow QA.
---

## When To Use
Use after frontend changes or before release QA.

## Inspect First
Affected page/component files, `DESIGN.md`, and existing screenshots/logs if relevant.

## Required Checks
Desktop and mobile for affected routes, no console errors, no horizontal overflow, correct demo labels, no fake realtime language, correct species visuals.

## Do Not Do
Do not run broad browser crawls when one route changed. Do not stage screenshots unless intentionally needed.

## Verification
Capture screenshots only for issues or required final QA. Record viewport and route tested.

## Expected Output
Short QA evidence with pages, screenshots, console status, and issues.

## Token Efficiency
Use snapshots before screenshots when checking structure.
