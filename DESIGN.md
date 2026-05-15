# NaLI Design System Source Of Truth

NaLI is a conservation operations system for Indonesia. Its UI must feel field-operational, source-backed, restrained, and reviewable. It must not feel like a generic AI chatbot, social feed, crypto dashboard, or static marketing page.

## Visual Theme

- Primary tone: utilitarian field intelligence, ecological evidence, institutional trust.
- Layout density: compact, scannable, dashboard-grade. Avoid oversized marketing cards inside app surfaces.
- Shape language: mostly square or 2-6px radius. Use 8px maximum unless an existing component requires otherwise.
- Motion: quiet transitions only. Motion must clarify state changes, not decorate.
- Imagery: Indonesian species only. No panda, zebra, cheetah, generic safari placeholders, or misleading stock imagery.

## Color Roles

- Forest ink: `#10231b` for primary text and critical navigation.
- Canopy green: `#315f45` for trusted actions and verified states.
- Moss: `#6f7d42` for secondary ecological accents.
- Stone: `#f7f5ee`, `#e7e1d5`, `#cfc6b7` for field-paper surfaces and borders.
- Alert amber: `#f2b84b` for review-needed states.
- Rare red: `#9f2f2f` for CR/sensitive warnings only.
- Data cyan: `#49a7b8` for external source signals.

Avoid one-note palettes. Do not let the interface become only green/brown/beige; pair earth neutrals with crisp data accents.

## Typography

- Use the existing app font stack unless the project deliberately adds a self-hosted font.
- No negative letter spacing. Use compact uppercase labels with positive tracking only for metadata.
- Hero type belongs only on landing hero. Dashboards, review queues, and system pages use tighter headings.
- Scientific names use italic text where context allows.

## Components

- Buttons: icon + label for actions; icon-only only when tooltip/aria-label is clear.
- Cards: repeated records, modals, evidence bundles, and status tiles only. Do not nest cards in cards.
- Tables/lists: prefer dense rows for review queues, provider health, exports, and location memory.
- Badges: reserve for status, evidence type, source, IUCN category, anomaly flag, and review state.
- Maps: protect sensitive coordinates by default. Never expose exact CR/EN public locations.
- Empty states: operational next action, not marketing copy.

## Required UI Labels

- Demo result: `Public demo · not a verified field observation`
- Demo result ID: `Demo publik · bukan observasi lapangan terverifikasi`
- H3 note EN: `Flags are based on NaLI's available records. Accuracy improves as more observations are submitted.`
- H3 note ID: `Flag ini berdasarkan catatan NaLI yang tersedia. Akurasi meningkat seiring bertambahnya observasi.`
- Evidence hash disclaimer EN/ID must match `src/lib/evidence/hash.ts`.
- Threat pulse disclaimer EN/ID must match `src/lib/threats/index.ts`.

## Do Not Do

- Do not use fake realtime wording such as `just now`, `updated just now`, or `live field data` unless backed by persisted backend data.
- Do not invent users, NGOs, universities, deployments, usage counts, testimonials, or payments.
- Do not show public exact coordinates for sensitive species.
- Do not create a chatbot-first interface. NaLI is an evidence workflow system.
- Do not use decorative gradient orbs, bokeh blobs, or generic AI SaaS purple-blue gradients.

## Agent Prompt Guide

When building NaLI UI, first inspect this file, existing components, translations, and affected routes. Build the actual workflow surface first. Public pages must show the demo, source-backed evidence, correct species visuals, privacy posture, planned pricing, and early access honestly.
