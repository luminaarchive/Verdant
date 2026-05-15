# Hugging Face Dataset Research

Status date: 2026-05-15.

| Dataset | URL | Purpose for NaLI | Decision | Risk |
| --- | --- | --- | --- | --- |
| Qasper | https://huggingface.co/datasets/allenai/qasper | Scientific QA with supporting evidence over papers | Reference only for evidence-grounded answer format | NLP domain, not biodiversity field ops |
| SciDQA | https://huggingface.co/datasets/yale-nlp/SciDQA | Scientific paper QA examples | Reference only | Dataset/license/domain review needed |
| Scientific Papers | https://www.tensorflow.org/datasets/catalog/scientific_papers | Long scientific paper summarization (arXiv/PubMed) | Reference only | Not directly compatible with field decision format |
| ClimateQA / ClimateQ&A collections | https://huggingface.co/ClimateQA/datasets | Climate/environment QA style | Reference only | Climate domain, not species field workflow |
| UCSD-GENIE/ClimaQA | https://huggingface.co/datasets/UCSD-GENIE/ClimaQA | Climate QA benchmark | Reference only | Verify license/scope before use |
| Wildlife/camera trap datasets | See `docs/GITHUB_RESEARCH_FOR_NALI.md` | Future visual/audio model research | Reference only | Large files, mixed licenses, not for Next runtime |

## Live

Only local synthetic NaLI JSONL examples are present.

## Scaffolded

Dataset research identifies candidates for format inspiration, not ingestion.

## Requires API Keys

None for local examples. Hugging Face access tokens may be needed for gated datasets but are not configured.

## Requires Edge/Cron Activation

None.

## Unproven

No biodiversity-specific Indonesian scientific QA dataset was validated as fit for NaLI training in this pass.

## What Must Not Be Claimed

Do not claim these datasets were used for model training. Do not ingest full copyrighted papers without license review.
