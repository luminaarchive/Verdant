require("../helpers/register-ts.cjs");

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildCanonicalObservationPayload,
  createObservationHash,
  normalizeTextForHash,
} = require("../../src/lib/evidence/hash");

test("normalizes descriptive text before evidence hashing", () => {
  assert.equal(normalizeTextForHash("  Harimau   terlihat\n dekat sungai  "), "harimau terlihat dekat sungai");
});

test("creates stable sha256 hashes from canonical observation payloads", () => {
  const payload = buildCanonicalObservationPayload({
    observationId: "obs-1",
    serverTimestamp: "2026-05-15T02:00:00.000Z",
    userId: "user-1",
    latitude: -6.2,
    longitude: 106.8,
    textDescription: "Harimau terlihat dekat sungai",
    mediaChecksum: "media-sha",
    speciesRefId: "species-1",
  });

  const first = createObservationHash(payload);
  const second = createObservationHash({ ...payload });

  assert.equal(first.algorithm, "sha256");
  assert.match(first.hash, /^[a-f0-9]{64}$/);
  assert.equal(first.hash, second.hash);
});
