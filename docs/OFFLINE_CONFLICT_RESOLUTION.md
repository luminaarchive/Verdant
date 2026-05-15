# Offline Conflict Resolution

Status date: 2026-05-15.

## Live

`src/lib/offline/conflictResolution.ts` now preserves server version, client version, merged draft, and field diffs. Server-authority fields such as review status, evidence hash, user ID, and creation time are not silently overwritten.

## Scaffolded

- A polished UI diff is still needed.
- Conflict result can drive a review/resolve panel.

## Requires API Keys

None.

## Requires Edge/Cron Activation

None.

## Unproven

- Browser storage quota behavior across devices.
- Human factors for conflict resolution under field stress.

## Must Not Be Claimed

Do not claim seamless offline sync until conflict UI, retry behavior, and live Supabase flow are tested end to end.
