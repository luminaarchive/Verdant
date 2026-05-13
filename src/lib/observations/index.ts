// NaLI Domain Architecture: Observations Service
// Handles business logic for observations separately from UI components.

import { supabase } from "@/lib/supabase/client";
import { queueManager } from "@/lib/offline/queueManager";

export class ObservationService {
  /**
   * Creates a new observation, pushing to offline queue if offline.
   */
  async createObservation(data: any): Promise<void> {
    if (typeof window !== 'undefined' && !navigator.onLine) {
      await queueManager.enqueue({
        id: crypto.randomUUID(),
        type: 'OBSERVATION_CREATE',
        data,
        timestamp: Date.now(),
        retryCount: 0,
        status: 'pending',
        syncPriority: 'normal'
      });
      return;
    }

    // Direct insert if online
    const { error } = await supabase.from('observations').insert(data);
    if (error) throw error;
  }
}

export const observationService = new ObservationService();
