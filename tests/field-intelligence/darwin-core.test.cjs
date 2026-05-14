require("../helpers/register-ts.cjs");

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildDarwinCoreArchiveFiles,
  mapObservationToDarwinCore,
  serializeDarwinCoreCsv,
} = require("../../src/lib/export/darwin-core");

test("maps verified observations into Darwin Core occurrence fields", () => {
  const mapped = mapObservationToDarwinCore({
    id: "obs-1",
    scientific_name: "Panthera tigris sumatrae",
    local_name: "Harimau Sumatera",
    latitude: -1.2,
    longitude: 101.4,
    created_at: "2026-05-15T02:00:00.000Z",
    user_id: "user-1",
    review_status: "verified",
    verified_by_human: true,
    field_case_id: "case-1",
    conservation_status: "CR",
  });

  assert.equal(mapped.occurrenceID, "obs-1");
  assert.equal(mapped.scientificName, "Panthera tigris sumatrae");
  assert.equal(mapped.vernacularName, "Harimau Sumatera");
  assert.equal(mapped.basisOfRecord, "HumanObservation");
  assert.equal(mapped.occurrenceStatus, "present");
  assert.equal(mapped.geodeticDatum, "WGS84");
  assert.equal(mapped.eventID, "case-1");
});

test("serializes Darwin Core CSV with protected coordinate fallback", () => {
  const csv = serializeDarwinCoreCsv([
    mapObservationToDarwinCore({
      id: "obs-2",
      scientific_name: "Dicerorhinus sumatrensis",
      local_name: "Badak Sumatera",
      latitude: -5.123456,
      longitude: 104.654321,
      created_at: "2026-05-15T02:00:00.000Z",
      user_id: "user-2",
      review_status: "verified",
      verified_by_human: true,
      conservation_status: "CR",
      sensitive: true,
      canExportExactCoordinates: false,
    }),
  ]);

  assert.match(csv, /coordinateUncertaintyInMeters/);
  assert.match(csv, /protected/);
  assert.doesNotMatch(csv, /-5\.123456/);
  assert.doesNotMatch(csv, /104\.654321/);
});

test("builds DwC-A archive file payloads", () => {
  const files = buildDarwinCoreArchiveFiles([]);

  assert.ok(files["occurrence.txt"]);
  assert.ok(files["meta.xml"]);
  assert.ok(files["eml.xml"]);
});
