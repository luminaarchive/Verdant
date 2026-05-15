# Codex MCP Stack

Status date: 2026-05-15. Command run: `codex mcp list --json`.

| Name | Status | Command/config | Purpose for NaLI | When to use | Risk | Token-saving value |
| --- | --- | --- | --- | --- | --- | --- |
| context7 | enabled | `npx -y @upstash/context7-mcp` | Current library/framework docs | Next.js, Supabase, SDK/API syntax | Query can be broad | Avoid stale API assumptions |
| playwright | enabled | `npx -y @playwright/mcp@latest` | Local route QA | Affected UI routes, console, screenshots, overflow | Creates screenshots/logs | Verifies changed surfaces only |
| github | enabled, not exposed as callable tool in this session | `https://api.githubcopilot.com/mcp/` | Repo/issue/PR research if callable | GitHub work | Auth/tool availability varies | Direct repo metadata when available |
| supabase | enabled | `https://mcp.supabase.com/mcp` | DB/RLS/storage validation | PostGIS, RLS, buckets, migrations | Avoid destructive SQL and secret exposure | Direct schema/advisor checks |
| vercel | enabled, OAuth | `https://mcp.vercel.com` | Deployment/platform docs | Cron, env, deployments | OAuth/project scope | Avoid web-search drift |
| telegram | enabled | bundled plugin | Messaging bridge plugin | Only if user asks | Access/secrets | Not used by default |
| firecrawl | enabled | `npx -y firecrawl-mcp` | Crawl/scrape docs/web pages | Research extraction | Likely key-gated | Reduces manual scraping once configured |
| exa | enabled | `npx -y exa-mcp-server` | AI search/deep web research | Broad source discovery | May require Exa key | Finds current sources quickly |
| deepwiki | enabled | `npx -y mcp-deepwiki` | GitHub repo understanding | Repo summaries | Summaries need verification | Saves repo scanning time |
| memory | enabled | `npx -y @modelcontextprotocol/server-memory` | Non-secret project memory | Durable non-secret facts | Never store secrets | Avoid repeated orientation |
| sequential-thinking | enabled | `npx -y @modelcontextprotocol/server-sequential-thinking` | Complex planning | Multi-phase decisions | Overkill for small tasks | Externalizes plan structure |

Installed this session: Firecrawl, Exa, DeepWiki, Memory, Sequential Thinking. The first parallel add raced config writes; only Sequential Thinking persisted. The remaining MCPs were added sequentially and confirmed.

Unavailable: Grep by Vercel MCP package was not clearly found by npm search, so it was not installed.

What must not be claimed: enabled MCPs do not prove third-party provider keys are configured or that integrations are live.

## Readiness Summary

- Live: MCP entries above are configured in Codex.
- Scaffolded: Firecrawl/Exa/DeepWiki/Memory need task-specific use before value is proven.
- Requires API keys: Firecrawl/Exa may require provider keys.
- Requires Edge/Cron activation: none.
- Unproven: GitHub MCP was not callable in this session despite being listed.
- Must not be claimed: MCP configuration is not proof of live NaLI data integrations.
