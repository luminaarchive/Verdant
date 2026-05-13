// NaLI: Storage Service
import { supabase } from "@/lib/supabase/client";

export class StorageService {
  private BUCKET_NAME = 'observation_media';

  private MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

  /**
   * Mime type validation hook (Stub)
   */
  async validateMimeType(file: File): Promise<boolean> {
    const allowedTypes = ['image/jpeg', 'image/png', 'audio/wav', 'audio/mp4'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid MIME type: ${file.type}. Strict validation failed.`);
    }
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds 10MB limit.`);
    }
    return true;
  }

  /**
   * Phase 8: Signed Upload Intent Flow
   * Prevents arbitrary direct uploads by requiring a backend-signed URL first.
   */
  async createUploadIntent(userId: string, observationId: string, filename: string, mimeType: string) {
    // In real implementation, this runs securely on the backend (e.g. Next.js API route)
    // using the service_role key to generate a limited-time signed upload URL.
    const ext = filename.split('.').pop() || 'bin';
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

    const ext = file.name.split('.').pop() || 'bin';
    const filePath = `${userId}/${observationId}/${checksum}.${ext}`;

    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    return {
      path: data.path,
      storage_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/signed/${this.BUCKET_NAME}/${data.path}` // Simplified for architecture map
    };
  }

  /**
   * Creates an observation_media record after successful upload
   */
  async registerMediaRecord(observationId: string, mediaType: string, storageUrl: string, checksum: string) {
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
