# Field Problem Research

Status date: 2026-05-15.

Sources used include SMART (https://smartconservationtools.org/), EarthRanger (https://www.earthranger.com/), KoBoToolbox docs, ODK docs, CyberTracker app docs, GBIF, TDWG Darwin Core, PostGIS, NASA FIRMS, Global Forest Watch, BirdNET, and iNaturalist. No statistics are invented.

| Problem | Affected user | Current painful workflow | Why current tools are insufficient | NaLI solution | MVP priority | Future potential | Required data source | Required module | Selling point wording | Risk/limitation | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Species identification uncertainty | Rangers, students, researchers | Field notes and photos are reviewed later in chats/spreadsheets | Lookup tools rarely connect ID uncertainty to review/export workflow | Candidate, source context, uncertainty, review queue | High | Specialist routing | Golden set, GBIF, IUCN, iNat | scientific bridge, review | "Every candidate carries evidence and uncertainty." | Source context is not verification | Partial |
| Manual field notes | Rangers, assistants | Typed or paper notes after patrol | Notes lose structure, GPS, evidence type, and review status | Observation form, voice assist, templates | High | SOP-specific templates | Field templates | VoiceToForm, field templates | "Turn field speech into reviewable form fields." | Speech noise/browser support | Partial |
| Poor evidence structure | NGOs, reviewers | Media, notes, GPS, decisions split across folders | Hard to audit/export/escalate | Observation bundle, hash, review actions | High | Case file export | Supabase, storage | evidence, review | "A record is an evidence package, not a loose photo." | Hash is not legal proof | Partial |
| Offline/low signal | Rangers, survey teams | Wait for signal or duplicate notes | Existing tools may not align to NaLI review/source model | Offline queue, conflict resolver | High | Offline maps/sync diffs | IndexedDB/Supabase | offline | "No silent overwrite when signal returns." | Conflict UI still minimal | Partial |
| GPS sensitivity | Rangers, NGOs | Coordinates shared in chats/exports | Sensitive species exposure risk | Sensitive species policy and export redaction | High | Access log/legal workflow | IUCN status, policy | security policy, exports | "Protect exact locations by default." | Policy must be enforced on every surface | Partial |
| Slow reports | NGO coordinators, teachers | Weekly reports assembled manually | Spreadsheet summaries miss hashes/anomalies/threats | Report generator foundation, DwC export, WhatsApp text | Medium | Scheduled reports | observations, threats | export, share | "Field records become reports without losing evidence." | PDF/report UI foundation only | Scaffolded |
| Lack of audit trail | Reviewers | Decisions buried in messaging | No repeatable reason trail | review_actions, evidence hash, /verify | High | Reviewer reputation | Supabase | review, evidence | "Every validation decision is traceable." | Reviewer roles need live setup | Partial |
| Fragmented observation history | New ranger, patrol lead | Institutional memory held by senior staff | Hard to know prior records nearby | 500m location memory | High | Cross-team anonymized memory | PostGIS | location-memory RPC | "This location starts with memory, not a blank page." | Sensitive coordinates redaction | Partial |
| Anomaly detection | Reviewers, patrol coordinators | Unusual records spotted informally | No grid baseline | H3 first-record/unusual flags | High | Seasonal baselines | NaLI archive | anomaly/h3 | "Flag what is unusual for NaLI's own archive." | Sparse archive overflags | Partial |
| Threat context | Patrol coordinators | FIRMS/GFW checked separately | Wildlife and threat layers are disconnected | threat_events and threat pulse | Medium | Scheduled import/cron | FIRMS, GFW | threats | "Wildlife observations plus indicative threat pulse." | Not official assessment | Scaffolded |
| Observer credibility | Reviewer/admin | Quality history not visible | Trust is informal or social | Professional score, no leaderboard | Medium | Specialist weighting | review_actions | credibility | "Trust score based on evidence quality, not gamification." | Must not bypass sensitive review | Scaffolded |
| Darwin Core export | Researchers, students | Manual CSV mapping | Easy to publish inconsistent data | Verified-only DwC CSV/DwC-A | High | GBIF-ready governance | TDWG Darwin Core | export | "Verified observations can leave NaLI as biodiversity data." | Publishing governance future | Partial |
| Case escalation | NGOs, ranger leads | Urgent cases passed in chat | Context and hashes get lost | field_cases/review queue/patrol plan | Medium | Wildlife crime support bundle | observations, review, threat | cases | "Escalate a case with evidence and limits." | Legal use needs experts | Partial |
| Bilingual scientific tooling | Students, teachers, rangers | English-only scientific tools plus local notes | Translation gaps slow training | EN/ID translations and docs | High | Local SOP packs | i18n | translations | "Scientific workflow in English and Indonesian." | Requires continuous copy checks | Partial |

## Readiness Summary

- Live: public demo, visuals, H3/hash/export/voice/patrol code foundations.
- Scaffolded: threat pulse imports, report generator, camera trap/survey protocols, area workspace.
- Requires API keys: IUCN, eBird, FIRMS, GFW, Anthropic, BirdNET.
- Requires Edge/Cron activation: FIRMS/GFW scheduled imports and optional report jobs.
- Unproven: field pilots, low-signal usability, live Supabase validation in this environment.
- Must not be claimed: real deployments, official threat assessment, or legal admissibility.
