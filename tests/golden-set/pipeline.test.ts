// NaLI: Golden Set Pipeline Runner
// Run this script to validate the architecture without a frontend.

import { ObservationOrchestrator } from "../../src/lib/agent/core/orchestrator";
import { MockVisionTool } from "../../src/lib/agent/tools/vision.mock";
import { MockGBIFTool } from "../../src/lib/agent/tools/gbif.mock";
import { MockIUCNTool } from "../../src/lib/agent/tools/iucn.mock";
import { MockAnomalyTool } from "../../src/lib/agent/tools/anomaly.mock";
import { GoldenSetFixtures } from "./fixtures";

async function runPipelineTest() {
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
    const wrappedPipeline = testPipeline.map(tool => ({
      ...tool,
      execute: async (input: any) => tool.execute({ ...input, forceFailure: fixture.payload.forceFailure }),
      fallback: tool.fallback ? async (input: any, err: any) => tool.fallback!({ ...input, forceFailure: fixture.payload.forceFailure }, err) : undefined
    })) as any;

    const orchestrator = new ObservationOrchestrator(mockObservationId, wrappedPipeline);
    
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
