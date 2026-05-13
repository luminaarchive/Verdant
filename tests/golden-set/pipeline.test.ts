// NaLI: Golden Set Pipeline Runner
// Run this script to validate the architecture without a frontend.

import { ObservationOrchestrator } from "../../src/lib/agent/core/orchestrator";
import { MockVisionTool } from "../../src/lib/agent/tools/vision.mock";
import { MockGBIFTool } from "../../src/lib/agent/tools/gbif.mock";
import { MockIUCNTool } from "../../src/lib/agent/tools/iucn.mock";
import { MockAnomalyTool } from "../../src/lib/agent/tools/anomaly.mock";
import { GoldenSetFixtures } from "./fixtures";

function createMockDbClient() {
  const state = {
    orchestratorRuns: [] as Array<Record<string, any>>,
    analysisRuns: [] as Array<Record<string, any>>,
    observations: [] as Array<Record<string, any>>,
    observationEvents: [] as Array<Record<string, any>>,
    fieldCases: [] as Array<Record<string, any>>,
  };

  const rowsForTable = (table: string) => {
    if (table === "orchestrator_runs") return state.orchestratorRuns;
    if (table === "analysis_runs") return state.analysisRuns;
    if (table === "observations") return state.observations;
    if (table === "observation_events") return state.observationEvents;
    if (table === "field_cases") return state.fieldCases;
    return [];
  };

  return {
    from(table: string) {
      const rows = rowsForTable(table);
      let pendingRows: Array<Record<string, any>> = [];
      let pendingChanges: Record<string, any> | null = null;
      let filters: Array<{ column: string; value: any }> = [];

      const applyFilters = () =>
        rows.filter((row) => filters.every((filter) => row[filter.column] === filter.value));

      const chain = {
        insert(payload: Record<string, any> | Array<Record<string, any>>) {
          const inserted = Array.isArray(payload) ? payload : [payload];
          pendingRows = inserted.map((row) => ({
            id: row.id ?? crypto.randomUUID(),
            ...row,
          }));
          rows.push(...pendingRows);
          return chain;
        },
        update(payload: Record<string, any>) {
          pendingChanges = payload;
          return chain;
        },
        upsert(payload: Array<Record<string, any>>) {
          for (const row of payload) {
            const existingIndex = rows.findIndex((existing) => existing.id === row.id);
            if (existingIndex >= 0) {
              rows[existingIndex] = { ...rows[existingIndex], ...row };
            } else {
              rows.push(row);
            }
          }
          return Promise.resolve({ data: payload, error: null });
        },
        select() {
          return chain;
        },
        single() {
          return Promise.resolve({
            data: pendingRows[0] ?? applyFilters()[0] ?? null,
            error: null,
          });
        },
        eq(column: string, value: any) {
          filters.push({ column, value });
          if (pendingChanges) {
            for (const row of applyFilters()) {
              Object.assign(row, pendingChanges);
            }
          }
          return Promise.resolve({ data: applyFilters(), error: null });
        },
      };

      return chain;
    },
    __state: state,
  };
}

export async function runPipelineTest() {
  console.log("Starting Golden Set Pipeline Validation...\n");

  for (const fixture of GoldenSetFixtures) {
    console.log(`\n--- SCENARIO: ${fixture.scenario} ---`);
    const mockObservationId = crypto.randomUUID();
    
    // We inject forceFailure into the tools by wrapping the input
    const testPipeline = [
      new MockVisionTool(),
      new MockGBIFTool(),
      new MockIUCNTool(),
      new MockAnomalyTool()
    ];

    // Modify tools to accept the fixture payload injection
    const wrappedPipeline = testPipeline.map(tool => {
      const fallback = "fallback" in tool ? tool.fallback : undefined;

      return {
        ...tool,
        execute: async (input: any) => tool.execute({ ...input, forceFailure: fixture.payload.forceFailure }),
        fallback: fallback
          ? async (input: any, err: any) => fallback({ ...input, forceFailure: fixture.payload.forceFailure }, err)
          : undefined
      };
    }) as any;

    const mockDb = createMockDbClient();
    const orchestrator = new ObservationOrchestrator(mockObservationId, wrappedPipeline, mockDb);
    
    try {
      console.log(`Executing orchestrator for observation: ${mockObservationId}`);
      await orchestrator.executeWorkflow();
      console.log(`Finished scenario. Check DB for orchestrator_runs matching: ${mockObservationId}`);
    } catch (err) {
      console.error("Orchestrator threw an unhandled error:", err);
    }
  }

  console.log("\nPipeline validation complete. Please check the 'orchestrator_runs' and 'observation_events' tables.");
}

// Since this is a next.js app, executing this directly via ts-node might require env vars.
// Use `npx tsx tests/golden-set/pipeline.test.ts` to run.
if (require.main === module) {
  runPipelineTest();
}
