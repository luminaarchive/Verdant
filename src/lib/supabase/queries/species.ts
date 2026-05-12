import { createServerSupabaseClient } from "../server";
import { toAppError } from "../../errors";
import type { Result } from "../../../types/common";
import type { SpeciesReference, SpeciesCache } from "../../../types/species";

export async function getSpeciesReference(gbifTaxonKey: number): Promise<Result<SpeciesReference | null>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("species_reference")
      .select("*")
      .eq("gbif_taxon_key", gbifTaxonKey)
      .maybeSingle();

    if (error) throw error;

    return { success: true, data: data as SpeciesReference | null };
  } catch (error) {
    return { success: false, error: toAppError(error) };
  }
}

export async function upsertSpeciesReference(data: Partial<SpeciesReference>): Promise<Result<SpeciesReference>> {
  try {
    const supabase = await createServerSupabaseClient();
    
    // We expect gbif_taxon_key to be unique, so we can use it for conflict resolution
    // If not provided, this might fail depending on DB constraints, 
    // but standard upsert usually requires a unique identifier.
    const { data: result, error } = await supabase
      .from("species_reference")
      .upsert(data, { onConflict: "gbif_taxon_key" })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: result as SpeciesReference };
  } catch (error) {
    return { success: false, error: toAppError(error) };
  }
}

export async function getSpeciesCache(speciesRefId: string): Promise<Result<SpeciesCache | null>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("species_cache")
      .select("*")
      .eq("species_ref_id", speciesRefId)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      const expiresAt = new Date(data.ttl_expires_at).getTime();
      const now = new Date().getTime();
      if (expiresAt < now) {
         return { success: true, data: null };
      }
    }

    return { success: true, data: data as SpeciesCache | null };
  } catch (error) {
    return { success: false, error: toAppError(error) };
  }
}

export async function upsertSpeciesCache(data: Partial<SpeciesCache>): Promise<Result<SpeciesCache>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: result, error } = await supabase
      .from("species_cache")
      .upsert(data)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: result as SpeciesCache };
  } catch (error) {
    return { success: false, error: toAppError(error) };
  }
}
