// ─── Environmental Intelligence Templates ───────────────────────────────────
// Decision-grade research templates for environmental domain authority.

export interface EnvironmentalTemplate {
  id: string
  title: string
  subtitle: string
  icon: string
  category: 'assessment' | 'policy' | 'conservation' | 'risk' | 'research' | 'funding'
  prompt: string
  followUps: string[]
  presetHint?: string
}

export const TEMPLATES: EnvironmentalTemplate[] = [
  {
    id: 'species-risk',
    title: 'Species Risk Assessment',
    subtitle: 'Which species faces highest extinction risk and why?',
    icon: 'pest_control',
    category: 'assessment',
    prompt: 'Conduct a species risk assessment identifying the most critically endangered species in the target region, analyzing population trends, habitat loss drivers, genetic diversity status, and existing protection gaps. Prioritize by extinction probability within 10 years.',
    followUps: [
      'Compare conservation strategies for the highest-risk species identified',
      'Identify funding bottlenecks preventing effective species protection',
      'Evaluate policy protection gaps for endangered species in this region',
      'Simulate 10-year extinction probability under current intervention levels',
    ],
  },
  {
    id: 'biodiversity-threat',
    title: 'Biodiversity Threat Analysis',
    subtitle: 'What is causing ecosystem decline and where?',
    icon: 'warning',
    category: 'assessment',
    prompt: 'Analyze the primary threats to biodiversity in the target ecosystem, including habitat fragmentation, invasive species, pollution, climate change impacts, and human encroachment. Map threat severity by geographic zone and identify tipping points.',
    followUps: [
      'Compare geographic threat zones by severity and intervention feasibility',
      'Identify cascading ecosystem collapse risks from primary threats',
      'Evaluate which threat mitigation strategy offers highest biodiversity return',
      'Assess indigenous community impact and co-management opportunities',
    ],
  },
  {
    id: 'conservation-priority',
    title: 'Conservation Priority Mapping',
    subtitle: 'Which intervention should be prioritized first?',
    icon: 'pin_drop',
    category: 'conservation',
    prompt: 'Map conservation priorities for the target region using systematic conservation planning criteria: irreplaceability, vulnerability, cost-effectiveness, community support, and connectivity. Recommend the top 3 intervention priorities with evidence-based justification.',
    followUps: [
      'Compare cost-effectiveness of top conservation interventions',
      'Identify stakeholder conflicts that may block priority interventions',
      'Evaluate corridor connectivity between priority conservation areas',
      'Assess long-term sustainability of recommended interventions without continued funding',
    ],
  },
  {
    id: 'policy-impact',
    title: 'Environmental Policy Impact Review',
    subtitle: 'What policy creates the greatest environmental impact?',
    icon: 'gavel',
    category: 'policy',
    prompt: 'Review the environmental impact of current and proposed policies in the target jurisdiction. Evaluate policy effectiveness using empirical evidence, compare with international best practices, and identify implementation failures and unintended consequences.',
    followUps: [
      'Detect implementation failure risks in recommended policies',
      'Compare alternative policy scenarios and their environmental outcomes',
      'Identify stakeholder resistance points and political feasibility',
      'Simulate long-term environmental outcomes under different policy trajectories',
    ],
  },
  {
    id: 'climate-risk',
    title: 'Climate Risk Intelligence',
    subtitle: 'What climate threats create highest future risk?',
    icon: 'thermostat',
    category: 'risk',
    prompt: 'Assess climate risk exposure for the target region or sector, including physical risks (extreme weather, sea-level rise, temperature shifts), transition risks (regulatory changes, market shifts), and ecological tipping points. Quantify risk probability and impact severity.',
    followUps: [
      'Compare adaptation strategies by cost-effectiveness and implementation timeline',
      'Identify climate tipping points with cascading ecological consequences',
      'Evaluate insurance and financial exposure from identified climate risks',
      'Assess community resilience and vulnerable population exposure',
    ],
  },
  {
    id: 'sustainability-risk',
    title: 'Sustainability Risk Assessment',
    subtitle: 'What sustainability failures create operational risk?',
    icon: 'eco',
    category: 'risk',
    prompt: 'Assess sustainability risks across environmental, social, and governance dimensions for the target organization or sector. Identify material risks, regulatory exposure, supply chain vulnerabilities, and reputational threats from sustainability failures.',
    followUps: [
      'Compare mitigation strategies for highest-severity sustainability risks',
      'Identify hidden supply chain environmental liabilities',
      'Evaluate competitive positioning impact from sustainability performance',
      'Assess regulatory timeline and compliance cost projections',
    ],
  },
  {
    id: 'esg-exposure',
    title: 'ESG Exposure Analysis',
    subtitle: 'What environmental liabilities threaten the organization?',
    icon: 'shield',
    category: 'risk',
    prompt: 'Conduct an ESG exposure analysis focusing on environmental liabilities: carbon footprint, water usage, waste management, biodiversity impact, regulatory compliance gaps, and emerging environmental litigation risks. Benchmark against sector peers.',
    followUps: [
      'Assess compliance failure cost and regulatory penalty exposure',
      'Compare ESG improvement strategies by ROI and implementation speed',
      'Identify hidden regulatory exposure from upcoming environmental legislation',
      'Evaluate investor and market reaction risk from ESG underperformance',
    ],
  },
  {
    id: 'ngo-grant',
    title: 'NGO Grant Research Brief',
    subtitle: 'Which environmental initiatives deserve funding priority?',
    icon: 'volunteer_activism',
    category: 'funding',
    prompt: 'Evaluate environmental initiatives competing for grant funding. Assess each by: measurable impact potential, cost-effectiveness, scalability, community engagement, scientific basis, and alignment with global conservation frameworks (Kunming-Montreal, Paris Agreement).',
    followUps: [
      'Compare impact-per-dollar across competing environmental initiatives',
      'Identify which initiatives have strongest evidence base for donor reporting',
      'Evaluate scalability potential and replication feasibility',
      'Assess long-term sustainability without continued grant funding',
    ],
  },
  {
    id: 'due-diligence',
    title: 'Environmental Due Diligence',
    subtitle: 'What hidden ecological risks exist before action?',
    icon: 'search',
    category: 'assessment',
    prompt: 'Conduct environmental due diligence for the target project, site, or investment. Identify: contamination risks, protected species presence, water resource impacts, regulatory compliance requirements, community environmental concerns, and remediation cost estimates.',
    followUps: [
      'Estimate remediation costs for identified environmental liabilities',
      'Evaluate regulatory approval probability and timeline',
      'Identify community opposition risks and mitigation strategies',
      'Compare alternative sites or approaches with lower environmental risk',
    ],
  },
  {
    id: 'ecosystem-intervention',
    title: 'Ecosystem Intervention Decision',
    subtitle: 'Which restoration strategy creates highest impact?',
    icon: 'park',
    category: 'conservation',
    prompt: 'Evaluate ecosystem restoration strategies for the target area. Compare: natural regeneration, assisted regeneration, active restoration, and novel ecosystem approaches. Assess by biodiversity outcomes, carbon sequestration, cost, timeline, and community co-benefits.',
    followUps: [
      'Compare long-term biodiversity outcomes across restoration strategies',
      'Identify monitoring protocols needed to verify restoration success',
      'Evaluate community livelihood co-benefits from restoration approaches',
      'Assess climate resilience of restored ecosystems under warming scenarios',
    ],
  },
  {
    id: 'literature-consensus',
    title: 'Scientific Literature Review',
    subtitle: 'What does peer-reviewed evidence actually support?',
    icon: 'menu_book',
    category: 'research',
    prompt: 'Conduct a systematic review of peer-reviewed literature on the target environmental topic. Identify: scientific consensus, evidence strength, methodology gaps, conflicting findings, and emerging research directions. Distinguish well-supported claims from preliminary findings.',
    followUps: [
      'Identify methodology gaps that weaken current evidence base',
      'Compare conflicting findings and assess which position has stronger support',
      'Evaluate emerging research directions that may shift current consensus',
      'Assess what additional studies would most strengthen the evidence base',
    ],
  },
  {
    id: 'conservation-funding',
    title: 'Conservation Funding Decision',
    subtitle: 'Where should limited resources be allocated first?',
    icon: 'savings',
    category: 'funding',
    prompt: 'Analyze conservation funding allocation for the target region or portfolio. Evaluate: cost-effectiveness of current allocations, underfunded priorities, donor alignment, measurable outcome tracking, and optimal reallocation scenarios to maximize conservation impact per dollar.',
    followUps: [
      'Identify the most underfunded conservation priorities with highest impact potential',
      'Compare donor requirement alignment across funding sources',
      'Evaluate outcome measurement frameworks for conservation investments',
      'Simulate optimal budget reallocation scenarios for maximum biodiversity impact',
    ],
  },
]

export const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: 'apps' },
  { id: 'assessment', label: 'Assessment', icon: 'analytics' },
  { id: 'conservation', label: 'Conservation', icon: 'park' },
  { id: 'policy', label: 'Policy', icon: 'gavel' },
  { id: 'risk', label: 'Risk', icon: 'warning' },
  { id: 'research', label: 'Research', icon: 'menu_book' },
  { id: 'funding', label: 'Funding', icon: 'savings' },
] as const
