// NaLI: Storage Service
import { createServerSupabaseClient } from "@/lib/supabase/server";

export class StorageService {
  private BUCKET_NAME = "observation_media";

  private MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

  /**
   * Mime type validation hook (Stub)
   */
  async validateMimeType(file: File): Promise<boolean> {
    const allowedTypes = ["image/jpeg", "image/png", "image/heic", "image/heif", "audio/wav", "audio/mpeg", "audio/mp4"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid MIME type: ${file.type}. Strict validation failed.`);
    }
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds 10MB limit.`);
    }
    return true;
  }

  async generateChecksum(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  private extensionFor(file: File): string {
    if (file.type === "image/jpeg") return "jpg";
    if (file.type === "image/png") return "png";
    if (file.type === "image/heic") return "heic";
    if (file.type === "image/heif") return "heif";
    if (file.type === "audio/wav") return "wav";
    if (file.type === "audio/mpeg") return "mp3";
    if (file.type === "audio/mp4") return "m4a";
    return file.name.split(".").pop() || "bin";
  }

  /**
   * Phase 8: Signed Upload Intent Flow
   * Prevents arbitrary direct uploads by requiring a backend-signed URL first.
   */
  async createUploadIntent(userId: string, observationId: string, filename: string, mimeType: string) {
    // In real implementation, this runs securely on the backend (e.g. Next.js API route)
    // using the service_role key to generate a limited-time signed upload URL.
    const ext = filename.split(".").pop() || "bin";
    const filePath = `${userId}/${observationId}/${crypto.randomUUID()}.${ext}`;
    
    // Simulate intent generation
    return {
      signedUrl: `https://simulated-upload-intent.nali.app/${filePath}`,
      path: filePath,
      expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes
    };
  }

  /**
   * Virus scan hook (Stub)
   */
  async scanForViruses(file: File): Promise<boolean> {
    return true;
  }

  /**
   * Uploads media securely to /{user_id}/{observation_id}/{filename}
   */
  async uploadObservationMedia(userId: string, observationId: string, file: File, checksum: string) {
    await this.validateMimeType(file);
    await this.scanForViruses(file);

    const supabase = await createServerSupabaseClient();
    const finalChecksum = checksum || await this.generateChecksum(file);
    const ext = this.extensionFor(file);
    const filePath = `${userId}/${observationId}/${finalChecksum}.${ext}`;

    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    const { data: signedUrl } = await supabase.storage.from(this.BUCKET_NAME).createSignedUrl(data.path, 3600);

    return {
      path: data.path,
      storage_url: signedUrl?.signedUrl ?? data.path,
      checksum: finalChecksum,
    };
  }

  /**
   * Creates an observation_media record after successful upload
   */
  async registerMediaRecord(observationId: string, mediaType: string, storageUrl: string, checksum: string) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from('observation_media').insert({
      observation_id: observationId,
      media_type: mediaType,
      storage_url: storageUrl,
      checksum,
      captured_at: new Date().toISOString()
    }).select().single();

    if (error) throw error;
    return data;
  }
}

export const storageService = new StorageService();
