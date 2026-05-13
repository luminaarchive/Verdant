// NaLI: Mock Vision Tool
import { AgentTool, ToolInput, ToolOutput } from "../core/types";

export class MockVisionTool implements AgentTool {
  name = "Vision Engine";
  version = "v4.1.mock";

  async execute(input: ToolInput): Promise<ToolOutput> {
    // Simulate latency
    await new Promise(r => setTimeout(r, 1200));

    // Simulate occasional blurry failure if testing
    if (input.forceFailure === 'vision_blurry') {
      throw new Error("Image too blurry to detect morphological features confidently.");
    }

    return {
      status: 'completed',
      latency_ms: 1200,
      score_breakdown: {
        confidence: 0.88,
        image_quality: 0.95
      },
      raw_output: "Detected morphological markers consistent with Pongo abelii."
    };
  }

  async fallback(input: ToolInput, error: any): Promise<ToolOutput> {
    await new Promise(r => setTimeout(r, 800));
    return {
      status: 'warning',
      latency_ms: 800,
      score_breakdown: { confidence: 0.45 },
      raw_output: `Fallback vision model used due to: ${error.message}. Low confidence.`,
      error: error.message
    };
  }
}
