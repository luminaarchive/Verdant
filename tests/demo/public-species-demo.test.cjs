require("../helpers/register-ts.cjs");

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  DEMO_SPECIES,
  findDemoSpecies,
  localizeDemoSpeciesResult,
  normalizeSpeciesQuery,
} = require("../../src/lib/demo/species");

test("normalizes Indonesian species queries for public demo lookup", () => {
  assert.equal(normalizeSpeciesQuery("  Harimau   Sumatera  "), "harimau sumatera");
  assert.equal(normalizeSpeciesQuery("PANTHERA TIGRIS SUMATRAE"), "panthera tigris sumatrae");
});

test("finds golden-set species by Indonesian common name and scientific name", () => {
  const tiger = findDemoSpecies("harimau sumatera");
  const komodo = findDemoSpecies("Varanus komodoensis");

  assert.equal(tiger?.scientificName, "Panthera tigris sumatrae");
  assert.equal(tiger?.isDemo, true);
  assert.equal(tiger?.source, "nali-golden-set");
  assert.match(tiger?.disclaimer ?? "", /not a verified field observation/i);

  assert.equal(komodo?.commonNameId, "Komodo");
  assert.equal(komodo?.iucnStatus, "EN");
});

test("keeps the requested Indonesian golden-set species available", () => {
  const expected = [
    "Panthera tigris sumatrae",
    "Pongo tapanuliensis",
    "Dicerorhinus sumatrensis",
    "Spizaetus bartelsi",
    "Varanus komodoensis",
    "Leucopsar rothschildi",
    "Nasalis larvatus",
    "Macrocephalon maleo",
    "Paradisaea apoda",
    "Elephas maximus sumatranus",
  ];

  assert.deepEqual(
    expected.filter((name) => !DEMO_SPECIES.some((species) => species.scientificName === name)),
    [],
  );
});

test("returns null for unsupported public demo species queries", () => {
  assert.equal(findDemoSpecies("panda"), null);
});

test("localizes public demo response values for Indonesian landing mode", () => {
  const species = findDemoSpecies("badak sumatera");
  assert.ok(species);

  const localized = localizeDemoSpeciesResult(species, "id");

  assert.equal(localized.commonNameId, "Badak Sumatera");
  assert.match(localized.populationTrend, /Menurun|Pemulihan|Stabil/);
  assert.match(localized.disclaimer, /Demo publik/);
  assert.equal("aliases" in localized, false);
});
