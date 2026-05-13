# NaLI Engineering Guide

NaLI is conservation-grade ecological intelligence infrastructure. Engineering decisions should favor traceability, reproducibility, operational clarity, and field reliability over novelty or abstraction.

## Architecture Overview

The core runtime follows this path:

```text
Observation Input
-> Provider Execution
-> Signal Generation
-> Ecological Reasoning
-> Confidence Calibration
-> Conservation Prioritization
-> Review Recommendation
-> Case Escalation
-> Persistence
-> Event Emission
```

Providers produce signals. They do not define ecological truth. Reasoning modules synthesize, calibrate, contextualize, and persist auditable interpretation.

## Orchestrator Lifecycle

The orchestrator:

1. Creates an `orchestrator_runs` record.
2. Executes provider tools in deterministic order.
3. Persists `analysis_runs`.
4. Converts provider outputs into structured modality signals.
5. Synthesizes ecological reasoning.
6. Persists separate `signal_snapshot` and `reasoning_snapshot` values.
7. Emits traceable observation events.
8. Creates field cases when escalation rules require operational follow-up.

Every run must preserve `reasoning_trace_id`.

## Reasoning Pipeline

Reasoning modules live under `src/lib/agent/reasoning/`:

- `multi-modal-fusion`: combines provider and contextual signals without simple averaging.
- `seasonality`: validates seasonal, migration, breeding, and activity timing.
- `habitat`: evaluates habitat consistency and fragmentation pressure.
- `conservation-priority`: calculates conservation significance.
- `provider-conflicts`: classifies taxonomy, temporal, habitat, and acoustic conflicts.
- `operational-runtime`: builds persisted signal and reasoning snapshots.
- `ecological-memory`, `pattern-detection`, `signal-graph`: support longitudinal intelligence.

Outputs should remain concise, structured, and evidence-linked.

## Provider Contracts

Providers belong behind abstraction boundaries. Do not tightly couple provider APIs into the orchestrator.

Provider outputs should include:

- provider/tool name
- version
- status
- latency
- confidence or score breakdown
- raw output summary
- error state when applicable

Provider outputs are signals, not final interpretation.

## Longitudinal Intelligence Flow

Longitudinal modules reason across repeated observations:

```text
Reasoning History
-> Regional Baselines
-> Pattern Detection
-> Signal Graph
-> Case Correlation
-> Alert Generation
-> Ecosystem Interpretation
```

This layer supports anomaly clustering, confidence drift, regional pressure signals, and field case correlation.

## Debugging Workflow

Use structured logging and optional debug tracing:

- `src/lib/logger` for `info`, `warn`, `error`, and production-gated `debug`.
- `src/lib/debug` for provider, orchestration, reasoning, and alert timing.
- `src/lib/config/flags.ts` for development feature flags.

Useful flags:

- `NALI_ENABLE_DEBUG_TRACING=true`
- `NALI_ENABLE_MOCK_PROVIDERS=true`
- `NALI_ENABLE_LONGITUDINAL_REPLAY=true`
- `NALI_ENABLE_VERBOSE_REASONING_LOGS=true`

Production defaults should remain quiet unless explicitly enabled.

## Testing Workflow

Primary verification commands:

```bash
npm run lint
npm run format:check
npm run typecheck
npm run build
npm run test:reasoning
npm run test:longitudinal
npm run test:golden
npm run verify
```

Test helpers live in `tests/helpers/` and provide reusable observation, reasoning, provider, temporal, and habitat fixtures.

Performance baselines:

```bash
npm run bench
```

Benchmarks establish rough runtime baselines. They are not pass/fail optimization targets.

## Formatting And Commit Workflow

Formatting is handled by Prettier:

```bash
npm run format
npm run format:check
```

Pre-commit uses Husky and lint-staged. It runs only ESLint and Prettier on changed files to keep commits fast.

## Release Verification Flow

Before release:

1. Confirm required environment variables are present.
2. Apply Supabase migrations in order.
3. Run `npm run verify`.
4. Run `npm run format:check`.
5. Check `/api/health`.
6. Smoke test protected routes.
7. Smoke test observation submission, archive, observation audit, monitoring, cases, and alerts.

See `docs/RELEASE_QA.md` and `docs/DEPLOYMENT.md` for operational checklists.
