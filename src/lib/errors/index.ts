// NaLI: Structured Error Architecture

export class NaLIError extends Error {
  public statusCode: number;
  public severity: 'info' | 'warning' | 'error' | 'critical';

  constructor(message: string, statusCode = 500, severity: 'info' | 'warning' | 'error' | 'critical' = 'error') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.severity = severity;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class VisionFailedError extends NaLIError {
  constructor(message = "Vision engine failed to identify morphological features") {
    super(message, 422, 'error');
  }
}

export class GBIFFailedError extends NaLIError {
  constructor(message = "GBIF cross-reference service unavailable or timed out") {
    super(message, 502, 'warning'); // Might not be critical if fallback exists
  }
}

export class IUCNFailedError extends NaLIError {
  constructor(message = "IUCN Red List analysis failed") {
    super(message, 502, 'warning');
  }
}

export class OfflineSyncError extends NaLIError {
  constructor(message = "Failed to sync offline queue to remote") {
    super(message, 503, 'warning');
  }
}

export class SpeciesNotFoundError extends NaLIError {
  constructor(message = "Species could not be confidently identified in reference catalog") {
    super(message, 404, 'info'); // Handled gracefully via 'review_needed'
  }
}

export function toAppError(error: unknown): AppError {
  if (error instanceof NaLIError) {
    return { message: error.message, code: error.name, details: { severity: error.severity, statusCode: error.statusCode } };
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: String(error) };
}

// Backward compatibility for legacy tools
export class AgentError extends NaLIError {
  public code: string;
  public toolName: string;
  constructor(message: string, code: string = 'AGENT_ERROR', toolName: string = 'unknown') {
    super(message, 500, 'error');
    this.code = code;
    this.toolName = toolName;
  }
}

export interface AppError {
  message: string;
  code?: string;
  details?: any;
}
