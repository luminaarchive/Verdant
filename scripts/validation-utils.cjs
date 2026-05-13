const fs = require("node:fs");
const path = require("node:path");
const { createClient } = require("@supabase/supabase-js");

const REQUIRED_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL",
];

const SUPABASE_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

const OPTIONAL_ENV = ["ANTHROPIC_API_KEY", "IUCN_API_KEY", "BIRDNET_API_KEY", "SENTRY_DSN", "VERCEL_ANALYTICS_ID"];

function loadLocalEnv() {
  [".env.local", ".env"].forEach((filename) => {
    const filepath = path.join(process.cwd(), filename);
    if (!fs.existsSync(filepath)) return;

    const lines = fs.readFileSync(filepath, "utf8").split(/\r?\n/);
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return;
      const index = trimmed.indexOf("=");
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
      if (key && process.env[key] === undefined) process.env[key] = value;
    });
  });
}

function hasEnv(key) {
  return Boolean(process.env[key] && process.env[key].trim());
}

function missingEnv(keys) {
  return keys.filter((key) => !hasEnv(key));
}

function printHeader(title) {
  console.log(`\nNaLI ${title}`);
  console.log("=".repeat(`NaLI ${title}`.length));
}

function printStatus(status, message) {
  console.log(`${status.padEnd(8)} ${message}`);
}

function skipMissing(keys, label = "Supabase live validation") {
  if (keys.length === 0) return false;
  printStatus("SKIPPED", `${label}: missing ${keys.join(", ")}`);
  return true;
}

function createSupabaseClients() {
  return {
    anon: createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    }),
    service: createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    }),
  };
}

function fail(message) {
  printStatus("FAILED", message);
  process.exitCode = 1;
}

function ok(message) {
  printStatus("OK", message);
}

function skipped(message) {
  printStatus("SKIPPED", message);
}

function warn(message) {
  printStatus("WARN", message);
}

module.exports = {
  OPTIONAL_ENV,
  REQUIRED_ENV,
  SUPABASE_ENV,
  createSupabaseClients,
  fail,
  hasEnv,
  loadLocalEnv,
  missingEnv,
  ok,
  printHeader,
  printStatus,
  skipMissing,
  skipped,
  warn,
};
