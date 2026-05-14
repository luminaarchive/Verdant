require("../helpers/register-ts.cjs");

const assert = require("node:assert/strict");
const test = require("node:test");

const { assignH3Cell, evaluateH3AnomalyFlags } = require("../../src/lib/anomaly/h3");

test("assigns a resolution 7 H3 cell for Indonesian coordinates", () => {
  const cell = assignH3Cell(-6.2, 106.8);

  assert.equal(typeof cell, "string");
  assert.ok(cell.length >= 10);
});

test("flags first critical species record in a grid as high-priority verification", () => {
  const flags = evaluateH3AnomalyFlags({
    sameSpeciesInGridLast12Months: 0,
    currentMonthCount: 1,
    monthlyAverage: 0,
    iucnStatus: "CR",
    h3Cell: "87283472bffffff",
  });

  assert.deepEqual(
    flags.map((flag) => flag.flagType),
    ["first_record_in_grid", "high_priority_verify"],
  );
});

test("flags unusual activity when current month is much higher than baseline", () => {
  const flags = evaluateH3AnomalyFlags({
    sameSpeciesInGridLast12Months: 12,
    currentMonthCount: 8,
    monthlyAverage: 1.2,
    iucnStatus: "EN",
    h3Cell: "87283472bffffff",
  });

  assert.ok(flags.some((flag) => flag.flagType === "unusual_activity"));
});
