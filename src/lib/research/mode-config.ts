// ─── Mode Configuration ─────────────────────────────────────────────────────
// Per-mode report length, source count, and timeout settings.
// Used by Inngest pipeline and system prompt construction.

export const MODE_CONFIG = {
  focus: {
    label: 'Focus - Fast Strategic Intelligence',
    targetPages: { min: 5, max: 8 },
    targetWords: { min: 2000, max: 3000 },
    maxSources: 10,
    timeoutMinutes: 1,
    inngestTimeout: '2m' as const,
    reportFormat: 'Executive Brief',
    promptAddition: `Generate a concise research brief. Target length: 5-8 pages (approximately 2,000-3,000 words). Prioritize clarity and actionability over comprehensiveness. Use bullet points where appropriate. This is a fast strategic intelligence product - every word must earn its place.`,
  },
  deep: {
    label: 'Deep - Professional Research Report',
    targetPages: { min: 10, max: 15 },
    targetWords: { min: 4000, max: 6000 },
    maxSources: 20,
    timeoutMinutes: 3,
    inngestTimeout: '5m' as const,
    reportFormat: 'Research Paper',
    promptAddition: `Generate a detailed research paper. Target length: 10-15 pages (approximately 4,000-6,000 words). Include full academic paper structure with Abstract, Introduction, Methodology, Literature Review, Findings, Analysis, Discussion, Recommendations, References, and Uncertainty Declaration. All claims must be sourced. Include uncertainty declaration. This report must be suitable for institutional use.`,
  },
  analytica: {
    label: 'Analytica - International Journal-Grade Intelligence',
    targetPages: { min: 20, max: 30 },
    targetWords: { min: 8000, max: 12000 },
    maxSources: 30,
    timeoutMinutes: 10,
    inngestTimeout: '15m' as const,
    reportFormat: 'International Journal-Grade Report',
    promptAddition: `Generate a comprehensive international journal-grade environmental research report. Target length: 20-30 pages (approximately 8,000-12,000 words minimum). This report must be suitable for submission to peer-reviewed environmental journals. Include all standard academic sections: Cover Page, Abstract (EN + ID), Table of Contents, Executive Summary, Introduction & Background, Theoretical Framework, Methodology & Data Sources, Primary Findings, Species/Ecosystem Analysis (if applicable), Threat Assessment, Statistical Analysis & Data Visualization, Policy Implications, Conservation/Action Recommendations, Limitations & Uncertainty Declaration, Future Research Directions, References (formatted), Appendices. Every claim must be supported by verifiable sources with DOI where available. Include confidence scores per major claim. The report must be coherent and consistent from introduction to conclusion - all sections must reference and build upon each other. Do not truncate. Complete all sections fully.

CONSISTENCY REQUIREMENTS:
- Every section must reference findings established in previous sections
- The Introduction must preview all major findings
- The Conclusion must directly address every point raised in the Introduction
- Species names, statistics, and data points must be identical throughout (no contradictions)
- Recommendations must be directly traceable to specific findings in the Analysis section
- Do not introduce new facts in the Conclusion that were not established earlier
- Maintain consistent scientific terminology throughout
- If a claim is uncertain, mark it as such consistently every time it appears`,
  },
} as const

export type ResearchMode = keyof typeof MODE_CONFIG
