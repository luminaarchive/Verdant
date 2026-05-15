#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const dataDir = path.join(root, "data", "fine-tuning");
const outputFile = path.join(dataDir, "nali_finetune_combined.preview.jsonl");
const inputs = fs
  .readdirSync(dataDir)
  .filter((file) => file.endsWith(".jsonl") && !file.includes("combined"))
  .sort();

const rows = [];

for (const file of inputs) {
  const fullPath = path.join(dataDir, file);
  const lines = fs.readFileSync(fullPath, "utf8").split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    const parsed = JSON.parse(line);
    rows.push({
      source_file: file,
      input: parsed.input,
      output: parsed.output,
    });
  }
}

fs.writeFileSync(outputFile, `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`);
console.log(`Prepared ${rows.length} rows at ${path.relative(root, outputFile)}`);
