// ─── Report Template Layer ──────────────────────────────────────────────────
// Separates: data prep → template rendering → export input
// All export generators (DOCX, PDF, HTML) consume this intermediate format.

import type { ResearchResult, Source, EvidenceItem } from './schema'

export interface ReportSection {
  type: 'title' | 'subtitle' | 'heading' | 'paragraph' | 'bullets' | 'stat' | 'citation' | 'evidence' | 'divider' | 'metadata'
  content?: string
  items?: string[]
  label?: string
  value?: string
  source?: Source
  evidence?: EvidenceItem
  sourceIndex?: number
  level?: number
}

export function renderReportTemplate(result: ResearchResult): ReportSection[] {
  const sections: ReportSection[] = []

  // ── Title page ──
  sections.push({ type: 'title', content: result.title })
  sections.push({ type: 'metadata', label: 'Query', value: result.query })
  sections.push({ type: 'metadata', label: 'Mode', value: result.mode.charAt(0).toUpperCase() + result.mode.slice(1) })
  sections.push({ type: 'metadata', label: 'Generated', value: new Date(result.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) })
  sections.push({ type: 'metadata', label: 'Confidence', value: `${result.confidenceScore}/100` })
  sections.push({ type: 'metadata', label: 'Provider', value: result.pipelineSource })
  if (result.durationMs) {
    sections.push({ type: 'metadata', label: 'Duration', value: `${(result.durationMs / 1000).toFixed(1)}s` })
  }
  sections.push({ type: 'divider' })

  // ── Executive Intelligence Briefing ──
  sections.push({ type: 'heading', content: 'Executive Intelligence Briefing', level: 1 })
  if (typeof result.executiveSummary === 'object') {
    const es = result.executiveSummary
    if (es.whatMattersMost) { sections.push({ type: 'heading', content: 'What Matters Most', level: 2 }); sections.push({ type: 'paragraph', content: es.whatMattersMost }) }
    if (es.hiddenRisks) { sections.push({ type: 'heading', content: 'Hidden Risks', level: 2 }); sections.push({ type: 'paragraph', content: es.hiddenRisks }) }
    if (es.strategicImplications) { sections.push({ type: 'heading', content: 'Strategic Implications', level: 2 }); sections.push({ type: 'paragraph', content: es.strategicImplications }) }
    if (es.recommendedNextAction) { sections.push({ type: 'heading', content: 'Recommended Action', level: 2 }); sections.push({ type: 'paragraph', content: es.recommendedNextAction }) }
    if (es.whyThisMattersNow) { sections.push({ type: 'heading', content: 'Why This Matters Now', level: 2 }); sections.push({ type: 'paragraph', content: es.whyThisMattersNow }) }
  } else if (typeof result.executiveSummary === 'string') {
    sections.push({ type: 'paragraph', content: result.executiveSummary })
  }
  sections.push({ type: 'divider' })

  // ── Key Findings ──
  sections.push({ type: 'heading', content: 'Key Findings', level: 1 })
  sections.push({ type: 'bullets', items: result.findings })
  sections.push({ type: 'divider' })

  // ── Decision Recommendations ──
  if (result.decisionRecommendations && result.decisionRecommendations.length > 0) {
    sections.push({ type: 'heading', content: 'Decision Recommendations', level: 1 })
    for (const rec of result.decisionRecommendations) {
      sections.push({ type: 'heading', content: rec.recommendation, level: 2 })
      sections.push({ type: 'paragraph', content: rec.rationale })
      const tags = [`Risk: ${rec.riskLevel ?? 'medium'}`, `Urgency: ${rec.urgency ?? 'medium'}`]
      sections.push({ type: 'metadata', label: 'Assessment', value: tags.join(' · ') })
    }
    sections.push({ type: 'divider' })
  }

  // ── Data Snapshot ──
  if (result.stats.length > 0) {
    sections.push({ type: 'heading', content: 'Data Snapshot', level: 1 })
    for (const stat of result.stats) sections.push({ type: 'stat', label: stat.label, value: stat.value })
    sections.push({ type: 'divider' })
  }

  // ── Research Outline ──
  if (result.outline.length > 0) {
    sections.push({ type: 'heading', content: 'Detailed Analysis', level: 1 })
    for (const item of result.outline) {
      sections.push({ type: 'heading', content: item.heading, level: 2 })
      sections.push({ type: 'paragraph', content: item.body })
    }
    sections.push({ type: 'divider' })
  }

  // ── Evidence Panel ──
  if (result.evidenceItems.length > 0) {
    sections.push({ type: 'heading', content: 'Evidence Map', level: 1 })
    for (const ev of result.evidenceItems) {
      const src = result.sources[ev.sourceIndex]
      sections.push({ type: 'evidence', evidence: ev, source: src, sourceIndex: ev.sourceIndex })
    }
    sections.push({ type: 'divider' })
  }

  // ── Contradictions ──
  if (result.contradictions && result.contradictions.length > 0) {
    sections.push({ type: 'heading', content: 'Contradictions Detected', level: 1 })
    for (const c of result.contradictions) {
      sections.push({ type: 'paragraph', content: c.conflict })
      sections.push({ type: 'bullets', items: [`Position A: ${c.sourceA}`, `Position B: ${c.sourceB}`, `Implication: ${c.implication}`] })
    }
    sections.push({ type: 'divider' })
  }

  // ── Uncertainty Notes ──
  if (result.uncertaintyNotes.length > 0) {
    sections.push({ type: 'heading', content: 'Uncertainty & Limitations', level: 1 })
    const notes = result.uncertaintyNotes.map(n =>
      typeof n === 'object' ? `${n.uncertainty} — ${n.reason} (Resolution: ${n.whatWouldResolveIt})` : String(n)
    )
    sections.push({ type: 'bullets', items: notes })
    sections.push({ type: 'divider' })
  }

  // ── Strategic Follow-ups ──
  if (result.strategicFollowUps && result.strategicFollowUps.length > 0) {
    sections.push({ type: 'heading', content: 'Strategic Follow-up Questions', level: 1 })
    sections.push({ type: 'bullets', items: result.strategicFollowUps })
    sections.push({ type: 'divider' })
  }

  // ── Sources ──
  sections.push({ type: 'heading', content: 'Sources & Citations', level: 1 })
  result.sources.forEach((src, i) => sections.push({ type: 'citation', source: src, sourceIndex: i }))
  sections.push({ type: 'divider' })

  // ── Cost ──
  if (result.costBreakdown) {
    sections.push({ type: 'heading', content: 'Cost Breakdown', level: 1 })
    sections.push({ type: 'metadata', label: 'Model', value: result.costBreakdown.model })
    sections.push({ type: 'metadata', label: 'Input Tokens', value: result.costBreakdown.inputTokens.toLocaleString() })
    sections.push({ type: 'metadata', label: 'Output Tokens', value: result.costBreakdown.outputTokens.toLocaleString() })
    sections.push({ type: 'metadata', label: 'Cost', value: `$${result.costBreakdown.costUsd.toFixed(6)}` })
  }

  return sections
}

