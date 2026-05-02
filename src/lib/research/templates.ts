// ─── Environmental Intelligence Templates ───────────────────────────────────
// Decision-grade research templates for environmental domain authority.

export type TemplateDomain = 'ecology' | 'biodiversity' | 'botany' | 'mycology' | 'geology' | 'oceanography'

export interface EnvironmentalTemplate {
  id: string
  title: string
  subtitle: string
  icon: string
  category: 'assessment' | 'policy' | 'conservation' | 'risk' | 'research' | 'funding'
  domain: TemplateDomain[]
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
    domain: ['biodiversity', 'ecology'],
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
    domain: ['biodiversity', 'ecology'],
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
    domain: ['ecology', 'biodiversity', 'botany'],
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
    domain: ['ecology', 'biodiversity'],
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
    domain: ['ecology', 'oceanography', 'geology'],
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
    domain: ['ecology', 'botany'],
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
    domain: ['ecology', 'geology'],
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
    domain: ['ecology', 'biodiversity', 'botany'],
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
    domain: ['ecology', 'geology', 'biodiversity'],
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
    domain: ['ecology', 'botany', 'biodiversity'],
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
    domain: ['ecology', 'biodiversity', 'botany', 'mycology', 'geology', 'oceanography'],
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
    domain: ['ecology', 'biodiversity'],
    prompt: 'Analyze conservation funding allocation for the target region or portfolio. Evaluate: cost-effectiveness of current allocations, underfunded priorities, donor alignment, measurable outcome tracking, and optimal reallocation scenarios to maximize conservation impact per dollar.',
    followUps: [
      'Identify the most underfunded conservation priorities with highest impact potential',
      'Compare donor requirement alignment across funding sources',
      'Evaluate outcome measurement frameworks for conservation investments',
      'Simulate optimal budget reallocation scenarios for maximum biodiversity impact',
    ],
  },
  // ─── Domain-specific templates ──────────────────────────────────────────────
  {
    id: 'coral-reef-health',
    title: 'Coral Reef Health Assessment',
    subtitle: 'What is the current status and trajectory of reef ecosystems?',
    icon: 'scuba_diving',
    category: 'assessment',
    domain: ['oceanography'],
    prompt: 'Assess coral reef health for the target region including bleaching frequency, species diversity, water temperature trends, acidification impact, and recovery patterns. Compare with baseline data and global reef health indices.',
    followUps: [
      'Evaluate effectiveness of marine protected areas on reef recovery',
      'Assess economic impact of reef degradation on local fishing communities',
      'Compare thermal tolerance across dominant coral species',
      'Identify most promising reef restoration interventions',
    ],
  },
  {
    id: 'mycorrhizal-assessment',
    title: 'Mycorrhizal Network Analysis',
    subtitle: 'How do fungal networks affect forest ecosystem resilience?',
    icon: 'hub',
    category: 'research',
    domain: ['mycology', 'botany', 'ecology'],
    prompt: 'Analyze mycorrhizal network dynamics in the target forest ecosystem. Assess: fungal species diversity, host tree connectivity, nutrient transfer efficiency, carbon sequestration contribution, and resilience to disturbance. Identify implications for forest management.',
    followUps: [
      'Compare mycorrhizal diversity across managed vs. old-growth forests',
      'Evaluate impact of clear-cutting on mycorrhizal network recovery',
      'Assess carbon transfer rates through mycorrhizal networks',
      'Identify keystone fungal species critical for ecosystem function',
    ],
  },
  {
    id: 'geological-hazard',
    title: 'Geological Hazard Assessment',
    subtitle: 'What geological risks threaten the target region?',
    icon: 'landslide',
    category: 'risk',
    domain: ['geology'],
    prompt: 'Assess geological hazards for the target area including seismic activity, volcanic risk, landslide susceptibility, subsidence, and coastal erosion. Evaluate risk magnitude, population exposure, and infrastructure vulnerability. Recommend mitigation priorities.',
    followUps: [
      'Compare geological monitoring technologies for early warning',
      'Assess population displacement risk from identified geological hazards',
      'Evaluate land-use planning implications of geological risk zones',
      'Identify critical infrastructure vulnerability to geological events',
    ],
  },
  {
    id: 'flora-inventory',
    title: 'Flora Inventory & Red List',
    subtitle: 'Which plant species are at risk in this ecosystem?',
    icon: 'grass',
    category: 'assessment',
    domain: ['botany', 'ecology'],
    prompt: 'Conduct a comprehensive flora inventory for the target region. Identify: endemic species, threatened species per IUCN criteria, invasive plant species, medicinal plant resources, and habitat-specific plant communities. Assess conservation priority by rarity and ecological function.',
    followUps: [
      'Identify plant species with undocumented medicinal or economic value',
      'Assess genetic diversity of endemic plant populations',
      'Compare in-situ vs ex-situ conservation strategies for threatened flora',
      'Evaluate climate change impacts on plant community composition',
    ],
  },
  {
    id: 'ocean-acidification',
    title: 'Ocean Acidification Impact Study',
    subtitle: 'How is acidification affecting marine ecosystems?',
    icon: 'water_drop',
    category: 'research',
    domain: ['oceanography'],
    prompt: 'Analyze ocean acidification trends and biological impacts in the target marine region. Assess: pH trends, carbonate chemistry changes, shellfish and coral vulnerability, fisheries impact, and socioeconomic consequences for coastal communities.',
    followUps: [
      'Compare acidification resilience across commercial shellfish species',
      'Evaluate economic losses to fishing communities from acidification',
      'Assess interaction between warming and acidification on marine life',
      'Identify potential adaptation strategies for vulnerable marine industries',
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
