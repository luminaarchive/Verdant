#!/usr/bin/env node

const {
  SUPABASE_ENV,
  createSupabaseClients,
  fail,
  loadLocalEnv,
  missingEnv,
  ok,
  printHeader,
  skipMissing,
  skipped,
  warn,
} = require("./validation-utils.cjs");

const expectedTables = [
  "observations",
  "analysis_runs",
  "observation_events",
  "orchestrator_runs",
  "species_reference",
  "field_cases",
];

const optionalTables = ["observation_media", "observations_media", "observation_cases"];
const requiredObservationColumns = [
  "reasoning_snapshot",
  "signal_snapshot",
  "reasoning_trace_id",
  "conservation_priority_score",
  "conservation_priority_category",
];

async function checkTable(client, table) {
  const { error } = await client.from(table).select("*", { count: "exact", head: true }).limit(1);
  return error;
}

async function run() {
  loadLocalEnv();
  printHeader("Supabase Live Validation");

  const missing = missingEnv(SUPABASE_ENV);
  if (skipMissing(missing, "Supabase live validation")) return;

  const { service } = createSupabaseClients();

  for (const table of expectedTables) {
    const error = await checkTable(service, table);
    if (error) fail(`Expected table '${table}' is not reachable: ${error.message}`);
    else ok(`Table '${table}' is reachable`);
  }

  let mediaTableFound = false;
  for (const table of optionalTables.slice(0, 2)) {
    const error = await checkTable(service, table);
    if (!error) {
      mediaTableFound = true;
      ok(`Media table '${table}' is reachable`);
      break;
    }
  }
  if (!mediaTableFound) fail("Expected media table 'observation_media' or 'observations_media' is not reachable");

  const observationCaseError = await checkTable(service, "observation_cases");
  if (observationCaseError) skipped("Optional table 'observation_cases' is not present");
  else ok("Optional table 'observation_cases' is reachable");

  const { data: columnProbe, error: columnError } = await service.from("observations").select(requiredObservationColumns.join(",")).limit(1);
  if (columnError) fail(`Operational reasoning columns are not fully reflected on observations: ${columnError.message}`);
  else ok(`Operational reasoning columns are available (${requiredObservationColumns.join(", ")})`);

  const { data: buckets, error: bucketsError } = await service.storage.listBuckets();
  if (bucketsError) {
    fail(`Storage bucket listing failed: ${bucketsError.message}`);
  } else {
    const bucket = buckets.find((item) => item.name === "observation_media" || item.id === "observation_media");
    if (!bucket) fail("Storage bucket 'observation_media' is missing");
    else {
      ok("Storage bucket 'observation_media' exists");
      if (bucket.public === false) ok("Storage bucket 'observation_media' is private");
      else fail("Storage bucket 'observation_media' is public; field media must remain private");
    }
  }

  const testId = crypto.randomUUID();
  const testUserId = "00000000-0000-4000-8000-000000000001";
  const insertPayload = {
    id: testId,
    user_id: testUserId,
    latitude: 0,
    longitude: 0,
    text_description: "NaLI production validation probe",
    observation_status: "pending",
    review_status: "unreviewed",
    processing_stage: "uploaded",
    created_at: new Date().toISOString(),
  };

  const { error: insertError } = await service.from("observations").insert(insertPayload);
  if (insertError) {
    warn(`Safe insert/select probe skipped: ${insertError.message}`);
  } else {
    const { data, error: selectError } = await service.from("observations").select("id").eq("id", testId).single();
    if (selectError || data?.id !== testId) fail(`Safe insert/select probe failed: ${selectError?.message ?? "record not found"}`);
    else ok("Safe insert/select probe succeeded");

    const { error: deleteError } = await service.from("observations").delete().eq("id", testId);
    if (deleteError) warn(`Safe insert/select probe cleanup failed: ${deleteError.message}`);
    else ok("Safe insert/select probe cleaned up");
  }

  if (!columnProbe) skipped("No observation rows were returned while probing operational columns; schema check still succeeded");
}

run().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
