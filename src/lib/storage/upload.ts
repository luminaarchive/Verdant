import { storageService } from "@/lib/services/storage.service";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { toAppError } from "../errors";
import type { Result } from "../../types/common";

const BUCKET_NAME = "observation_media";

async function uploadFile(
  userId: string,
  observationId: string,
  file: File,
  type: "photo" | "audio"
): Promise<Result<{ url: string; checksum: string }>> {
  try {
    const checksum = await storageService.generateChecksum(file);
    const upload = await storageService.uploadObservationMedia(userId, observationId, file, checksum);

    return {
      success: true,
      data: {
        url: upload.storage_url,
        checksum
      }
    };
  } catch (error) {
    return { success: false, error: toAppError(error) };
  }
}

export async function uploadObservationPhoto(
  userId: string,
  observationId: string,
  file: File
): Promise<Result<{ url: string; checksum: string }>> {
  return uploadFile(userId, observationId, file, "photo");
}

export async function uploadObservationAudio(
  userId: string,
  observationId: string,
  file: File
): Promise<Result<{ url: string; checksum: string }>> {
  return uploadFile(userId, observationId, file, "audio");
}

export async function getSignedUrl(
  storagePath: string,
  expiresIn: number = 3600
): Promise<Result<string>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(storagePath, expiresIn);

    if (error || !data) {
      throw error || new Error("Failed to create signed URL");
    }

    return { success: true, data: data.signedUrl };
  } catch (error) {
    return { success: false, error: toAppError(error) };
  }
}
