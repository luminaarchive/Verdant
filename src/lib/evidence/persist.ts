import type { SupabaseClient } from "@supabase/supabase-js";
import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  buildCanonicalObservationPayload,
  createObservationHash,
  type ObservationHashInput,
  type ObservationHashResult,
} from "./hash";

type PersistObservationHashInput = ObservationHashInput & {
  createdBy: string;
  fallbackClient: SupabaseClient;
};

export async function persistObservationHash(
  input: PersistObservationHashInput,
): Promise<ObservationHashResult & { persisted: boolean; skippedReason?: string }> {
  const canonicalPayload = buildCanonicalObservationPayload(input);
  const hashResult = createObservationHash(canonicalPayload);
  const admin = getOptionalSupabaseAdminClient();
  const client = admin ?? input.fallbackClient;

  const { error } = await client.from("observation_hashes").insert({
    observation_id: input.observationId,
    hash: hashResult.hash,
    hash_algorithm: hashResult.algorithm,
    canonical_payload: hashResult.canonicalPayload,
    created_by: input.createdBy,
  });

  if (error) {
    return {
      ...hashResult,
      persisted: false,
      skippedReason: error.message,
    };
  }

  return { ...hashResult, persisted: true };
}
