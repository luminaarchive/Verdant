# Fine-Tuning Strategy

Status date: 2026-05-15.

NaLI should not fine-tune a model for factual species memorization. Facts must come from source-backed retrieval/provider bridges, review status, and persisted observations.

Fine-tuning, if approved later, is only for output discipline:

- Short.
- Metric-based.
- Actionable.
- Uncertainty-aware.
- Bilingual EN/ID.
- Source-grounded.
- Field-ready.

## Decision-Grade Output Format

EN:

```text
Decision:
Priority:
Confidence:
Evidence:
Risk:
Recommended Action:
Uncertainty:
Next Step:
```

ID:

```text
Keputusan:
Prioritas:
Keyakinan:
Bukti:
Risiko:
Rekomendasi:
Ketidakpastian:
Langkah Berikutnya:
```

## Live

- Synthetic JSONL examples in `data/fine-tuning/`.
- `scripts/prepare-finetune-dataset.cjs`.
- `scripts/evaluate-decision-grade-output.cjs`.
- `tests/fine-tuning/decision-grade-output.test.cjs`.

## Scaffolded

- Evaluation checks field presence and forbidden overclaims.
- No model training job exists.

## Safety Rules

- No private observations without consent/anonymization.
- No exact sensitive coordinates.
- No copyrighted full paper ingestion without license review.
- No user PII.
- No legal overclaim.
- No `verified` unless review status supports it.

## Test Scenarios Covered In Examples/Tests

- CR species with low confidence.
- Common species with high confidence.
- GPS outside known range.
- Poor image quality.
- First record/anomaly-style escalation.
- Threat pulse nearby.
- Reviewer disagreement.
- Missing evidence.
- Sensitive coordinate export.

## Unproven

- No real training set quality evaluation beyond local format checks.
- No hosted model or inference path.
- No comparison to base model.

## Must Not Be Claimed

Do not claim NaLI has a fine-tuned model until training, eval, safety review, and deployment are explicitly completed.
