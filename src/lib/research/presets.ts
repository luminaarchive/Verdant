// ─── Environmental Domain Presets ────────────────────────────────────────────
// Role-based research framing for specialized environmental intelligence.

export interface DomainPreset {
  id: string
  label: string
  icon: string
  description: string
  promptModifier: string
  priorityFocus: string[]
  suggestedTemplates: string[]
}

export const PRESETS: DomainPreset[] = [
  {
    id: 'ngo',
    label: 'NGO / Conservation',
    icon: 'volunteer_activism',
    description: 'Field action, intervention priority, funding efficiency',
    promptModifier: 'Frame analysis for conservation NGO decision-makers. Prioritize: intervention feasibility, field implementation, community engagement, donor reporting metrics, and cost-per-outcome. Emphasize actionable recommendations over theoretical analysis.',
    priorityFocus: ['intervention priority', 'funding efficiency', 'field action', 'community impact'],
    suggestedTemplates: ['conservation-priority', 'ngo-grant', 'ecosystem-intervention', 'conservation-funding'],
  },
  {
    id: 'sustainability',
    label: 'Sustainability Team',
    icon: 'eco',
    description: 'Operational risk, compliance, supply chain impact',
    promptModifier: 'Frame analysis for corporate sustainability professionals. Prioritize: material risk identification, regulatory compliance, supply chain environmental exposure, ESG reporting requirements, and competitive benchmarking.',
    priorityFocus: ['operational risk', 'compliance gaps', 'supply chain', 'ESG metrics'],
    suggestedTemplates: ['sustainability-risk', 'esg-exposure', 'due-diligence'],
  },
  {
    id: 'government',
    label: 'Government / Policy',
    icon: 'gavel',
    description: 'Policy implementation, public impact, regulatory design',
    promptModifier: 'Frame analysis for government policy-makers and regulators. Prioritize: policy effectiveness evidence, implementation feasibility, public impact assessment, enforcement mechanisms, and international compliance obligations.',
    priorityFocus: ['policy effectiveness', 'public impact', 'implementation', 'enforcement'],
    suggestedTemplates: ['policy-impact', 'climate-risk', 'biodiversity-threat'],
  },
  {
    id: 'researcher',
    label: 'Researcher / Academic',
    icon: 'science',
    description: 'Methodology, evidence strength, literature gaps',
    promptModifier: 'Frame analysis for academic researchers and scientists. Prioritize: methodological rigor, evidence quality assessment, literature gap identification, conflicting findings analysis, and research direction recommendations. Use precise scientific terminology.',
    priorityFocus: ['methodology', 'evidence strength', 'literature gaps', 'research directions'],
    suggestedTemplates: ['literature-consensus', 'species-risk', 'biodiversity-threat'],
  },
  {
    id: 'consultant',
    label: 'Environmental Consultant',
    icon: 'engineering',
    description: 'Client deliverables, regulatory compliance, site assessment',
    promptModifier: 'Frame analysis for environmental consulting professionals. Prioritize: regulatory compliance requirements, site-specific risk assessment, remediation cost estimates, permitting timeline, and client-ready recommendations.',
    priorityFocus: ['regulatory compliance', 'site assessment', 'remediation', 'permitting'],
    suggestedTemplates: ['due-diligence', 'sustainability-risk', 'policy-impact'],
  },
  {
    id: 'esg',
    label: 'ESG / Compliance',
    icon: 'shield',
    description: 'Compliance risk, exposure analysis, investor reporting',
    promptModifier: 'Frame analysis for ESG and compliance teams. Prioritize: regulatory exposure, compliance gaps, investor reporting requirements, peer benchmarking, and financial materiality of environmental risks.',
    priorityFocus: ['compliance risk', 'investor reporting', 'financial materiality', 'peer comparison'],
    suggestedTemplates: ['esg-exposure', 'sustainability-risk', 'climate-risk'],
  },
  {
    id: 'climate-analyst',
    label: 'Climate Risk Analyst',
    icon: 'thermostat',
    description: 'Physical risk, transition risk, scenario modeling',
    promptModifier: 'Frame analysis for climate risk professionals. Prioritize: physical and transition risk quantification, scenario analysis (RCP/SSP pathways), financial exposure modeling, adaptation cost-benefit, and tipping point identification.',
    priorityFocus: ['physical risk', 'transition risk', 'scenario analysis', 'adaptation'],
    suggestedTemplates: ['climate-risk', 'sustainability-risk', 'policy-impact'],
  },
  {
    id: 'funding',
    label: 'Conservation Funding',
    icon: 'savings',
    description: 'Grant allocation, impact measurement, donor strategy',
    promptModifier: 'Frame analysis for conservation funding decision-makers. Prioritize: impact-per-dollar metrics, measurable outcomes, scalability potential, donor alignment, and long-term financial sustainability of conservation investments.',
    priorityFocus: ['impact-per-dollar', 'measurable outcomes', 'scalability', 'donor alignment'],
    suggestedTemplates: ['conservation-funding', 'ngo-grant', 'conservation-priority'],
  },
]

export function getPresetById(id: string): DomainPreset | undefined {
  return PRESETS.find(p => p.id === id)
}

export function getPresetPromptModifier(presetId?: string): string {
  if (!presetId) return ''
  const preset = getPresetById(presetId)
  return preset ? `\n\nDOMAIN CONTEXT: ${preset.promptModifier}` : ''
}
