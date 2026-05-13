# NaLI Dependency Audit

This audit is intentionally conservative. It identifies cleanup candidates and risk areas without automatically removing packages from a working ecological intelligence runtime.

## Method

- Inspected `package.json`.
- Searched `src`, `tests`, `next.config.mjs`, and `eslint.config.mjs` for direct imports.
- Ran `npm ls --depth=0`.
- Attempted `npm outdated --depth=0`, but registry access failed in the current environment with `ENOTFOUND registry.npmjs.org`; no remote version claims are made here.

## Directly Referenced Runtime Packages

- `@anthropic-ai/sdk`: used by the vision provider.
- `@supabase/ssr`, `@supabase/supabase-js`: used by auth, API, and health/runtime checks.
- `framer-motion`: used by landing and observation workflow UI.
- `lucide-react`: used throughout operational UI.
- `next`, `react`, `react-dom`: core application runtime.
- `zod`: used by validation.

## Likely Cleanup Candidates

These packages are present in `dependencies` but were not found as direct imports in `src` or `tests` during this audit:

- `@radix-ui/react-label`
- `@radix-ui/react-select`
- `cheerio`
- `clsx`
- `docx`
- `inngest`
- `leaflet`
- `pdf-lib`
- `react-leaflet`
- `resend`
- `sharp`
- `tailwind-merge`
- `uuid`
- `zustand`

Recommended action: review each candidate against near-term roadmap and generated code paths before removal. Several may be intended for map, export, email, image, or durability work even if not currently imported.

## Tooling Notes

- `agent-browser` is a development dependency used for browser verification workflows. Keep only if the team actively uses it in QA.
- `eslint` and `eslint-config-next` are required for the Next 16-compatible lint workflow.
- `autoprefixer`, `postcss`, `tailwindcss`, and `@tailwindcss/postcss` support the styling pipeline.

## Local Node Modules Findings

`npm ls --depth=0` reported several extraneous native helper packages:

- `@emnapi/core`
- `@emnapi/runtime`
- `@emnapi/wasi-threads`
- `@napi-rs/wasm-runtime`
- `@tybys/wasm-util`

Recommended action: run a clean install in CI or a fresh local checkout before release verification:

```bash
rm -rf node_modules
npm ci
npm run verify
```

Do not remove lockfile entries manually.

## Risk Notes

- No AI framework packages such as LangChain, CrewAI, or AutoGPT-style orchestration libraries are present.
- The project should avoid adding generic agent frameworks because NaLI already owns its ecological reasoning and orchestration architecture.
- Optional provider packages should stay isolated behind provider contracts.
