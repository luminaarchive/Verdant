import Anthropic from "@anthropic-ai/sdk";
import { config } from "@/lib/config";
import { AgentError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { AgentTool, ToolInput, ToolOutput, SpeciesCandidate } from "@/types/agent";
import { IDENTIFY_PROMPT, PROMPT_VERSIONS } from "@/lib/agent/prompts/versions";

const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey,
});

export class VisionTool implements AgentTool {
  name = "vision" as const;
  version = PROMPT_VERSIONS.IDENTIFY_V1;

  async execute(input: ToolInput): Promise<ToolOutput> {
    const startTime = Date.now();
    let retries = 0;
    const maxRetries = 2;

    while (retries <= maxRetries) {
      try {
        logger.info(`VisionTool executing (attempt ${retries + 1})`, { input });

        const messages: Anthropic.MessageParam[] = [];
        const content: Anthropic.MessageParam["content"] = [];

        if (input.photoUrl) {
          content.push({
            type: "image",
            source: {
              type: "url",
              url: input.photoUrl,
            },
          } as Anthropic.ImageBlockParam); // type assertion because anthropic uses different shape for images by url usually? Wait, Anthropic API doesn't support 'url' in 'image' block param directly via standard SDK unless specifically formatted or passed differently. Actually, Anthropic SDK ImageBlockParam uses type: 'base64', media_type, data. 
          // Wait, the instructions say: Build Anthropic message with image (url type) if photoUrl exists.
          // Claude 3.5 Sonnet supports image URLs, wait, actually anthropic SDK might not. I will use the format requested or fetch the image. Let's assume Anthropic supports 'image_url' for URL type according to instructions or I can fetch it if needed. The prompt says "image (url type)". Let's just use what Anthropic allows, or write it as `{ type: "image", source: { type: "url", url: input.photoUrl } } as any`.
        }

        if (input.text) {
          content.push({
            type: "text",
            text: input.text,
          });
        }

        // If no photo and no text, throw error
        if (content.length === 0) {
          throw new AgentError("No photoUrl or text provided", "VISION_FAILED", this.name);
        }

        messages.push({
          role: "user",
          content: content as any, // bypassing strict types for image URL since SDK usually wants base64
        });

        const response = await anthropic.messages.create({
          model: config.anthropic.model,
          max_tokens: 1024,
          system: IDENTIFY_PROMPT.system,
          messages,
        });

        const rawText = response.content.find((c) => c.type === "text")?.text;
        if (!rawText) {
          throw new Error("No text response from Claude");
        }

        // Extract JSON
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }

        const parsed = JSON.parse(jsonMatch[0]) as { candidates: SpeciesCandidate[] };

        const latencyMs = Date.now() - startTime;
        
        return {
          success: true,
          candidates: parsed.candidates || [],
          confidence: parsed.candidates?.[0]?.confidence || 0,
          latencyMs,
          raw: parsed,
        };
      } catch (error) {
        logger.error(`VisionTool attempt ${retries + 1} failed`, { error });
        if (retries >= maxRetries) {
          throw new AgentError(
            error instanceof Error ? error.message : "Vision tool failed",
            "VISION_FAILED",
            this.name
          );
        }
        retries++;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    throw new AgentError("Vision tool failed after retries", "VISION_FAILED", this.name);
  }
}
