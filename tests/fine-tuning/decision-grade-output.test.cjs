const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..", "..");
const dataDir = path.join(root, "data", "fine-tuning");

test("fine-tuning examples use decision-grade fields and avoid overclaims", () => {
  const files = fs.readdirSync(dataDir).filter((file) => file.endsWith(".jsonl"));
  assert.ok(files.length >= 6);

  for (const file of files) {
    const lines = fs.readFileSync(path.join(dataDir, file), "utf8").trim().split(/\r?\n/);
    for (const line of lines) {
      const row = JSON.parse(line);
      assert.ok(row.input);
      assert.ok(row.output);
      assert.doesNotMatch(row.output, /#1|legal admissibility is guaranteed|live production threat data/i);
      assert.match(row.output, /Decision:|Keputusan:/);
      assert.match(row.output, /Uncertainty:|Ketidakpastian:/);
    }
  }
});
