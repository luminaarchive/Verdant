// ─── Agent Network: Verdant's Multi-Expert AI System ────────────────────────

export interface VerdantAgent {
  id: string
  name: string
  domain: string
  icon: string
  description: string
  capabilities: string[]
  sources: string[]
}

export const VERDANT_AGENTS: VerdantAgent[] = [
  { id: 'marine', name: 'Marine Intelligence Agent', domain: 'Oceanography', icon: 'scuba_diving', description: 'Coral reef systems, ocean chemistry, marine biodiversity, and fisheries ecology.', capabilities: ['Coral bleaching risk assessment', 'Ocean acidification analysis', 'Marine protected area evaluation', 'Fisheries sustainability scoring'], sources: ['NOAA Coral Reef Watch', 'IUCN Marine', 'FAO Fisheries', 'Global Fishing Watch'] },
  { id: 'biodiversity', name: 'Biodiversity Intelligence Agent', domain: 'Species Conservation', icon: 'pets', description: 'Species population dynamics, extinction risk trajectories, and genetic diversity.', capabilities: ['Species risk scoring', 'Population viability analysis', 'Habitat fragmentation mapping', 'Conservation priority ranking'], sources: ['IUCN Red List', 'GBIF', 'CITES', 'Living Planet Index'] },
  { id: 'climate', name: 'Climate Intelligence Agent', domain: 'Climate Science', icon: 'thermostat', description: 'Climate system indicators, tipping points, and adaptation strategies.', capabilities: ['Climate risk quantification', 'Tipping point analysis', 'Adaptation evaluation', 'Carbon budget assessment'], sources: ['IPCC', 'NOAA Climate', 'Copernicus', 'Global Carbon Project'] },
  { id: 'policy', name: 'Policy Intelligence Agent', domain: 'Environmental Governance', icon: 'gavel', description: 'Environmental regulation analysis, policy gaps, and compliance scoring.', capabilities: ['Policy impact simulation', 'Regulatory gap analysis', 'Compliance scoring', 'International benchmarking'], sources: ['UNEP', 'CBD', 'UNFCCC', 'World Bank'] },
  { id: 'forest', name: 'Forest Intelligence Agent', domain: 'Forest Ecology', icon: 'forest', description: 'Deforestation dynamics, carbon stocks, and reforestation effectiveness.', capabilities: ['Deforestation risk mapping', 'Carbon stock analysis', 'Reforestation ROI scoring', 'Fire risk assessment'], sources: ['Global Forest Watch', 'KLHK Indonesia', 'FAO FRA', 'INPE Brazil'] },
  { id: 'esg', name: 'ESG Intelligence Agent', domain: 'Sustainability', icon: 'shield', description: 'Corporate environmental performance, supply chain sustainability, and greenwashing detection.', capabilities: ['ESG exposure scoring', 'Supply chain risk mapping', 'Greenwashing detection', 'Regulatory compliance'], sources: ['CDP', 'GRI', 'SASB', 'TCFD'] },
  { id: 'contradiction', name: 'Contradiction Detection Agent', domain: 'Evidence Quality', icon: 'compare_arrows', description: 'Cross-validates claims, identifies conflicting evidence, quantifies disagreement.', capabilities: ['Source disagreement detection', 'Evidence weight comparison', 'Methodology gap ID', 'Consensus assessment'], sources: ['All indexed sources', 'Cross-reference engine'] },
  { id: 'grant', name: 'Grant Intelligence Agent', domain: 'Conservation Funding', icon: 'volunteer_activism', description: 'Environmental funding opportunities, grant fit scoring, and deadline tracking.', capabilities: ['Grant opportunity matching', 'Funding deadline tracking', 'Impact-per-dollar scoring', 'Proposal alignment'], sources: ['GEF', 'Green Climate Fund', 'USAID', 'EU Horizon'] },
]

export const AGENT_NETWORK_DESCRIPTION = `Verdant operates as a network of specialized environmental intelligence agents, each trained on domain-specific data sources and analytical frameworks. When you submit a research query, the relevant agents collaborate to produce decision-grade intelligence — cross-validating claims, detecting contradictions, and synthesizing findings from multiple scientific disciplines.`
