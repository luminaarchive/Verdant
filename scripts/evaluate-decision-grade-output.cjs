#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const dataDir = path.join(root, "data", "fine-tuning");

const enFields = ["Decision:", "Priority:", "Confidence:", "Evidence:", "Risk:", "Recommended Action:", "Uncertainty:", "Next Step:"];
const idFields = ["Keputusan:", "Prioritas:", "Keyakinan:", "Bukti:", "Risiko:", "Rekomendasi:", "Ketidakpastian:", "Langkah Berikutnya:"];
const forbidden = [/verified field observation/i, /legal admissibility is guaranteed/i, /exact sensitive coordinates/i];

let checked = 0;
const failures = [];

for (const file of fs.readdirSync(dataDir).filter((name) => name.endsWith(".jsonl"))) {
  const lines = fs.readFileSync(path.join(dataDir, file), "utf8").split(/\r?\n/).filter(Boolean);
  for (const [index, line] of lines.entries()) {
    checked += 1;
    const parsed = JSON.parse(line);
    const output = String(parsed.output ?? "");
    const fields = file.endsWith(".id.jsonl") || file.includes(".id.") || output.includes("Keputusan:")
      ? idFields
      : enFields;
    const missing = fields.filter((field) => !output.includes(field));
    if (missing.length) failures.push(`${file}:${index + 1} missing ${missing.join(", ")}`);
    for (const pattern of forbidden) {
      if (pattern.test(output)) failures.push(`${file}:${index + 1} contains forbidden claim ${pattern}`);
    }
  }
}

if (failures.length) {
  console.error(`Decision-grade evaluation failed (${failures.length} issues):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Decision-grade evaluation passed for ${checked} examples.`);
