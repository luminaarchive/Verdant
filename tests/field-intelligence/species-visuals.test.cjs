require("../helpers/register-ts.cjs");

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const { DEMO_SPECIES } = require("../../src/lib/demo/species");
const {
  FORBIDDEN_SPECIES_VISUAL_TERMS,
  getSpeciesVisual,
  speciesVisuals,
} = require("../../src/lib/species/speciesVisuals");

const projectRoot = path.resolve(__dirname, "..", "..");

test("maps every public demo species to a verified local species visual or explicit non-photo fallback", () => {
  for (const species of DEMO_SPECIES) {
    const visual = getSpeciesVisual(species.scientificName);

    assert.ok(visual, `${species.scientificName} should have a species visual mapping`);
    assert.equal(visual.scientificName, species.scientificName);
    assert.equal(visual.commonNameId, species.commonNameId);

    if (visual.verified) {
      assert.match(visual.imagePath, /^\/species\//);
      assert.equal(
        fs.existsSync(path.join(projectRoot, "public", visual.imagePath)),
        true,
        `${visual.imagePath} should exist locally`,
      );
      assert.match(visual.altTextEn.toLowerCase(), new RegExp(visual.commonNameEn.split(" ")[0].toLowerCase()));
    } else {
      assert.equal(visual.fallbackType, "evidence-card");
    }
  }
});

test("prevents orangutan cards from using panda or other known mismatched placeholder language", () => {
  const pongoVisuals = speciesVisuals.filter((visual) => visual.scientificName.toLowerCase().startsWith("pongo "));
  assert.ok(pongoVisuals.length > 0);

  for (const visual of pongoVisuals) {
    const searchable = [visual.imagePath, visual.altTextEn, visual.altTextId, visual.attribution ?? ""]
      .join(" ")
      .toLowerCase();

    for (const forbidden of FORBIDDEN_SPECIES_VISUAL_TERMS) {
      assert.equal(
        searchable.includes(forbidden),
        false,
        `${visual.scientificName} contains forbidden term ${forbidden}`,
      );
    }
  }
});
