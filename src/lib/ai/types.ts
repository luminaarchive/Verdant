// ─── AI Provider Abstraction Types ──────────────────────────────────────────

export interface ProviderRequest {
  query: string
  mode: 'focus' | 'deep' | 'analytica'
  systemPrompt: string
  userPrompt: string
  timeoutMs?: number
}

export interface ProviderResponse {
  content: string
  provider: string
  model: string
  inputTokens: number
  outputTokens: number
  durationMs: number
  estimatedCostUsd: number
}

export interface AIProvider {
  name: string
  call(req: ProviderRequest): Promise<ProviderResponse>
  isConfigured(): boolean
}

export interface ProviderHealthSnapshot {
  provider: string
  successCount: number
  failureCount: number
  totalLatencyMs: number
  lastFailure?: { time: number; error: string }
  lastSuccess?: number
}

export type FailureType = 'retryable' | 'non-retryable'

export interface ProviderFailure {
  provider: string
  error: string
  type: FailureType
  httpStatus?: number
  durationMs: number
}

export function classifyError(error: string, httpStatus?: number): FailureType {
  if (!httpStatus) return 'retryable'
  // Non-retryable: bad request, auth, model not found
  if ([400, 401, 403, 404, 422].includes(httpStatus)) {
    // Except rate limits disguised as 400
    if (error.toLowerCase().includes('rate') || error.toLowerCase().includes('quota')) return 'retryable'
    return 'non-retryable'
  }
  // Retryable: server errors, timeouts, rate limits
  return 'retryable'
}

// Model routing strategy per mode
export interface ModelStrategy {
  focus: { provider: string; model: string }[]
  deep: { provider: string; model: string }[]
  analytica: { provider: string; model: string }[]
}
