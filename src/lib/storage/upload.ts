import { createServerSupabaseClient } from "../supabase/server";
import { logger } from "../logger";
import { toAppError } from "../errors";
import type { Result } from "../../types/common";

const BUCKET_NAME = "nali-observations";

async function generateChecksum(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function uploadFile(
  userId: string,
  observationId: string,
  file: File,
  type: "photo" | "audio"
): Promise<Result<{ url: string; checksum: string }>> {
  try {
    const supabase = await createServerSupabaseClient();
    const ext = file.name.split('.').pop() || (type === "photo" ? "jpg" : "mp3");
    const path = `${userId}/${observationId}/${type}.${ext}`;
    
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, { upsert: true });

    if (uploadError) {
      throw uploadError;
    }

    const { data: urlData, error: urlError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, 3600);

    if (urlError || !urlData) {
      throw urlError || new Error("Failed to create signed URL");
    }

    const checksum = await generateChecksum(file);

    return {
      success: true,
      data: {
        url: urlData.signedUrl,
        checksum
      }
    };
  } catch (error) {
    logger.error(`Failed to upload ${type}`, { error, userId, observationId });
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
