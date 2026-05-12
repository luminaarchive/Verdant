export const config = {
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    model: "claude-sonnet-4-20250514",
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  },
  gbif: {
    apiBase: process.env.GBIF_API_BASE ?? "https://api.gbif.org/v1",
  },
  iucn: {
    apiKey: process.env.IUCN_API_KEY ?? "",
    apiBase: process.env.IUCN_API_BASE ?? "https://apiv3.iucnredlist.org/api/v3",
  },
  birdnet: {
    apiBase: process.env.BIRDNET_API_BASE ?? "",
    apiKey: process.env.BIRDNET_API_KEY ?? "",
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    isDev: process.env.NODE_ENV === "development",
    isProd: process.env.NODE_ENV === "production",
  },
};
