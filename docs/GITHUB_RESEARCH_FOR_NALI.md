# GitHub / Repo / API Research For NaLI

Status date: 2026-05-15.

| Candidate | Repo/docs URL | Purpose | Why it matters for NaLI | Decision | License visible | Auth/API key | Env var | Cost/risk | Fallback | Feature unlocked | Token/dependency impact |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GBIF API | https://techdocs.gbif.org/en/openapi/ | Taxonomy/occurrence | Source-backed species context | Install none; live bridge | API docs/open data | Mostly no auth | none | Rate limits/ambiguity | Golden set | Taxonomy normalization | No dependency |
| Darwin Core / TDWG | https://dwc.tdwg.org/terms/ | Biodiversity export standard | Verified export format | Implement now | Open standard | No | none | Bad mapping pollutes data | CSV fallback | DwC CSV/DwC-A | No dependency beyond JSZip |
| IUCN Red List API | https://api.iucnredlist.org/ | Conservation status/threats | Decision-grade risk context | Key-gated bridge | API terms | Yes | `IUCN_API_KEY` | Token/caching | Golden set | Status/threat/habitat context | No dependency |
| eBird API | https://documenter.getpostman.com/view/664302/S1ENwy59 | Bird observations/taxonomy | Bird survey context | Install later/key-gated | API docs | Yes | `EBIRD_API_KEY` | Bird-only/context misuse | Manual bird notes | Bird occurrence signal | No dependency |
| iNaturalist API | https://www.inaturalist.org/api | Community observations | Citizen-science signal | Reference/live bridge | API docs | No for public reads | none | Not authoritative | Golden set | Community context | No dependency |
| EOL API | https://api.eol.org/ | Descriptions/traits | Species description discovery | Reference/live bridge | Terms vary | No | none | Copyright/summary limits | Omit description | Descriptive context | No dependency |
| Catalogue of Life | https://www.catalogueoflife.org/tools/api | Taxonomy cross-check | Name reconciliation | Reference/live bridge | API docs | Sometimes for downloads | none | Maintenance notes | GBIF | Taxonomy cross-check | No dependency |
| BirdNET Analyzer | https://github.com/birdnet-team/BirdNET-Analyzer | Bioacoustics | Audio evidence future | Reference only | Code MIT, models CC BY-NC-SA | No local, depends hosted | `BIRDNET_API_KEY` if hosted | Python/model/license weight | Manual audio notes | Bird audio inference | Do not install in Next runtime |
| BirdNET-Go | https://github.com/tphakala/birdnet-go | Bioacoustic station app | Field audio benchmark | Reference only | Check before use | Depends | none yet | Separate runtime | Manual audio | Future station integration | No dependency |
| whoBIRD | https://github.com/woheller69/whoBIRD | Android BirdNET app | Offline audio benchmark | Reference only | GPL-3.0, model NC terms | No | none | GPL/runtime mismatch | None | UX benchmark | Avoid dependency |
| ODK | https://docs.getodk.org/ | Field forms/offline | Benchmark for structured collection | Reference only | OSS ecosystem | Server optional | none | Not NaLI-specific | NaLI form templates | Form architecture | No dependency |
| KoBoToolbox | https://support.kobotoolbox.org/ | Offline web/mobile forms | Benchmark for low-signal collection | Reference only | OSS/service | Account optional | none | External platform | NaLI offline queue | Offline expectations | No dependency |
| CyberTracker | https://cybertracker.org/ | Wildlife field data app | Benchmark for ranger workflows | Reference only | App/platform terms | No | none | External app | NaLI templates | Field UX | No dependency |
| SMART | https://smartconservationtools.org/ | Patrol/reporting | Benchmark conservation ops | Reference only | Free/open-source claims from source | Platform setup | none | Mature external platform | NaLI differentiates source-backed evidence | Patrol/report ideas | No dependency |
| EarthRanger | https://www.earthranger.com/ | Protected-area operations | Benchmark realtime/offline ops | Reference only | Platform | Account/setup | none | Do not overclaim parity | NaLI focused source/evidence workflow | Integration target future | No dependency |
| PostGIS | https://postgis.net/docs/ST_DWithin.html | Spatial DB | 500m memory/RPC | Use now | OSS | DB extension | none | RLS mistakes | Own records | Location memory | Supabase extension |
| H3 / h3-js | https://github.com/uber/h3-js | Hex grid | Anomaly flags | Installed | Apache-2.0 | No | none | Sparse baselines | Region IDs | H3 anomaly | Small dependency |
| NASA FIRMS | https://firms.modaps.eosdis.nasa.gov/api/ | Fire hotspots | Threat pulse | Key-gated scaffold | NASA API terms | Yes | `NASA_FIRMS_API_KEY` | False positives/rate limits | No threat layer | Fire context | No dependency |
| Global Forest Watch | https://vizzuality.github.io/gfw-doc-api/ | Deforestation alerts | Threat pulse | Key-gated scaffold | Dataset-dependent | Usually yes | `GFW_API_KEY` | Terms/dataset choice | No deforestation layer | Deforestation context | No dependency |
| JSZip | https://stuk.github.io/jszip/ | Zip files | DwC-A package | Installed | MIT/GPL dual historically; check package | No | none | Bundle size | CSV only | DwC-A | Already installed |
| exifr | https://github.com/MikeKovarik/exifr | EXIF metadata | Evidence metadata | Installed | MIT | No | none | GPS privacy | Ignore EXIF | Media metadata | Small dependency |
| jsPDF | https://github.com/parallax/jsPDF | PDF export | Patrol/report PDF | Installed | MIT | No | none | Bundle size | WhatsApp text | PDF export | Client dependency |
| WildlifeDatasets | https://github.com/WildlifeDatasets/wildlife-datasets | Animal re-ID datasets | Future individual ID research | Reference only | MIT | Dataset-specific | none | Large ML/data licenses | Manual review | Future re-ID | Do not install |
| wildlife-tools | https://github.com/WildlifeDatasets/wildlife-tools | Wildlife ML tools | Future re-ID training | Reference only | Check before use | Dataset/model-specific | none | Python/GPU weight | Manual review | Future ML | Do not install |
| MegaDetector | https://github.com/agentmorris/MegaDetector | Camera trap detection | Future camera trap pre-filter | Reference only | MIT repo | Model/download | none | Python/model runtime | Manual camera trap review | Batch detection | Do not install now |
| Google SpeciesNet | https://github.com/google/cameratrapai | Camera trap species classification | Future camera trap workflow | Reference only | Check package/model terms | Model/download | none | Python/GPU/runtime | Manual review | Camera trap predictions | Do not install now |
| GSD | https://github.com/gsd-build/get-shit-done | Agent workflow | Planning discipline | Extract concepts | MIT | No | none | Runtime mutation | Local skills | Workflow discipline | No dependency |
| LLM wiki | https://github.com/Astro-Han/karpathy-llm-wiki | Knowledge wiki | SOP context | Extract concepts | MIT | No | none | Private note leakage | Read-only SOP plan | Durable SOP summaries | No dependency |
| Hermes Agent | https://github.com/NousResearch/hermes-agent | Agent runtime | Research/memory ideas | Avoid install | MIT | Many optional | many | Heavy runtime/secrets | Local skills | AutoResearch patterns | No dependency |
| awesome-design-md | https://github.com/VoltAgent/awesome-design-md | DESIGN.md examples | UI source of truth | Extract concepts | MIT | No | none | Brand copying | NaLI DESIGN.md | UI consistency | No dependency |

## Readiness Summary

- Live: installed dependencies already in `package.json` plus `exifr`; local bridge/scaffold modules.
- Scaffolded: BirdNET, FIRMS/GFW, camera trap AI, workflow power tool concepts.
- Requires API keys: IUCN, eBird, FIRMS, GFW, Anthropic, hosted BirdNET.
- Requires Edge/Cron activation: threat imports and future report jobs.
- Unproven: production API quotas, model quality, and live provider responses under deployed env.
- Must not be claimed: direct installations of workflow power tools, mature-platform parity, or live AI wildlife model inference.
