import { z } from 'zod'

// ─── API Response Contract ──────────────────────────────────────────────────
// Every API response MUST conform to this contract.
// Frontend can always rely on these fields.

export const ApiErrorSchema = z.object({
  ok: z.literal(false),
  status: z.number(),
  message: z.string(),
  retryable: z.boolean(),
  failedStep: z.string().optional(),
  runId: z.string().optional(),
  requestId: z.string().optional(),
})

export type ApiError = z.infer<typeof ApiErrorSchema>

// ─── Source ─────────────────────────────────────────────────────────────────

export const SourceSchema = z.object({
  title: z.string(),
  url: z.string().optional(),
  author: z.string().optional(),
  year: z.string().optional(),
})

export type Source = z.infer<typeof SourceSchema>

// ─── Evidence Item ──────────────────────────────────────────────────────────

export const EvidenceItemSchema = z.object({
  claim: z.string(),
  evidence: z.string(),
  sourceIndex: z.number().int().min(0),
  strength: z.enum(['strong', 'moderate', 'weak']).optional(),
})

export type EvidenceItem = z.infer<typeof EvidenceItemSchema>

// ─── Outline Item ───────────────────────────────────────────────────────────

export const OutlineItemSchema = z.object({
  heading: z.string(),
  body: z.string(),
})

export type OutlineItem = z.infer<typeof OutlineItemSchema>

// ─── Stat ───────────────────────────────────────────────────────────────────

export const StatSchema = z.object({
  label: z.string(),
  value: z.string(),
})

export type Stat = z.infer<typeof StatSchema>

// ─── Cost Breakdown ─────────────────────────────────────────────────────────

export const CostBreakdownSchema = z.object({
  model: z.string(),
  inputTokens: z.number().int(),
  outputTokens: z.number().int(),
  costUsd: z.number(),
})

export type CostBreakdown = z.infer<typeof CostBreakdownSchema>

// ─── Gemini Raw Response (what Gemini sends back) ───────────────────────────

export const GeminiResearchResponseSchema = z.object({
  title: z.string().min(1),
  executiveSummary: z.string().min(1),
  findings: z.array(z.string()).min(1),
  outline: z.array(OutlineItemSchema).min(1),
  stats: z.array(StatSchema).min(1),
  sources: z.array(SourceSchema).min(1),
  discussionStarters: z.array(z.string()).min(1),
  evidenceItems: z.array(EvidenceItemSchema).min(1),
  confidenceScore: z.number().min(0).max(100),
  uncertaintyNotes: z.array(z.string()),
})

export type GeminiResearchResponse = z.infer<typeof GeminiResearchResponseSchema>

// ─── Full Research Result (what we return to the frontend) ──────────────────

export const ResearchResultSchema = GeminiResearchResponseSchema.extend({
  runId: z.string(),
  query: z.string(),
  mode: z.string(),
  pipelineSource: z.enum(['openrouter', 'gemini-direct', 'n8n-fallback', 'cache']),
  costBreakdown: CostBreakdownSchema.optional(),
  createdAt: z.string(),
  status: z.enum(['queued', 'processing', 'ready', 'failed']),
  durationMs: z.number().optional(),
})

export type ResearchResult = z.infer<typeof ResearchResultSchema>

// ─── Research Request ───────────────────────────────────────────────────────

export const ResearchRequestSchema = z.object({
  query: z.string().min(3).max(2000),
  mode: z.enum(['focus', 'deep', 'analytica']).default('focus'),
  idempotencyKey: z.string().optional(),
})

export type ResearchRequest = z.infer<typeof ResearchRequestSchema>

// ─── Export Request ─────────────────────────────────────────────────────────

export const ExportRequestSchema = z.object({
  runId: z.string().min(1),
  format: z.enum(['pdf', 'docx']),
})

export type ExportRequest = z.infer<typeof ExportRequestSchema>

// ─── Journal Entry ──────────────────────────────────────────────────────────

export const JournalEntrySchema = z.object({
  id: z.string().optional(),
  query: z.string(),
  title: z.string(),
  summary: z.string().optional(),
  runId: z.string().optional(),
  createdAt: z.string().optional(),
})

export type JournalEntry = z.infer<typeof JournalEntrySchema>

// ─── Feedback ───────────────────────────────────────────────────────────────

export const FeedbackRequestSchema = z.object({
  runId: z.string(),
  rating: z.enum(['positive', 'negative']),
  comment: z.string().max(1000).optional(),
})

export type FeedbackRequest = z.infer<typeof FeedbackRequestSchema>

// ─── Share ──────────────────────────────────────────────────────────────────

export const ShareRequestSchema = z.object({
  runId: z.string(),
  expiresInHours: z.number().int().min(1).max(720).default(72),
})

export type ShareRequest = z.infer<typeof ShareRequestSchema>

// ─── Run Status (for polling) ───────────────────────────────────────────────

export const RunStatusSchema = z.object({
  runId: z.string(),
  status: z.enum(['queued', 'processing', 'ready', 'failed']),
  progress: z.string().optional(),
  result: ResearchResultSchema.optional(),
  error: z.string().optional(),
})

export type RunStatus = z.infer<typeof RunStatusSchema>
