---
name: nali-github-deep-research
description: Evaluate GitHub repos/libraries before dependency or workflow-tool decisions.
---

## When To Use
Use before installing tools, adding libraries, or referencing wildlife AI repos.

## Inspect First
`docs/GITHUB_RESEARCH_FOR_NALI.md`, `docs/NALI_DEPENDENCY_POWER_STACK.md`, `package.json`, `package-lock.json`.

## Required Checks
Verify official repo URL, license, recent maintenance, install method, secrets, runtime weight, security risk, and fit for NaLI.

## Do Not Do
Do not install from GitHub blindly. Do not add generic agent frameworks or Python-heavy ML tools to the Next.js runtime.

## Verification
Record install decision: install now, install later, reference only, or avoid. Run `npm audit` after dependency installs when practical.

## Expected Output
Decision table with URL, purpose, license, auth, risk, fallback, and feature unlocked.

## Token Efficiency
Prefer GitHub API or README slices; avoid cloning unless essential.