// ── Generate printable HTML (for Railway PDF service or browser print) ──────

export function renderReportHtml(result: ResearchResult): string {
  const sections = renderReportTemplate(result)
  const parts: string[] = []

  parts.push(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(result.title)} — Verdant Research Report</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Georgia', serif; color: #1A2F23; background: #fff; padding: 48px 56px; max-width: 800px; margin: 0 auto; line-height: 1.7; }
h1 { font-size: 28px; font-weight: 400; margin-bottom: 24px; letter-spacing: -0.5px; }
h2 { font-size: 20px; font-weight: 400; margin: 28px 0 12px; color: #1A2F23; }
h3 { font-size: 16px; font-weight: 400; margin: 20px 0 8px; color: #2E5D3E; }
p { font-family: 'Inter', system-ui, sans-serif; font-size: 14px; line-height: 1.75; margin-bottom: 12px; color: #434841; }
ul { padding-left: 20px; margin-bottom: 12px; }
li { font-family: 'Inter', system-ui, sans-serif; font-size: 13.5px; line-height: 1.7; margin-bottom: 8px; color: #434841; }
.meta { font-family: 'Inter', system-ui, sans-serif; font-size: 12px; color: #737870; margin-bottom: 4px; }
.meta strong { color: #434841; }
.divider { border: none; border-top: 1px solid rgba(26,47,35,0.1); margin: 24px 0; }
.stat { display: flex; gap: 12px; align-items: baseline; margin-bottom: 8px; }
.stat-value { font-family: Georgia, serif; font-size: 24px; color: #1A2F23; }
.stat-label { font-family: 'Inter', sans-serif; font-size: 12px; color: #737870; }
.evidence { background: #f9f8f4; border-left: 3px solid #2E5D3E; padding: 12px 16px; margin-bottom: 12px; border-radius: 0 8px 8px 0; }
.evidence-claim { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; color: #1A2F23; margin-bottom: 4px; }
.evidence-body { font-family: 'Inter', sans-serif; font-size: 12.5px; color: #434841; }
.evidence-source { font-family: 'Inter', sans-serif; font-size: 11px; color: #737870; margin-top: 4px; }
.citation { font-family: 'Inter', sans-serif; font-size: 13px; margin-bottom: 8px; color: #434841; }
.citation-index { display: inline-block; width: 20px; height: 20px; background: #f3f1eb; border-radius: 4px; text-align: center; line-height: 20px; font-size: 10px; font-weight: 700; color: #737870; margin-right: 8px; }
.footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid rgba(26,47,35,0.1); font-family: 'Inter', sans-serif; font-size: 11px; color: #737870; }
@media print { body { padding: 24px 32px; } }
</style></head><body>`)

  for (const s of sections) {
    switch (s.type) {
      case 'title':
        parts.push(`<h1>${escapeHtml(s.content ?? '')}</h1>`)
        break
      case 'heading':
        parts.push(s.level === 2 ? `<h3>${escapeHtml(s.content ?? '')}</h3>` : `<h2>${escapeHtml(s.content ?? '')}</h2>`)
        break
      case 'paragraph':
        parts.push(`<p>${escapeHtml(s.content ?? '')}</p>`)
        break
      case 'bullets':
        parts.push('<ul>')
        for (const item of s.items ?? []) parts.push(`<li>${escapeHtml(item)}</li>`)
        parts.push('</ul>')
        break
      case 'stat':
        parts.push(`<div class="stat"><span class="stat-value">${escapeHtml(s.value ?? '')}</span><span class="stat-label">${escapeHtml(s.label ?? '')}</span></div>`)
        break
      case 'metadata':
        parts.push(`<p class="meta"><strong>${escapeHtml(s.label ?? '')}:</strong> ${escapeHtml(s.value ?? '')}</p>`)
        break
      case 'evidence':
        if (s.evidence) {
          const src = s.source
          parts.push(`<div class="evidence"><p class="evidence-claim">${escapeHtml(s.evidence.claim)}</p><p class="evidence-body">${escapeHtml(s.evidence.evidence)}</p>${src ? `<p class="evidence-source">Source [${(s.sourceIndex ?? 0) + 1}]: ${escapeHtml(src.title)}</p>` : ''}</div>`)
        }
        break
      case 'citation':
        if (s.source) {
          const idx = (s.sourceIndex ?? 0) + 1
          const parts2 = [s.source.title, s.source.author, s.source.year].filter(Boolean).join(' · ')
          parts.push(`<p class="citation"><span class="citation-index">${idx}</span>${escapeHtml(parts2)}${s.source.url ? ` — <a href="${escapeHtml(s.source.url)}" target="_blank">${escapeHtml(s.source.url)}</a>` : ''}</p>`)
        }
        break
      case 'divider':
        parts.push('<hr class="divider">')
        break
    }
  }

  parts.push(`<div class="footer"><p>Generated by Verdant AI Research Platform · ${new Date().toISOString().split('T')[0]}</p></div></body></html>`)

  return parts.join('\n')
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
