---
name: nali-fine-tuning-strategy
description: Keep NaLI domain adaptation safe, format-focused, and non-factual.
---

## When To Use
Use for fine-tuning docs, dataset examples, evaluation scripts, and model adaptation decisions.

## Inspect First
`docs/FINE_TUNING_STRATEGY.md`, `docs/HUGGINGFACE_DATASET_RESEARCH.md`, `data/fine-tuning/`, `scripts/evaluate-decision-grade-output.cjs`.

## Required Checks
Fine-tuning shapes output format only. Use retrieval/source bridges for facts. Enforce EN/ID decision-grade fields.

## Do Not Do
Do not ingest private observations, exact sensitive coordinates, PII, full copyrighted papers, or unreviewed "verified" claims.

## Verification
Run `node scripts/evaluate-decision-grade-output.cjs` and `npm run test:fine-tuning`.

## Expected Output
Safe synthetic examples and evaluation results.

## Token Efficiency
Work on JSONL rows and evaluator only.
