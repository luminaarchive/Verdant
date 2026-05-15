#!/usr/bin/env node

const {
  OPTIONAL_ENV,
  REQUIRED_ENV,
  hasEnv,
  loadLocalEnv,
  printHeader,
  printStatus,
} = require("./validation-utils.cjs");

loadLocalEnv();
printHeader("Vercel Environment Checklist");

const publicKeys = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_APP_URL"];
const serverOnlyKeys = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "ANTHROPIC_API_KEY",
  "IUCN_API_KEY",
  "EBIRD_API_KEY",
  "NASA_FIRMS_API_KEY",
  "GFW_API_KEY",
  "BIRDNET_API_KEY",
  "SENTRY_DSN",
];
const optionalKeys = OPTIONAL_ENV;

console.log("\nRequired variables:");
REQUIRED_ENV.forEach((key) => {
  const scope = publicKeys.includes(key) ? "browser-safe public" : "server-only secret";
  printStatus(hasEnv(key) ? "OK" : "MISSING", `${key} (${scope})`);
});

console.log("\nOptional provider/observability variables:");
optionalKeys.forEach((key) => {
  const scope = serverOnlyKeys.includes(key) ? "server-only secret" : "public only if intentionally used by client code";
  printStatus(hasEnv(key) ? "OK" : "OPTIONAL", `${key} (${scope})`);
});

console.log("\nSafety notes:");
printStatus("WARN", "SUPABASE_SERVICE_ROLE_KEY must never be exposed client-side or prefixed with NEXT_PUBLIC_.");
printStatus("INFO", "Set variables in Vercel Project Settings -> Environment Variables for Production and Preview as appropriate.");
printStatus("INFO", "This script reports configured/unconfigured only and never prints secret values.");
