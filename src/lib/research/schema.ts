import { z } from 'zod'

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

export const SourceSchema = z.object({
  title: z.string(),
  url: z.string().optional(),
  author: z.string().optional(),
  year: z.string().optional(),
})
export type Source = z.infer<typeof SourceSchema>

export const EvidenceItemSchema = z.object({
  claim: z.string(),
  evidence: z.string(),
  sourceIndex: z.number().int().min(0),
  strength: z.enum(['strong', 'moderate', 'weak']).optional(),
})
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>

export const OutlineItemSchema = z.object({
  heading: z.string(),
  body: z.string(),
})
export type OutlineItem = z.infer<typeof OutlineItemSchema>

export const StatSchema = z.object({
  label: z.string(),
  value: z.string(),
})
export type Stat = z.infer<typeof StatSchema>

export const CostBreakdownSchema = z.object({
  model: z.string(),
  inputTokens: z.number().int(),
  outputTokens: z.number().int(),
  costUsd: z.number(),
})
export type CostBreakdown = z.infer<typeof CostBreakdownSchema>

export const GeminiResearchResponseSchema = z.object({
  title: z.string().min(1),
  executiveSummary: z.string().min(1),
  findings: z.array(z.string()).min(1),
  outline: z.array(OutlineItemSchema).optional().default([{ heading: 'Overview', body: '' }]),
  stats: z.array(StatSchema).optional().default([{ label: 'Data', value: 'N/A' }]),
  sources: z.array(SourceSchema).optional().default([{ title: 'General Knowledge' }]),
  discussionStarters: z.array(z.string()).optional().default(['What are the implications?']),
  evidenceItems: z.array(EvidenceItemSchema).optional().default([{ claim: '', evidence: '', sourceIndex: 0 }]),
  confidenceScore: z.number().min(0).max(100).optional().default(50),
  uncertaintyNotes: z.array(z.string()).optional().default([]),
})
export type GeminiResearchResponse = z.infer<typeof GeminiResearchResponseSchema>

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

export const ResearchRequestSchema = z.object({
  query: z.string().min(3).max(2000),
  mode: z.enum(['focus', 'deep', 'analytica']).default('focus'),
  idempotencyKey: z.string().optional(),
})
export type ResearchRequest = z.infer<typeof ResearchRequestSchema>

export const ExportRequestSchema = z.object({
  runId: z.string().min(1),
  format: z.enum(['pdf', 'docx']),
})
export type ExportRequest = z.infer<typeof ExportRequestSchema>

export const JournalEntrySchema = z.object({
  id: z.string().optional(),
  query: z.string(),
  title: z.string(),
  summary: z.string().optional(),
  runId: z.string().optional(),
  createdAt: z.string().optional(),
})
export type JournalEntry = z.infer<typeof JournalEntrySchema>

export const FeedbackRequestSchema = z.object({
  runId: z.string(),
  rating: z.enum(['positive', 'negative']),
  comment: z.string().max(1000).optional(),
})
export type FeedbackRequest = z.infer<typeof FeedbackRequestSchema>

export const ShareRequestSchema = z.object({
  runId: z.string(),
  expiresInHours: z.number().int().min(1).max(720).default(72),
})
export type ShareRequest = z.infer<typeof ShareRequestSchema>

export const RunStatusSchema = z.object({
  runId: z.string(),
  status: z.enum(['queued', 'processing', 'ready', 'failed']),
  progress: z.string().optional(),
  result: ResearchResultSchema.optional(),
  error: z.string().optional(),
})
export type RunStatus = z.infer<typeof RunStatusSchema>
