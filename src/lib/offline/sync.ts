import { getPendingLocalItems, updateLocalItemStatus, clearSyncedItems } from "./queue";
import { logger } from "@/lib/logger";

export type SyncResult = {
  synced: number;
  failed: number;
  total: number;
};

export async function syncOfflineQueue(): Promise<SyncResult> {
  const pendingItems = await getPendingLocalItems();
  
  if (pendingItems.length === 0) {
    return { synced: 0, failed: 0, total: 0 };
  }

  try {
    const payload = pendingItems.map(item => ({
      localTempId: item.localTempId,
      latitude: item.latitude,
      longitude: item.longitude,
      accuracyMeters: item.accuracyMeters,
      textDescription: item.textDescription,
      // Note: photo and audio require special multipart handling not fully 
      // supported by a simple JSON POST sync endpoint, so we only sync text data here.
    }));

    const response = await fetch("/api/offline/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Sync API failed: ${response.status}`);
    }

    const result = await response.json();

    // Update local statuses based on server response
    for (const res of result.results) {
      const localItem = pendingItems.find(i => i.localTempId === res.localTempId);
      if (localItem) {
        if (res.observationId) {
          await updateLocalItemStatus(localItem.id, "done");
        } else {
          await updateLocalItemStatus(localItem.id, "failed");
        }
      }
    }

    await clearSyncedItems();

    return {
      synced: result.synced,
      failed: result.failed,
      total: pendingItems.length,
    };
  } catch (error) {
    logger.error("Failed to sync offline queue", { error });
    return {
      synced: 0,
      failed: pendingItems.length,
      total: pendingItems.length,
    };
  }
}

export async function startAutoSync(): Promise<void> {
  if (typeof window !== "undefined") {
    window.addEventListener("online", async () => {
      logger.info("Network restored. Starting auto-sync...");
      const result = await syncOfflineQueue();
      logger.info("Auto-sync completed", result as Record<string, unknown>);
    });
  }
}
