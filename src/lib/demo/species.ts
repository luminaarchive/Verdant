export type DemoSpeciesResult = {
  scientificName: string;
  commonNameEn: string;
  commonNameId: string;
  iucnStatus: "CR" | "EN" | "VU" | "NT" | "LC";
  populationTrend: string;
  populationTrendId: string;
  distributionId: string;
  distributionIdText: string;
  conservationContext: string;
  conservationContextId: string;
  reviewRecommendation: string;
  reviewRecommendationId: string;
  source: "nali-golden-set";
  sourceLabel: string;
  sourceLabelId: string;
  isDemo: true;
  disclaimer: string;
  aliases: string[];
};

export type PublicDemoSpeciesResponse = Omit<
  DemoSpeciesResult,
  | "aliases"
  | "populationTrendId"
  | "distributionIdText"
  | "conservationContextId"
  | "reviewRecommendationId"
  | "sourceLabelId"
>;

export const publicDemoDisclaimerEn = "Public demo · not a verified field observation";
export const publicDemoDisclaimerId = "Demo publik · bukan observasi lapangan terverifikasi";

export const DEMO_SPECIES: DemoSpeciesResult[] = [
  {
    scientificName: "Panthera tigris sumatrae",
    commonNameEn: "Sumatran Tiger",
    commonNameId: "Harimau Sumatera",
    iucnStatus: "CR",
    populationTrend: "Decreasing",
    populationTrendId: "Menurun",
    distributionId: "Lanskap hutan Sumatera, terutama blok hutan dataran rendah dan pegunungan yang tersambung.",
    distributionIdText: "Sumatra forest landscapes, especially connected lowland and montane forest blocks.",
    conservationContext:
      "Critically endangered carnivore records require protected coordinates, expert validation, and habitat-pressure review.",
    conservationContextId:
      "Catatan karnivora berstatus kritis memerlukan koordinat terlindungi, validasi ahli, dan tinjauan tekanan habitat.",
    reviewRecommendation: "Expert validation recommended before export or operational escalation.",
    reviewRecommendationId: "Validasi ahli direkomendasikan sebelum ekspor atau eskalasi operasional.",
    source: "nali-golden-set",
    sourceLabel: "GBIF + IUCN reference example",
    sourceLabelId: "Contoh referensi GBIF + IUCN",
    isDemo: true,
    disclaimer: publicDemoDisclaimerEn,
    aliases: ["harimau sumatera", "sumatran tiger", "panthera tigris sumatrae", "harimau"],
  },
  {
    scientificName: "Pongo tapanuliensis",
    commonNameEn: "Tapanuli Orangutan",
    commonNameId: "Orangutan Tapanuli",
    iucnStatus: "CR",
    populationTrend: "Decreasing",
    populationTrendId: "Menurun",
    distributionId: "Ekosistem Batang Toru, Sumatera Utara.",
    distributionIdText: "Batang Toru ecosystem, North Sumatra.",
    conservationContext:
      "Small-range great ape observations are highly sensitive and should trigger strict location protection.",
    conservationContextId:
      "Observasi kera besar dengan sebaran kecil sangat sensitif dan harus memicu perlindungan lokasi ketat.",
    reviewRecommendation: "Automatic review required because of critical conservation status and narrow distribution.",
    reviewRecommendationId: "Tinjauan otomatis diperlukan karena status konservasi kritis dan sebaran sempit.",
    source: "nali-golden-set",
    sourceLabel: "GBIF + IUCN reference example",
    sourceLabelId: "Contoh referensi GBIF + IUCN",
    isDemo: true,
    disclaimer: publicDemoDisclaimerEn,
    aliases: ["orangutan tapanuli", "tapanuli orangutan", "pongo tapanuliensis", "orangutan"],
  },
  {
    scientificName: "Dicerorhinus sumatrensis",
    commonNameEn: "Sumatran Rhinoceros",
    commonNameId: "Badak Sumatera",
    iucnStatus: "CR",
    populationTrend: "Decreasing",
    populationTrendId: "Menurun",
    distributionId: "Lanskap hutan terlindungi yang terfragmentasi di Sumatera dan Kalimantan.",
    distributionIdText: "Fragmented protected forest landscapes in Sumatra and Kalimantan.",
    conservationContext:
      "Any credible field indication is conservation-critical and must be handled as protected sensitive evidence.",
    conservationContextId:
      "Setiap indikasi lapangan yang kredibel bernilai kritis bagi konservasi dan harus ditangani sebagai bukti sensitif terlindungi.",
    reviewRecommendation: "Immediate expert validation and field case escalation recommended.",
    reviewRecommendationId: "Validasi ahli segera dan eskalasi kasus lapangan direkomendasikan.",
    source: "nali-golden-set",
    sourceLabel: "GBIF + IUCN reference example",
    sourceLabelId: "Contoh referensi GBIF + IUCN",
    isDemo: true,
    disclaimer: publicDemoDisclaimerEn,
    aliases: ["badak sumatera", "sumatran rhinoceros", "dicerorhinus sumatrensis", "badak"],
  },
  {
    scientificName: "Spizaetus bartelsi",
    commonNameEn: "Javan Hawk-Eagle",
    commonNameId: "Elang Jawa",
    iucnStatus: "EN",
    populationTrend: "Decreasing",
    populationTrendId: "Menurun",
    distributionId: "Sistem hutan pegunungan dan perbukitan Jawa.",
    distributionIdText: "Java montane and hill forest systems.",
    conservationContext:
      "Endangered raptor records are useful for canopy habitat monitoring and disturbance review.",
    conservationContextId:
      "Catatan raptor terancam berguna untuk pemantauan habitat kanopi dan tinjauan gangguan.",
    reviewRecommendation: "Expert validation recommended when habitat or location context is unusual.",
    reviewRecommendationId: "Validasi ahli direkomendasikan saat konteks habitat atau lokasi tidak biasa.",
    source: "nali-golden-set",
    sourceLabel: "GBIF + IUCN reference example",
    sourceLabelId: "Contoh referensi GBIF + IUCN",
    isDemo: true,
    disclaimer: publicDemoDisclaimerEn,
    aliases: ["elang jawa", "javan hawk eagle", "javan hawk-eagle", "spizaetus bartelsi"],
  },
  {
    scientificName: "Varanus komodoensis",
    commonNameEn: "Komodo Dragon",
    commonNameId: "Komodo",
    iucnStatus: "EN",
    populationTrend: "Stable in monitored zones",
    populationTrendId: "Stabil di zona pemantauan",
    distributionId: "Komodo, Rinca, Flores, Gili Motang, dan pulau Nusa Tenggara terdekat.",
    distributionIdText: "Komodo, Rinca, Flores, Gili Motang, and nearby Nusa Tenggara islands.",
    conservationContext:
      "Records outside known island range should be treated as geographic anomalies until reviewed.",
    conservationContextId:
      "Catatan di luar sebaran pulau yang diketahui harus diperlakukan sebagai anomali geografis sampai ditinjau.",
    reviewRecommendation: "Routine archive is safe inside expected range; review if distribution conflicts appear.",
    reviewRecommendationId: "Arsip rutin aman di dalam sebaran yang sesuai; tinjau jika muncul konflik distribusi.",
    source: "nali-golden-set",
    sourceLabel: "GBIF + IUCN reference example",
    sourceLabelId: "Contoh referensi GBIF + IUCN",
    isDemo: true,
    disclaimer: publicDemoDisclaimerEn,
    aliases: ["komodo", "varanus komodoensis", "komodo dragon", "biawak komodo"],
  },
  {
    scientificName: "Leucopsar rothschildi",
    commonNameEn: "Bali Starling",
    commonNameId: "Jalak Bali",
    iucnStatus: "CR",
    populationTrend: "Managed recovery",
    populationTrendId: "Pemulihan terkelola",
    distributionId: "Bali Barat dan lanskap pemulihan atau pelepasliaran terkelola.",
    distributionIdText: "Bali Barat and managed recovery or release landscapes.",
    conservationContext:
      "Critically endangered bird records should distinguish wild, managed, and release-zone context.",
    conservationContextId:
      "Catatan burung berstatus kritis harus membedakan konteks liar, terkelola, dan zona pelepasliaran.",
    reviewRecommendation: "Expert validation recommended for release-zone or trade-risk observations.",
    reviewRecommendationId: "Validasi ahli direkomendasikan untuk observasi zona pelepasliaran atau risiko perdagangan.",
    source: "nali-golden-set",
    sourceLabel: "GBIF + IUCN reference example",
    sourceLabelId: "Contoh referensi GBIF + IUCN",
    isDemo: true,
    disclaimer: publicDemoDisclaimerEn,
    aliases: ["jalak bali", "bali starling", "leucopsar rothschildi"],
  },
  {
    scientificName: "Nasalis larvatus",
    commonNameEn: "Proboscis Monkey",
    commonNameId: "Bekantan",
    iucnStatus: "EN",
    populationTrend: "Decreasing",
    populationTrendId: "Menurun",
    distributionId: "Tepi mangrove, sungai, dan hutan rawa gambut Kalimantan.",
    distributionIdText: "Kalimantan mangrove, riverine, and peat-swamp forest edges.",
    conservationContext:
      "Riparian and mangrove records help surface wetland fragmentation and corridor pressure.",
    conservationContextId:
      "Catatan riparian dan mangrove membantu mengungkap fragmentasi lahan basah dan tekanan koridor.",
    reviewRecommendation: "Review recommended when observations overlap fragmented river-edge habitat.",
    reviewRecommendationId: "Tinjauan direkomendasikan saat observasi tumpang tindih dengan habitat tepi sungai terfragmentasi.",
    source: "nali-golden-set",
    sourceLabel: "GBIF + IUCN reference example",
    sourceLabelId: "Contoh referensi GBIF + IUCN",
    isDemo: true,
    disclaimer: publicDemoDisclaimerEn,
    aliases: ["bekantan", "proboscis monkey", "nasalis larvatus"],
  },
  {
    scientificName: "Elephas maximus sumatranus",
    commonNameEn: "Sumatran Elephant",
    commonNameId: "Gajah Sumatera",
    iucnStatus: "CR",
    populationTrend: "Decreasing",
    populationTrendId: "Menurun",
    distributionId: "Hutan dataran rendah terfragmentasi dan lanskap penggunaan manusia di Sumatera.",
    distributionIdText: "Fragmented lowland forest and human-use landscapes in Sumatra.",
    conservationContext:
      "Large mammal detections near agricultural edges can indicate corridor pressure or conflict risk.",
    conservationContextId:
      "Deteksi mamalia besar dekat tepi pertanian dapat menunjukkan tekanan koridor atau risiko konflik.",
    reviewRecommendation: "Field case review recommended for repeated edge-zone detections.",
    reviewRecommendationId: "Tinjauan kasus lapangan direkomendasikan untuk deteksi berulang di zona tepi.",
    source: "nali-golden-set",
    sourceLabel: "GBIF + IUCN reference example",
    sourceLabelId: "Contoh referensi GBIF + IUCN",
    isDemo: true,
    disclaimer: publicDemoDisclaimerEn,
    aliases: ["gajah sumatera", "sumatran elephant", "elephas maximus sumatranus", "gajah"],
  },
  {
    scientificName: "Macrocephalon maleo",
    commonNameEn: "Maleo",
    commonNameId: "Maleo",
    iucnStatus: "EN",
    populationTrend: "Decreasing",
    populationTrendId: "Menurun",
    distributionId: "Lokasi bertelur Sulawesi, pasir pesisir, dan situs inkubasi geotermal.",
    distributionIdText: "Sulawesi nesting grounds, coastal sands, and geothermal incubation sites.",
    conservationContext:
      "Nesting-ground records are sensitive and should support site protection rather than public exposure.",
    conservationContextId:
      "Catatan lokasi bertelur bersifat sensitif dan harus mendukung perlindungan situs, bukan paparan publik.",
    reviewRecommendation: "Review recommended when nesting behavior or site pressure is present.",
    reviewRecommendationId: "Tinjauan direkomendasikan saat ada perilaku bertelur atau tekanan situs.",
    source: "nali-golden-set",
    sourceLabel: "GBIF + IUCN reference example",
    sourceLabelId: "Contoh referensi GBIF + IUCN",
    isDemo: true,
    disclaimer: publicDemoDisclaimerEn,
    aliases: ["maleo", "macrocephalon maleo"],
  },
  {
    scientificName: "Paradisaea apoda",
    commonNameEn: "Greater Bird-of-Paradise",
    commonNameId: "Cendrawasih",
    iucnStatus: "LC",
    populationTrend: "Stable",
    populationTrendId: "Stabil",
    distributionId: "Sistem hutan dataran rendah dan perbukitan Papua.",
    distributionIdText: "Papua lowland and hill forest systems.",
    conservationContext:
      "Records remain useful for distribution, habitat condition, and seasonal behavior monitoring.",
    conservationContextId:
      "Catatan tetap bernilai untuk pemantauan distribusi, kondisi habitat, dan perilaku musiman.",
    reviewRecommendation: "Routine archive safe unless habitat conflict or unusual timing is detected.",
    reviewRecommendationId: "Arsip rutin aman kecuali konflik habitat atau waktu tidak biasa terdeteksi.",
    source: "nali-golden-set",
    sourceLabel: "GBIF + IUCN reference example",
    sourceLabelId: "Contoh referensi GBIF + IUCN",
    isDemo: true,
    disclaimer: publicDemoDisclaimerEn,
    aliases: ["cendrawasih", "greater bird of paradise", "greater bird-of-paradise", "paradisaea apoda"],
  },
];

