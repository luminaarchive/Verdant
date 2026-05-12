export const PROMPT_VERSIONS = {
  vision: "vision-v1",
  audio: "audio-v1",
} as const;

export type PromptVersion = typeof PROMPT_VERSIONS[keyof typeof PROMPT_VERSIONS];

export const MODEL_NAME = "claude-sonnet-4-20250514";
