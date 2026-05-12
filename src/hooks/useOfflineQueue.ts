"use client";

import { useState, useEffect, useCallback } from "react";
import { addToLocalQueue, getPendingLocalItems } from "@/lib/offline/queue";
import { syncOfflineQueue, SyncResult } from "@/lib/offline/sync";
import type { OfflineQueueItem } from "@/types/observation";

export function useOfflineQueue() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  const loadPendingCount = useCallback(async () => {
    const items = await getPendingLocalItems();
    setPendingCount(items.length);
  }, []);

  useEffect(() => {
    loadPendingCount();
  }, [loadPendingCount]);

  const addToQueue = useCallback(async (item: Omit<OfflineQueueItem, "id" | "syncedAt">) => {
    await addToLocalQueue(item);
    await loadPendingCount();
  }, [loadPendingCount]);

  const sync = useCallback(async () => {
    setIsSyncing(true);
    const result = await syncOfflineQueue();
    setLastSyncResult(result);
    await loadPendingCount();
    setIsSyncing(false);
    return result;
  }, [loadPendingCount]);

  return { pendingCount, isSyncing, lastSyncResult, addToQueue, sync };
}
