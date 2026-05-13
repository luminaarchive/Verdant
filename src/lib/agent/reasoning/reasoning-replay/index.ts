// NaLI: Reasoning History and Replay

export interface ReasoningReplayEntry {
  reasoning_trace_id: string;
  reasoning_version: string;
  provider_version: string;
  reviewer_override_count: number;
  ecological_confidence: number;
}

export interface ReasoningReplayResult {
  reasoning_trace_id: string;
  versions: string[];
  provider_versions: string[];
  reviewer_override_delta: number;
  confidence_delta: number;
}

function round(value: number): number {
  return Number(value.toFixed(2));
}

export function replayReasoningHistory(entries: ReasoningReplayEntry[]): ReasoningReplayResult {
  if (entries.length === 0) {
    return {
      reasoning_trace_id: "trace:empty",
      versions: [],
      provider_versions: [],
      reviewer_override_delta: 0,
      confidence_delta: 0,
    };
  }

  const first = entries[0];
  const last = entries[entries.length - 1];

  return {
    reasoning_trace_id: first.reasoning_trace_id,
    versions: entries.map((entry) => entry.reasoning_version),
    provider_versions: entries.map((entry) => entry.provider_version),
    reviewer_override_delta: last.reviewer_override_count - first.reviewer_override_count,
    confidence_delta: round(last.ecological_confidence - first.ecological_confidence),
  };
}
