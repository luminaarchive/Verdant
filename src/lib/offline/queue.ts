import type { OfflineQueueItem } from "@/types/observation";
import { logger } from "@/lib/logger";

const DB_NAME = "nali-offline";
const DB_VERSION = 1;
const STORE_NAME = "queue";

export async function initOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not supported in this environment"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      logger.error("Error opening IndexedDB", { error: (event.target as IDBOpenDBRequest).error });
      reject((event.target as IDBOpenDBRequest).error);
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("status", "status", { unique: false });
      }
    };
  });
}

export async function addToLocalQueue(item: Omit<OfflineQueueItem, "id" | "syncedAt">): Promise<string> {
  if (typeof window === "undefined") return "";
  
  try {
    const db = await initOfflineDB();
    const id = crypto.randomUUID();
    const fullItem: OfflineQueueItem = {
      ...item,
      id,
      syncedAt: null,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(fullItem);

      request.onsuccess = () => resolve(id);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  } catch (error) {
    logger.error("Failed to add to local queue", { error });
    return "";
  }
}

export async function getLocalQueue(): Promise<OfflineQueueItem[]> {
  if (typeof window === "undefined") return [];

  try {
    const db = await initOfflineDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = (event) => resolve((event.target as IDBRequest).result);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  } catch (error) {
    logger.error("Failed to get local queue", { error });
    return [];
  }
}

export async function getPendingLocalItems(): Promise<OfflineQueueItem[]> {
  if (typeof window === "undefined") return [];

  try {
    const allItems = await getLocalQueue();
    return allItems.filter(item => item.status === "queued" || item.status === "failed");
  } catch (error) {
    logger.error("Failed to get pending local items", { error });
    return [];
  }
}

export async function updateLocalItemStatus(id: string, status: OfflineQueueItem["status"]): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const db = await initOfflineDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = (event) => {
        const data = (event.target as IDBRequest).result as OfflineQueueItem;
        if (data) {
          data.status = status;
          if (status === "done") {
            data.syncedAt = new Date().toISOString();
          }
          const putRequest = store.put(data);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = (e) => reject((e.target as IDBRequest).error);
        } else {
          resolve(); // Item not found, do nothing
        }
      };
      
      getRequest.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  } catch (error) {
    logger.error("Failed to update local item status", { error });
  }
}

export async function clearSyncedItems(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const db = await initOfflineDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = (event) => {
        const items = (event.target as IDBRequest).result as OfflineQueueItem[];
        items.forEach(item => {
          if (item.status === "done") {
            store.delete(item.id);
          }
        });
        resolve();
      };
      
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  } catch (error) {
    logger.error("Failed to clear synced items", { error });
  }
}
