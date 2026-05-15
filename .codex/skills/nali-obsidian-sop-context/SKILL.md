---
name: nali-obsidian-sop-context
description: Safely use local SOP/Obsidian-style context without committing private vault contents.
---

## When To Use
Use when the user wants SOP sync, local field manuals, or project memory from Obsidian/Markdown notes.

## Inspect First
`docs/WORKFLOW_POWER_TOOLS_RESEARCH.md`, `.gitignore`, `.codex/sop-context.local.json` if present.

## Required Checks
Read-only by default, configured local path ignored by git, no private vault files committed, summaries cite local filenames only when safe.

## Do Not Do
Do not copy private notes into repo. Do not create remote sync. Do not commit credentials.

## Verification
Run `git status --short` and confirm no vault paths are staged.

## Expected Output
Safe SOP summary or sync plan, never raw private note dumps.

## Token Efficiency
Use explicit file lists from the user; avoid scanning entire vaults.
