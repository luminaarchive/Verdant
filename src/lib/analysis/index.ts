// NaLI Domain Architecture: Analysis Service
// Interfaces with the Agentic workflow logic for observations.

import { supabase } from "@/lib/supabase/client";

export class AnalysisService {
  async getAnalysisRunsForObservation(observationId: string) {
    const { data, error } = await supabase
      .from('analysis_runs')
      .select('*')
      .eq('observation_id', observationId)
      .order('started_at', { ascending: true });
      
    if (error) throw error;
    return data;
  }
}

export const analysisService = new AnalysisService();
