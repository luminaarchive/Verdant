---
name: nali-mcp-tool-selection
description: Select MCP tools for NaLI research, QA, database, and deployment work without wasting tokens.
---

## When To Use
Use when choosing between Context7, Playwright, Supabase, GitHub, Vercel, Firecrawl, Exa, DeepWiki, Memory, or Sequential Thinking.

## Inspect First
`docs/CODEX_MCP_STACK.md`, `codex mcp list`, affected task files.

## Required Checks
Use Context7 for library docs, Playwright for affected local routes, Supabase for DB/RLS/storage, Vercel for Vercel platform questions, web for current external facts.

## Do Not Do
Do not use Supabase MCP for non-DB work. Do not browse when local code answers the question. Do not expose secrets in tool prompts.

## Verification
Update MCP status docs after installs/failures. Record tools unavailable in the current session.

## Expected Output
Minimal tool chain with reason, risk, and token-saving value.

## Token Efficiency
Start with `rg`, then use the narrowest MCP.
