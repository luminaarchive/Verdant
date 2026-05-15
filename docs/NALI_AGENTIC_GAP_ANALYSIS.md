# NaLI Agentic Gap Analysis

Status date: 2026-05-15.

| Gap | Category | Feature | Data source | UI surface | Backend module | Validation requirement | Priority | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Public source-backed lookup | Partial/live | Golden-set demo + scientific bridge | NaLI golden set, GBIF/iNat/EOL/COL | Landing demo | `src/lib/demo`, `src/lib/scientific-bridge` | Demo/API tests, provider state checks | High | Must stay labeled demo |
| Correct species visuals | Live | Verified local species cards | Local assets/attribution | Landing evidence cards | `speciesVisuals.ts` | Species visual tests | High | Misleading image destroys trust |
| Location memory | Partial | Nearby observation RPC/panel | Supabase/PostGIS | Observe/detail | `get_observations_nearby`, `/api/location-memory` | Live DB validation | High | Sensitive coordinate leakage |
| Evidence hash | Partial | SHA-256 canonical payload | Observation/media metadata | Detail, `/verify` | `src/lib/evidence`, `observation_hashes` | Tests + live insert/read policy | High | Not automatic legal admissibility |
| H3 anomaly flags | Partial | First record/activity flags | NaLI archive | Detail/review/monitoring | `src/lib/anomaly` | Tests + archive depth | High | Sparse data overflags |
| Review queue | Partial | Reviewer/admin workflow | observations/anomaly/hash | `/review` | `review_actions`, roles | RLS/role validation | High | Do not invent reviewers |
| Darwin Core export | Partial | CSV/DwC-A | Verified observations | Detail/API | `src/lib/export` | Export tests | High | Sensitive coordinates need policy |
| Scientific bridge | Scaffolded/live mix | GBIF/IUCN/eBird/iNat/EOL/COL | External APIs | System/future demo | `src/lib/scientific-bridge` | Provider health + key setup | High | Source context is not verification |
| Threat integrations | Scaffolded | FIRMS/GFW events | FIRMS/GFW/NaLI reports | Map/monitoring future | `src/lib/threats` | API keys + cron/import logs | Medium | Not official assessment |
| Voice-to-form | Partial | Web Speech extraction | Browser API | Observe | `VoiceToForm` | Browser QA | Medium | Noisy field environments |
| Patrol planner | Partial | Deterministic fallback | observations/anomalies/threats | `/patrol-plan` | `src/lib/patrol-planner` | Route QA | Medium | Advisory only |
| Realtime alerts | Scaffolded | Supabase Realtime | `realtime_alerts` | Alerts/observe toast | `src/lib/realtime/alerts.ts` | Publication/RLS validation | Medium | No exact sensitive coordinates |
| Observer credibility | Scaffolded | Professional quality score | review_actions/user_scores | Future card | `src/lib/credibility` | Trigger tests/live validation | Medium | No leaderboard |
| Fine-tuning | Documented/scaffolded | Format adaptation only | synthetic JSONL | none | `data/fine-tuning`, scripts | Evaluator/test | Low | No factual memorization |

## Future Moat

NaLI becomes harder to replace as the archive grows: location memory, H3 baselines, reviewer actions, credibility scoring, case threads, source bridge cache, and export governance compound into an operational memory layer for Indonesian conservation teams.
