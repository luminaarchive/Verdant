// NaLI Domain Architecture: Species Service
// Handles canonical species lookups and Golden-set population.

import { supabase } from "@/lib/supabase/client";

export class SpeciesService {
  async getSpeciesByScientificName(name: string) {
    const { data, error } = await supabase
      .from('species_reference')
      .select('*')
      .eq('scientific_name', name)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found
    return data;
  }
}

export const speciesService = new SpeciesService();
