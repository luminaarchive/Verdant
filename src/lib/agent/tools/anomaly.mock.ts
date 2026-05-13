// NaLI: Mock Anomaly Tool
import { AgentTool, ToolInput, ToolOutput } from "../core/types";

export class MockAnomalyTool implements AgentTool {
  name = "Anomaly Detection";
  version = "anomaly-model-mock";

  async execute(input: ToolInput): Promise<ToolOutput> {
    await new Promise(r => setTimeout(r, 900));

    if (input.forceFailure === 'anomaly_critical') {
      return {
        status: 'warning',
        latency_ms: 900,
        score_breakdown: { anomaly_score: 0.95 },
        raw_output: "CRITICAL ANOMALY: Species occurrence completely outside historical boundaries."
      };
    }

    return {
      status: 'completed',
      latency_ms: 900,
      score_breakdown: { anomaly_score: 0.12 },
      raw_output: "Observation aligns with expected patterns."
    };
  }
}
