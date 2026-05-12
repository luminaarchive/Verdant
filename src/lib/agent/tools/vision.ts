import { Anthropic } from "@anthropic-ai/sdk";
import { config } from "../../config";
import type { AgentTool, ToolInput, ToolOutput, SpeciesCandidate } from "../../../types/agent";
import { logger } from "../../logger";
import { AgentError } from "../../errors";

const SYSTEM_PROMPT = `
You are NaLI, a wildlife species identification expert specializing in Indonesian fauna. 
Analyze the provided image and identify the species.

Respond ONLY in this exact JSON format, no other text:
{
  "candidates": [
    {
      "scientificName": "string",
      "commonNameId": "string (Indonesian name)",
      "confidence": number (0.0 to 1.0),
      "gbifTaxonKey": number or null,
      "iucnId": "string or null"
    }
  ],
  "notes": "string (any important observations about image quality, partial visibility, etc)"
}

Rules:
- Return maximum 3 candidates, ordered by confidence descending
- If image quality is too poor to identify, return empty candidates array with notes explaining why
- Never guess with confidence above 0.4 if image is unclear
- Focus on Indonesian fauna: Sumatra, Java, Kalimantan, Sulawesi, Papua, Nusa Tenggara
`;

export default class VisionTool implements AgentTool {
  name: "vision" = "vision";
  version: string = "vision-v1";

  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: config.anthropic.apiKey,
    });
  }

  async execute(input: ToolInput): Promise<ToolOutput> {
    if (!input.photoUrl) {
      throw new AgentError("Missing photoUrl in ToolInput", "INVALID_INPUT", this.name);
    }

    const startTime = Date.now();

    try {
      logger.debug("Fetching image for vision analysis", { url: input.photoUrl });
      const imageResponse = await fetch(input.photoUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
      }
      const arrayBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString("base64");
      const mediaType = imageResponse.headers.get("content-type") || "image/jpeg";

      logger.debug("Sending image to Anthropic");
      const message = await this.client.messages.create({
        model: config.anthropic.model,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType as any,
                  data: base64Image,
                },
              },
              ...(input.text ? [{ type: "text" as const, text: input.text }] : []),
            ],
          },
        ],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      
      let parsedResponse: { candidates: SpeciesCandidate[]; notes: string };
      try {
        parsedResponse = JSON.parse(responseText);
      } catch (parseError) {
        logger.error("Failed to parse Anthropic JSON response", { responseText });
        throw new Error("Invalid JSON response from vision model");
      }

      const latencyMs = Date.now() - startTime;
      const topConfidence = parsedResponse.candidates.length > 0 ? parsedResponse.candidates[0].confidence : 0;

      return {
        success: true,
        candidates: parsedResponse.candidates,
        confidence: topConfidence,
        latencyMs,
        raw: parsedResponse,
      };

    } catch (error) {
      const latencyMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("Vision tool failed", { error: errorMessage, latencyMs });
      
      throw new AgentError(errorMessage, "VISION_FAILED", this.name, { originalError: error });
    }
  }

  async fallback(): Promise<ToolOutput> {
    return {
      success: false,
      error: "Vision tool unavailable",
      latencyMs: 0,
    };
  }
}
