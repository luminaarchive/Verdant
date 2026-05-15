# NaLI Data Source Matrix

Status date: 2026-05-15.

| Name | Purpose | URL/docs | Auth required? | Free/paid? | API key required? | Env var | Risk | Status | Priority | Safe fallback | MVP recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NaLI golden set | Public demo fallback | `src/lib/demo/species.ts` | No | Local | No | none | Can go stale | Live | High | None | Keep small, curated, labeled demo |
| GBIF API | Taxonomy/occurrence | https://techdocs.gbif.org/en/openapi/ | Mostly no | Free | No | none | Rate limits, taxonomic ambiguity | Live bridge | High | Golden set | Cache and cite |
| IUCN Red List API | Status/threats/habitat/actions | https://api.iucnredlist.org/ | Yes | Free registration | Yes | `IUCN_API_KEY` | Token/caching/terms | Unconfigured unless key exists | High | Golden set | Key-gated bridge |
| eBird | Bird taxonomy/occurrence | https://documenter.getpostman.com/view/664302/S1ENwy59 | Yes | Free key | Yes | `EBIRD_API_KEY` | Bird-only, context misuse | Unconfigured unless key exists | Medium | Manual bird notes | Add cached server route later |
| iNaturalist | Community observations | https://www.inaturalist.org/api | No for public reads | Free | No | none | Not authoritative | Live bridge | Medium | Golden set | Label as community signal |
| EOL | Descriptions/traits | https://api.eol.org/ | No for public search | Free | No | none | Copyright/summarization | Live bridge | Low | Omit description | Summarize with source |
| Catalogue of Life | Taxonomy cross-check | https://www.catalogueoflife.org/tools/api | Sometimes | Free/open access | No for basic | none | Maintenance/API changes | Live bridge | Medium | GBIF | Cross-check only |
| BirdNET | Audio ID | https://github.com/birdnet-team/BirdNET-Analyzer | Depends deployment | Code open, models NC terms | If hosted | `BIRDNET_API_KEY` | Model/license/runtime | Scaffolded | Medium | Manual audio notes | Separate service later |
| NASA FIRMS | Fire hotspots | https://firms.modaps.eosdis.nasa.gov/api/ | Yes MAP_KEY | Free key | Yes | `NASA_FIRMS_API_KEY` | False positives/rate limits | Scaffolded | Medium | No threat layer | Cron after key/product policy |
| Global Forest Watch | Deforestation alerts | https://vizzuality.github.io/gfw-doc-api/ | Usually | Dataset-dependent | Maybe | `GFW_API_KEY` | Terms/dataset choice | Scaffolded | Medium | No deforestation layer | Choose dataset first |
| PostGIS | Radius queries | https://postgis.net/docs/ST_DWithin.html | DB | Supabase | No | none | RLS/security definer mistakes | Migration scaffold | High | Own records only | Use RPC with redaction |
| H3 | Grid anomaly | https://github.com/uber/h3-js | No | OSS | No | none | Sparse baselines | Installed | High | Region fallback | Use res7 MVP |
| Darwin Core | Biodiversity export | https://dwc.tdwg.org/terms/ | No | Open standard | No | none | Bad mapping | Implemented | High | CSV only | Verified-only export |

## Live

Golden set, GBIF public bridge, iNaturalist bridge, EOL search bridge, Catalogue of Life bridge, H3 code, Darwin Core helpers.

## Scaffolded

IUCN/eBird/BirdNET/FIRMS/GFW provider adapters and health states.

## Requires API Keys

`IUCN_API_KEY`, `EBIRD_API_KEY`, `NASA_FIRMS_API_KEY`, `GFW_API_KEY`, `BIRDNET_API_KEY`.

## Requires Edge/Cron Activation

FIRMS/GFW scheduled imports and any production threat event ingestion.

## Unproven

Provider rate limits, production cache policy, live Supabase validation, scheduled imports.

## What Must Not Be Claimed

Source context is not a verified field observation. Threat pulse is indicative, not an official assessment.
