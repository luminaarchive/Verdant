import { createHash } from "node:crypto";

export type ObservationHashAlgorithm = "sha256";

export type ObservationHashInput = {
  observationId: string;
  serverTimestamp: string;
  userId: string;
  latitude: number | null;
  longitude: number | null;
  textDescription?: string | null;
  mediaChecksum?: string | null;
  speciesRefId?: string | null;
};

export type CanonicalObservationPayload = {
  observation_id: string;
  server_timestamp: string;
  user_id: string;
  latitude: number | null;
  longitude: number | null;
  text_description_hash: string | null;
  media_checksum: string | null;
  species_ref_id: string | null;
};

export type ObservationHashResult = {
  algorithm: ObservationHashAlgorithm;
  hash: string;
  canonicalPayload: CanonicalObservationPayload;
};

export function normalizeTextForHash(value?: string | null) {
  return (value ?? "").normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ");
}

function hashText(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function stableJson(value: Record<string, unknown>) {
  return JSON.stringify(
    Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((accumulator, key) => {
        accumulator[key] = value[key];
        return accumulator;
      }, {}),
  );
}

export function buildCanonicalObservationPayload(input: ObservationHashInput): CanonicalObservationPayload {
  const normalizedText = normalizeTextForHash(input.textDescription);

  return {
    observation_id: input.observationId,
    server_timestamp: input.serverTimestamp,
    user_id: input.userId,
    latitude: typeof input.latitude === "number" ? Number(input.latitude.toFixed(7)) : null,
    longitude: typeof input.longitude === "number" ? Number(input.longitude.toFixed(7)) : null,
    text_description_hash: normalizedText ? hashText(normalizedText) : null,
    media_checksum: input.mediaChecksum || null,
    species_ref_id: input.speciesRefId || null,
  };
}

export function createObservationHash(
  payload: CanonicalObservationPayload,
  algorithm: ObservationHashAlgorithm = "sha256",
): ObservationHashResult {
  return {
    algorithm,
    hash: createHash(algorithm).update(stableJson(payload), "utf8").digest("hex"),
    canonicalPayload: payload,
  };
}

export const evidenceHashDisclaimer = {
  en: "This hash is a digital integrity check, not automatic legal admissibility. Legal use may require forensic IT expert validation.",
  id: "Hash ini adalah pemeriksaan integritas digital, bukan otomatis menjadi alat bukti yang sah di pengadilan. Penggunaan hukum dapat memerlukan validasi ahli forensik TI.",
};
