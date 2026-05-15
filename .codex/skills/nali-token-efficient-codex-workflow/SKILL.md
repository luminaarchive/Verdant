---
name: nali-token-efficient-codex-workflow
description: Keep Codex work on NaLI fast, scoped, and evidence-based.
---

## When To Use
Use on every non-trivial NaLI task.

## Inspect First
`AGENTS.md`, `DESIGN.md`, `docs/CURRENT_NALI_STATE.md`, and affected files from `rg`.

## Required Checks
Use `rg`/`rg --files` first. Read small slices. Prefer small patches. Run checkpoint tests.

## Do Not Do
Do not read the whole repo by default. Do not rewrite unrelated modules. Do not revert user changes.

## Verification
Before completion, run the command that proves the claim.

## Expected Output
Clear change summary with tests and remaining risks.

## Token Efficiency
Summarize long docs and avoid repeated file reads.
