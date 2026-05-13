import { env } from "./env";

export const config = {
  anthropic: env.providers.anthropic,
  supabase: env.supabase,
  gbif: env.providers.gbif,
  iucn: env.providers.iucn,
  birdnet: env.providers.birdnet,
  app: env.app,
};
