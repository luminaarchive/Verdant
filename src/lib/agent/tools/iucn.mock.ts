// NaLI: Mock IUCN Tool
import { AgentTool, ToolInput, ToolOutput } from "../core/types";

export class MockIUCNTool implements AgentTool {
  name = "IUCN Analysis";
  version = "iucn-redlist-mock";

  async execute(input: ToolInput): Promise<ToolOutput> {
    await new Promise(r => setTimeout(r, 400));

    return {
      status: 'completed',
      latency_ms: 400,
      score_breakdown: {},
      raw_output: "Status: Critically Endangered (CR)."
    };
  }
}
