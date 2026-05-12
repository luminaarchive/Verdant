export type ErrorCode = 
  | "AGENT_FAILED" 
  | "VISION_FAILED" 
  | "AUDIO_FAILED" 
  | "GBIF_FAILED" 
  | "IUCN_FAILED" 
  | "ANOMALY_FAILED" 
  | "SPECIES_NOT_FOUND" 
  | "LOW_CONFIDENCE" 
  | "INVALID_INPUT" 
  | "UPLOAD_FAILED" 
  | "SYNC_FAILED" 
  | "UNAUTHORIZED" 
  | "NOT_FOUND" 
  | "RATE_LIMITED" 
  | "UNKNOWN";

export class AppError extends Error {
  code: ErrorCode;
  context?: Record<string, unknown>;

  constructor(message: string, code: ErrorCode = "UNKNOWN", context?: Record<string, unknown>) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.context = context;
  }
}

export class AgentError extends AppError {
  toolName?: string;

  constructor(message: string, code: ErrorCode, toolName?: string, context?: Record<string, unknown>) {
    super(message, code, context);
    this.name = "AgentError";
    this.toolName = toolName;
  }
}

export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) {
    return err;
  }
  
  if (err instanceof Error) {
    return new AppError(err.message, "UNKNOWN", { originalName: err.name });
  }

  return new AppError("An unknown error occurred", "UNKNOWN", { rawError: String(err) });
}

export function isRetryable(err: AppError): boolean {
  const retryableCodes: ErrorCode[] = [
    "GBIF_FAILED",
    "IUCN_FAILED",
    "AUDIO_FAILED",
    "VISION_FAILED",
  ];
  return retryableCodes.includes(err.code);
}
