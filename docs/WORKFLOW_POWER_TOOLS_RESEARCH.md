# Workflow Power Tools Research

Status date: 2026-05-15.

NaLI evaluated four requested workflow tools. The decision is conservative: install only when a tool directly improves the current Codex workflow without adding unmanaged secrets, heavyweight runtimes, or duplicate agent orchestration. Useful concepts were extracted into local `.codex/skills/` and `DESIGN.md`.

| Tool | Official URL checked | Purpose | License | Maintenance signal | Secrets/API keys | Security/runtime risk | Fit for NaLI | Install decision | Integration decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| gsd-build/get-shit-done | https://github.com/gsd-build/get-shit-done / npm `get-shit-done-cc` | Spec-driven planning, context management, execution/verification loop | MIT | Active on 2026-05-15 by GitHub API/npm metadata | No required service key | Installer mutates agent runtime state and can duplicate existing Codex workflow | Strong concept fit, direct install not necessary | Not installed | Extracted into `.codex/skills/nali-gsd-workflow` |
| karpathy/llm-wiki | Requested repo `karpathy/llm-wiki` returned GitHub 404; closest researched repo: https://github.com/Astro-Han/karpathy-llm-wiki | LLM-maintained markdown wiki with raw sources, compiled pages, citations, linting | MIT on closest repo | Active community implementation | No required service key | Risk of committing private notes if vault/source policy is loose | Strong concept fit, exact requested repo unavailable | Not installed | Extracted safe read-only SOP plan into `.codex/skills/nali-obsidian-sop-context` |
| NousResearch/hermes-agent | https://github.com/NousResearch/hermes-agent | Standalone self-improving agent with skills, memory, messaging gateway, schedulers | MIT | Active on 2026-05-15 by GitHub API | Many optional provider/messaging keys | Heavy Python/uv/Node runtime, own agent runtime, messaging secrets, broad tool access | Useful concepts, poor direct fit inside this Next.js repo | Not installed | Extracted AutoResearch/skill/memory concepts into `.codex/skills/nali-autoresearch` |
| VoltAgent/awesome-design-md | https://github.com/VoltAgent/awesome-design-md | DESIGN.md examples for AI-readable design systems | MIT | Active on 2026-05-15 by GitHub API | No | Copying brand styles blindly can produce derivative/non-NaLI UI | Strong pattern fit, no package needed | Not installed | Created `DESIGN.md` and `.codex/skills/nali-design-system` |

## Security Risks Avoided

- No third-party agent runtime was installed into the app runtime.
- No new provider, messaging, or automation secrets were requested.
- No private Obsidian/SOP vault contents were copied.
- No generic agent framework was added to `package.json`.

## Safe SOP Sync Plan

Live: `.gitignore` excludes `.codex/sop-context.local.json` and `.codex/sop-cache/`.

Scaffolded workflow:

1. User creates `.codex/sop-context.local.json` with explicit local paths.
2. Codex reads only explicitly allowed files.
3. Codex summarizes operational guidance without copying private notes.
4. `git status --short` must confirm no vault paths or cache files are staged.

Unproven: no vault path is configured in this repo.

## AutoResearch Workflow

Use `.codex/skills/nali-autoresearch` for biodiversity APIs, GitHub repo decisions, field problem research, SEO/source research, and conservation data source matrices.

## What Must Not Be Claimed

- GSD is not installed as a live NaLI dependency.
- Hermes Agent is not installed or running.
- `karpathy/llm-wiki` exact repo was not found; only an unofficial community implementation was researched.
- DESIGN.md is a local source of truth, not proof of UI QA by itself.

## Readiness Summary

- Live: local `DESIGN.md` and `.codex/skills/nali-*` workflow skills.
- Scaffolded: SOP/Obsidian sync plan and AutoResearch workflow.
- Requires API keys: none for local workflow skills.
- Requires Edge/Cron activation: none.
- Unproven: no external GSD/Hermes/LLM-wiki runtime execution in this repo.
- Must not be claimed: external workflow tools are installed as app dependencies.
