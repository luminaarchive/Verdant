import { z } from "zod";

const envSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GBIF_API_BASE: z.string().url().default("https://api.gbif.org/v1"),
  IUCN_API_KEY: z.string().min(1),
  IUCN_API_BASE: z.string().url().default("https://apiv3.iucnredlist.org/api/v3"),
  BIRDNET_API_BASE: z.string().url().optional(),
  BIRDNET_API_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const missingVars = parsedEnv.error.issues.map((issue) => issue.path.join(".")).join(", ");
  throw new Error(`Missing or invalid environment variables: ${missingVars}`);
}

const env = parsedEnv.data;

export const config = {
  anthropic: {
    apiKey: env.ANTHROPIC_API_KEY,
    model: "claude-sonnet-4-20250514",
  },
  supabase: {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  },
  gbif: {
    apiBase: env.GBIF_API_BASE,
  },
  iucn: {
    apiKey: env.IUCN_API_KEY,
    apiBase: env.IUCN_API_BASE,
  },
  birdnet: {
    apiBase: env.BIRDNET_API_BASE,
    apiKey: env.BIRDNET_API_KEY,
  },
  app: {
    url: env.NEXT_PUBLIC_APP_URL,
    isDev: env.NODE_ENV === "development",
    isProd: env.NODE_ENV === "production",
  },
};
