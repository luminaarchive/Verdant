process.env.NALI_LOG_LEVEL = "error";

require("../helpers/register-ts.cjs");

const assert = require("node:assert/strict");
const { ObservationOrchestrator } = require("../../src/lib/agent/core/orchestrator");
const { MockVisionTool } = require("../../src/lib/agent/tools/vision.mock");
const { MockGBIFTool } = require("../../src/lib/agent/tools/gbif.mock");
const { MockIUCNTool } = require("../../src/lib/agent/tools/iucn.mock");
const { MockAnomalyTool } = require("../../src/lib/agent/tools/anomaly.mock");
const { storageService } = require("../../src/lib/services/storage.service");

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
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.log("skipped live persistence: missing env");
  }

  console.log("smoke observation flow passed");
}

runSmoke().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
