export const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://naliai.vercel.app";

export const seoKeywords = [
  "NaLI",
  "NaLI AI",
  "wildlife field intelligence Indonesia",
  "AI identifikasi satwa Indonesia",
  "aplikasi identifikasi satwa liar",
  "AI konservasi Indonesia",
  "ecological intelligence Indonesia",
  "biodiversity intelligence Indonesia",
  "conservation field software Indonesia",
  "agentic wildlife intelligence Indonesia",
  "sistem observasi satwa Indonesia",
];

export const siteDescription =
  "NaLI is a wildlife field intelligence system for Indonesian biodiversity workflows, turning observations into source-backed, reviewable, export-ready ecological records.";

export function buildJsonLdGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: "NaLI",
        url: siteUrl,
        description: siteDescription,
        inLanguage: ["en", "id"],
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${siteUrl}/#software`,
        name: "NaLI",
        applicationCategory: "ScienceApplication",
        operatingSystem: "Web",
        url: siteUrl,
        description: siteDescription,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "IDR",
          availability: "https://schema.org/PreOrder",
          description: "Planned early-access pricing; payment is not live.",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "NaLI",
        url: siteUrl,
        description: "Indonesia-first biodiversity field intelligence project.",
      },
    ],
  };
}
