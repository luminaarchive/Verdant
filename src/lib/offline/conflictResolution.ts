// NaLI Offline Engine: Conflict Resolution
// Preserves both sides of a field conflict so no record is silently overwritten.

export type ConflictFieldDiff = {
  field: string;
  clientValue: unknown;
  serverValue: unknown;
};

export type ConflictResolutionResult<T extends Record<string, unknown>> = {
  status: "clean" | "conflict";
  merged: T;
  serverVersion: T;
  clientVersion: T;
  diffs: ConflictFieldDiff[];
  requiresHumanReview: boolean;
};

const SERVER_AUTHORITY_FIELDS = new Set([
  "id",
  "user_id",
  "review_status",
  "verified_by_human",
  "evidence_hash",
  "created_at",
]);

const CLIENT_FIELD_FIELDS = new Set([
  "text_description",
  "latitude",
  "longitude",
  "accuracy_meters",
  "habitat",
  "behavior",
  "individual_count",
]);

function comparable(value: unknown) {
  return value === undefined ? null : value;
}

export class ConflictResolution {
  resolveObservationConflict<T extends Record<string, unknown>>(
    clientState: T,
    serverState: T,
  ): ConflictResolutionResult<T> {
    const diffs: ConflictFieldDiff[] = [];
    const merged = { ...serverState } as T;
    const keys = new Set([...Object.keys(clientState), ...Object.keys(serverState)]);

    for (const key of keys) {
      const clientValue = comparable(clientState[key]);
      const serverValue = comparable(serverState[key]);
      if (JSON.stringify(clientValue) === JSON.stringify(serverValue)) continue;

      diffs.push({ field: key, clientValue, serverValue });

      if (CLIENT_FIELD_FIELDS.has(key) && !SERVER_AUTHORITY_FIELDS.has(key)) {
        merged[key as keyof T] = clientState[key] as T[keyof T];
      }
    }

    return {
      status: diffs.length ? "conflict" : "clean",
      merged,
      serverVersion: serverState,
      clientVersion: clientState,
      diffs,
      requiresHumanReview: diffs.some((diff) => SERVER_AUTHORITY_FIELDS.has(diff.field)),
    };
  }
}

export const conflictResolution = new ConflictResolution();
