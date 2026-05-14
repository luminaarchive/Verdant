#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const vm = require("node:vm");

const root = process.cwd();

function loadDictionary(name) {
  const file = path.join(root, "src", "lib", "i18n", "translations", `${name}.ts`);
  const source = fs.readFileSync(file, "utf8").replace(new RegExp(`export const ${name} =`), "module.exports =");
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const sandbox = { module: { exports: {} }, exports: {} };
  vm.runInNewContext(js, sandbox, { filename: file });
  return sandbox.module.exports;
}

function flatten(value, prefix = "") {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([key, child]) => flatten(child, prefix ? `${prefix}.${key}` : key));
  }
  return [prefix];
}

function values(value, prefix = "") {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([key, child]) => values(child, prefix ? `${prefix}.${key}` : key));
  }
  return [{ key: prefix, value }];
}

const en = loadDictionary("en");
const id = loadDictionary("id");
const enKeys = flatten(en).sort();
const idKeys = flatten(id).sort();
const missing = enKeys.filter((key) => !idKeys.includes(key));
const extra = idKeys.filter((key) => !enKeys.includes(key));

if (missing.length) {
  console.error("FAILED  Indonesian dictionary is missing keys:");
  missing.forEach((key) => console.error(`        ${key}`));
  process.exitCode = 1;
}

if (extra.length) {
  console.warn("WARN    Indonesian dictionary has extra keys:");
  extra.forEach((key) => console.warn(`        ${key}`));
}

const allowedFragments = [
  "NaLI",
  "GBIF",
  "IUCN",
  "GPS",
  "API",
  "CR",
  "EN",
  "VU",
  "NT",
  "LC",
  "PWA",
  "Android",
  "Ranger",
  "Email",
  "URL",
];

const suspiciousEnglish = [
  "Built for",
  "Field teams",
  "How NaLI works",
  "Observation results",
  "Privacy and security",
  "Start Identifying",
  "View Field Workflow",
  "Workflow",
  "Field Use",
  "Security",
  "Evidence",
  "Confidence",
  "Review",
  "Pending",
  "Protected",
  "just now",
  "updated just now",
  "Live field workflow demo",
  "realtime",
  "real-time",
];

const warnings = values(id)
  .filter((entry) => typeof entry.value === "string")
  .filter((entry) => suspiciousEnglish.some((phrase) => entry.value.includes(phrase)))
  .filter((entry) => !allowedFragments.some((fragment) => entry.value === fragment));

if (warnings.length) {
  console.warn("WARN    Possible English phrases remain in Indonesian dictionary:");
  warnings.forEach((entry) => console.warn(`        ${entry.key}: ${entry.value}`));
}

if (!missing.length) {
  console.log(`OK      i18n key coverage matched (${enKeys.length} keys)`);
}