export function normalizeSpeciesQuery(query: string) {
  return query
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokensMatch(query: string, alias: string) {
  const queryTokens = query.split(" ").filter(Boolean);
  const aliasTokens = alias.split(" ").filter(Boolean);
  return queryTokens.length > 0 && queryTokens.every((token) => aliasTokens.some((aliasToken) => aliasToken.startsWith(token)));
}

export function findDemoSpecies(query: string): DemoSpeciesResult | null {
  const normalizedQuery = normalizeSpeciesQuery(query);
  if (!normalizedQuery) return null;

  for (const species of DEMO_SPECIES) {
    const aliases = [species.scientificName, species.commonNameEn, species.commonNameId, ...species.aliases].map(
      normalizeSpeciesQuery,
    );

    if (
      aliases.some(
        (alias) =>
          alias === normalizedQuery ||
          alias.includes(normalizedQuery) ||
          normalizedQuery.includes(alias) ||
          tokensMatch(normalizedQuery, alias),
      )
    ) {
      return species;
    }
  }

  return null;
}

export function localizeDemoSpeciesResult(
  species: DemoSpeciesResult,
  language: "en" | "id" = "en",
): PublicDemoSpeciesResponse {
  const {
    aliases: _aliases,
    populationTrendId,
    distributionIdText,
    conservationContextId,
    reviewRecommendationId,
    sourceLabelId,
    ...base
  } = species;

  if (language === "id") {
    return {
      ...base,
      populationTrend: populationTrendId,
      distributionId: species.distributionId,
      conservationContext: conservationContextId,
      reviewRecommendation: reviewRecommendationId,
      sourceLabel: sourceLabelId,
      disclaimer: publicDemoDisclaimerId,
    };
  }

  return {
    ...base,
    distributionId: distributionIdText,
    disclaimer: publicDemoDisclaimerEn,
  };
}
