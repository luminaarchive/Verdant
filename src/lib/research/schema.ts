import { z } from 'zod'

// ─── API Error Contract ─────────────────────────────────────────────────────
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

// ─── Executive Summary (structured, not a paragraph) ────────────────────────
export const ExecutiveSummarySchema = z.object({
  whatMattersMost: z.string(),
  hiddenRisks: z.string(),
  strategicImplications: z.string(),
  recommendedNextAction: z.string(),
  whyThisMattersNow: z.string(),
})
export type ExecutiveSummary = z.infer<typeof ExecutiveSummarySchema>

// ─── Decision Recommendation ────────────────────────────────────────────────
export const DecisionRecommendationSchema = z.object({
  recommendation: z.string(),
  rationale: z.string(),
  evidenceRefs: z.array(z.number().int().min(0)).optional().default([]),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
  urgency: z.enum(['low', 'medium', 'high', 'immediate']).optional().default('medium'),
})
export type DecisionRecommendation = z.infer<typeof DecisionRecommendationSchema>

// ─── Evidence Item (enhanced with confidence per claim) ─────────────────────
export const EvidenceItemSchema = z.object({
  claim: z.string(),
  evidence: z.string(),
  sourceIndex: z.number().int().min(0),
  strength: z.enum(['strong', 'moderate', 'weak']).optional().default('moderate'),
  confidence: z.number().min(0).max(100).optional(),
})
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>

// ─── Contradiction ──────────────────────────────────────────────────────────
export const ContradictionSchema = z.object({
  conflict: z.string(),
  sourceA: z.string(),
  sourceB: z.string(),
  implication: z.string(),
})
export type Contradiction = z.infer<typeof ContradictionSchema>

// ─── Uncertainty Note (enhanced) ────────────────────────────────────────────
export const UncertaintyNoteSchema = z.object({
  uncertainty: z.string(),
  reason: z.string(),
  whatWouldResolveIt: z.string(),
})
export type UncertaintyNote = z.infer<typeof UncertaintyNoteSchema>

// ─── Outline + Stat ─────────────────────────────────────────────────────────
export const OutlineItemSchema = z.object({ heading: z.string(), body: z.string() })
export type OutlineItem = z.infer<typeof OutlineItemSchema>
export const StatSchema = z.object({ label: z.string(), value: z.string() })
export type Stat = z.infer<typeof StatSchema>

// ─── Cost Breakdown ─────────────────────────────────────────────────────────
export const CostBreakdownSchema = z.object({
  model: z.string(),
  inputTokens: z.number().int(),
  outputTokens: z.number().int(),
  costUsd: z.number(),
})
export type CostBreakdown = z.infer<typeof CostBreakdownSchema>

// ─── AI Response Schema (what the model returns) ────────────────────────────
export const GeminiResearchResponseSchema = z.object({
  title: z.string().min(1),
  executiveSummary: ExecutiveSummarySchema,
  findings: z.array(z.string()).min(1),
  decisionRecommendations: z.array(DecisionRecommendationSchema).optional().default([]),
  outline: z.array(OutlineItemSchema).optional().default([]),
  stats: z.array(StatSchema).optional().default([]),
  sources: z.array(SourceSchema).optional().default([]),
  evidenceItems: z.array(EvidenceItemSchema).optional().default([]),
  contradictions: z.array(ContradictionSchema).optional().default([]),
  confidenceScore: z.number().min(0).max(100).optional().default(50),
  uncertaintyNotes: z.array(UncertaintyNoteSchema).optional().default([]),
  strategicFollowUps: z.array(z.string()).optional().default([]),
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

// ─── Request Schemas ────────────────────────────────────────────────────────
export const ResearchRequestSchema = z.object({
  query: z.string().min(3).max(2000),
  mode: z.enum(['focus', 'deep', 'analytica']).default('focus'),
  idempotencyKey: z.string().optional(),
  presetId: z.string().optional(),
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
