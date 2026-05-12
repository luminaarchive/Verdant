import { createServerSupabaseClient } from "../server";
import { toAppError } from "../../errors";
import type { Result, SyncStatus } from "../../../types/common";
import type { OfflineQueueItem } from "../../../types/observation";

export async function addToOfflineQueue(item: Partial<OfflineQueueItem>): Promise<Result<OfflineQueueItem>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("offline_queue")
      .insert(item)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as OfflineQueueItem };
  } catch (error) {
    return { success: false, error: toAppError(error) };
  }
}

export async function getPendingOfflineItems(userId: string): Promise<Result<OfflineQueueItem[]>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("offline_queue")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["queued", "failed"])
      .order("queued_at", { ascending: true });

    if (error) throw error;

    return { success: true, data: data as OfflineQueueItem[] };
  } catch (error) {
    return { success: false, error: toAppError(error) };
  }
}

export async function updateOfflineItemStatus(id: string, status: SyncStatus): Promise<Result<OfflineQueueItem>> {
  try {
    const supabase = await createServerSupabaseClient();
    const updateData: Partial<OfflineQueueItem> = { status };
    
    if (status === "done") {
      updateData.syncedAt = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("offline_queue")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as OfflineQueueItem };
  } catch (error) {
    return { success: false, error: toAppError(error) };
  }
}

export async function deleteOfflineItem(id: string): Promise<Result<void>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from("offline_queue")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: toAppError(error) };
  }
}
