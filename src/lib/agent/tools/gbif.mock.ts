// NaLI: Mock GBIF Tool
import { AgentTool, ToolInput, ToolOutput } from "../core/types";

export class MockGBIFTool implements AgentTool {
  name = "GBIF Cross-check";
  version = "gbif-api-mock";

  async execute(input: ToolInput): Promise<ToolOutput> {
    await new Promise(r => setTimeout(r, 600));

    if (input.forceFailure === 'gbif_timeout') {
      throw new Error("GBIF API Timeout after 5000ms");
    }

    return {
      status: 'completed',
      latency_ms: 600,
      score_breakdown: { match: 0.92, location_fit: 0.89 },
      raw_output: "Occurrence match found in Northern Sumatra region. Adjusted confidence."
    };
  }

  async fallback(input: ToolInput, error: any): Promise<ToolOutput> {
    await new Promise(r => setTimeout(r, 300));
    return {
      status: 'completed',
      latency_ms: 300,
      score_breakdown: { match: 0.60 },
      raw_output: "Local cached occurrence used. Regional match confirmed but outdated.",
      error: error.message
    };
  }
}
