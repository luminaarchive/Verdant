---
name: nali-agentic-orchestrator
description: Keep NaLI's agentic workflow auditable, deterministic when keys are missing, and not hype-driven.
---

## When To Use
Use for analysis orchestration, source synthesis, patrol planning, voice parsing, review recommendation, and evidence workflows.

## Inspect First
`src/lib/agent/core/orchestrator.ts`, `src/lib/patrol-planner/`, `src/lib/scientific-bridge/`, `src/lib/evidence/`.

## Required Checks
Every agentic output needs evidence, confidence, uncertainty, review status, fallback path, and source metadata.

## Do Not Do
Do not make public expensive AI calls. Do not claim full automation for CR/sensitive/wildlife-crime cases.

## Verification
Run targeted reasoning/field-intelligence tests and typecheck.

## Expected Output
Decision-grade, reviewable outputs with deterministic fallback.

## Token Efficiency
Inspect only affected reasoning modules and tests.
