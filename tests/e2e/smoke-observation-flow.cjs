process.env.NALI_LOG_LEVEL = "error";

require("../helpers/register-ts.cjs");

const assert = require("node:assert/strict");
const { ObservationOrchestrator } = require("../../src/lib/agent/core/orchestrator");
const { MockVisionTool } = require("../../src/lib/agent/tools/vision.mock");
const { MockGBIFTool } = require("../../src/lib/agent/tools/gbif.mock");
const { MockIUCNTool } = require("../../src/lib/agent/tools/iucn.mock");
const { MockAnomalyTool } = require("../../src/lib/agent/tools/anomaly.mock");
const { storageService } = require("../../src/lib/services/storage.service");
const { createClient } = require("@supabase/supabase-js");
const { SUPABASE_ENV, loadLocalEnv, missingEnv } = require("../../scripts/validation-utils.cjs");

function createMockDb() {
  const state = {
    analysisRuns: [],
    events: [],
    observationUpdates: [],
    orchestratorRuns: [],
    fieldCases: [],
  };

  return {
    state,
    from(table) {
      return {
        insert(payload) {
          const rows = Array.isArray(payload) ? payload : [payload];
          if (table === "analysis_runs") state.analysisRuns.push(...rows);
          if (table === "observation_events") state.events.push(...rows);
          if (table === "orchestrator_runs") state.orchestratorRuns.push(...rows);

          return {
            select() {
              return {
                single: async () => ({ data: { id: "run-smoke-001" }, error: null }),
              };
            },
          };
        },
        upsert: async (payload) => {
          const rows = Array.isArray(payload) ? payload : [payload];
          if (table === "field_cases") state.fieldCases.push(...rows);
          return { error: null };
        },
        update(payload) {
          return {
            eq: async (column, value) => {
              if (table === "observations") state.observationUpdates.push({ column, value, payload });
              if (table === "orchestrator_runs") state.orchestratorRuns.push({ update: payload, column, value });
              return { error: null };
            },
          };
        },
      };
    },
  };
}

function createMockFile() {
  const bytes = Buffer.from("NaLI smoke observation image bytes");
  return {
    name: "field-observation.jpg",
    type: "image/jpeg",
    size: bytes.length,
    arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  };
}

async function runSmoke() {
  loadLocalEnv();
  const file = createMockFile();
  const payload = {
    userId: "00000000-0000-4000-8000-000000000001",
    photoFile: file,
    textDescription: "Large orange carnivore track near riparian forest edge.",
    latitude: -6.9175,
    longitude: 107.6191,
    accuracyMeters: 42,
  };

  assert.equal(await storageService.validateMimeType(file), true);
  assert.match(await storageService.generateChecksum(file), /^[a-f0-9]{64}$/);
  assert.equal(typeof payload.textDescription, "string");
  assert.equal(Number.isFinite(payload.latitude), true);
  assert.equal(Number.isFinite(payload.longitude), true);

  const observationId = "11111111-1111-4111-8111-111111111111";
  const db = createMockDb();
  db.state.events.push(
    { observation_id: observationId, event_type: "OBSERVATION_CREATED", severity: "info", payload: {} },
    { observation_id: observationId, event_type: "MEDIA_UPLOADED", severity: "info", payload: {} },
  );

  const orchestrator = new ObservationOrchestrator(
    observationId,
    [new MockVisionTool(), new MockGBIFTool(), new MockIUCNTool(), new MockAnomalyTool()],
    db,
  );

  await orchestrator.executeWorkflow();

  const finalObservationUpdate = db.state.observationUpdates.find((entry) => entry.payload.reasoning_snapshot);
  assert.ok(finalObservationUpdate, "orchestrator should persist a final observation reasoning update");
  assert.ok(finalObservationUpdate.payload.reasoning_snapshot, "reasoning snapshot should be persisted");
  assert.ok(finalObservationUpdate.payload.signal_snapshot, "signal snapshot should be persisted separately");
  assert.match(finalObservationUpdate.payload.reasoning_trace_id, /^[0-9a-f-]{36}$/);
  assert.equal(typeof finalObservationUpdate.payload.confidence_level, "number");

  const eventTypes = db.state.events.map((event) => event.event_type);
  [
    "OBSERVATION_CREATED",
    "MEDIA_UPLOADED",
    "ORCHESTRATION_STARTED",
    "REASONING_SYNTHESIZED",
    "OBSERVATION_COMPLETED",
  ].forEach((eventType) => {
    assert.ok(eventTypes.includes(eventType), `expected event ${eventType}`);
  });

  if (
    missingEnv(SUPABASE_ENV).length > 0
  ) {
    console.log("skipped live persistence: missing env");
  } else if (!process.env.NALI_LIVE_TEST_USER_ID) {
    console.log("skipped live persistence: missing NALI_LIVE_TEST_USER_ID");
  } else {
    await runLivePersistenceSmoke(process.env.NALI_LIVE_TEST_USER_ID);
  }

  console.log("smoke observation flow passed");
}

async function runLivePersistenceSmoke(userId) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const observationId = crypto.randomUUID();

  const { error: insertError } = await supabase.from("observations").insert({
    id: observationId,
    user_id: userId,
    timestamp: new Date().toISOString(),
    latitude: -6.9175,
    longitude: 107.6191,
    text_description: "NaLI live E2E validation observation",
    observation_status: "pending",
    status: "pending",
    review_status: "unreviewed",
    processing_stage: "uploaded",
    sync_state: "synced",
    created_at: new Date().toISOString(),
  });
  if (insertError) {
    throw new Error(`live observation insert failed: ${insertError.message}`);
  }

  try {
    await supabase.from("observation_events").insert({
      observation_id: observationId,
      event_type: "OBSERVATION_CREATED",
      severity: "info",
      payload: { source: "smoke-observation-flow" },
    });

    const orchestrator = new ObservationOrchestrator(
      observationId,
      [new MockVisionTool(), new MockGBIFTool(), new MockIUCNTool(), new MockAnomalyTool()],
      supabase,
    );
    await orchestrator.executeWorkflow();

    const { data: observation, error: observationError } = await supabase
      .from("observations")
      .select("id, reasoning_snapshot, signal_snapshot, reasoning_trace_id, confidence_level")
      .eq("id", observationId)
      .single();
    if (observationError) throw new Error(`live observation select failed: ${observationError.message}`);
    assert.equal(observation.id, observationId);
    assert.ok(observation.reasoning_snapshot);
    assert.ok(observation.signal_snapshot);
    assert.match(observation.reasoning_trace_id, /^[0-9a-f-]{36}$/);
    assert.equal(typeof observation.confidence_level, "number");

    const { data: events, error: eventsError } = await supabase
      .from("observation_events")
      .select("event_type")
      .eq("observation_id", observationId);
    if (eventsError) throw new Error(`live event select failed: ${eventsError.message}`);

    const eventTypes = events.map((event) => event.event_type);
    ["OBSERVATION_CREATED", "ORCHESTRATION_STARTED", "REASONING_SYNTHESIZED", "OBSERVATION_COMPLETED"].forEach(
      (eventType) => {
        assert.ok(eventTypes.includes(eventType), `expected live event ${eventType}`);
      },
    );
    console.log("live persistence smoke passed");
  } finally {
    const { error: cleanupError } = await supabase.from("observations").delete().eq("id", observationId);
    if (cleanupError) {
      console.warn(`WARN     live persistence cleanup failed: ${cleanupError.message}`);
    } else {
      console.log("live persistence cleanup complete");
    }
  }
}

runSmoke().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
