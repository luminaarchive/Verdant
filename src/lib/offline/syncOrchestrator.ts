// NaLI Offline Engine: Sync Orchestrator
// Coordinates the uploading of observations and media from IndexedDB to Supabase.
// Triggers agent workflows (e.g. IUCN/GBIF enrichment) once successfully synced.

import { queueManager } from './queueManager';
import { retryHandler } from './retryHandler';

export class SyncOrchestrator {
  private isSyncing = false;

  async startSync(): Promise<void> {
    if (this.isSyncing || typeof window === 'undefined' || !navigator.onLine) {
      return;
    }

    this.isSyncing = true;
    try {
      const pendingItems = await queueManager.getPending();
      
      for (const item of pendingItems) {
        try {
          await retryHandler.execute(async () => {
            // Simulated sync operation
            console.log(`Syncing item ${item.id} of type ${item.type}`);
            // In real app:
            // if (item.type === 'OBSERVATION_CREATE') await supabase.from('observations').insert(item.data)
            // if (item.type === 'MEDIA_UPLOAD') await supabase.storage.from('media').upload(...)
            
            // On success, trigger server-side agent processing (analysis_runs)
            await queueManager.remove(item.id);
          });
        } catch (err) {
          console.error(`Failed to sync item ${item.id}`, err);
          // Update item status to failed in queue
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }

  setupListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.startSync());
    }
  }
}

export const syncOrchestrator = new SyncOrchestrator();
