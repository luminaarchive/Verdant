// NaLI: Storage Service
import { supabase } from "@/lib/supabase/client";

export class StorageService {
  private BUCKET_NAME = 'observation_media';

  /**
   * Mime type validation hook (Stub)
   * Real implementation would read magic bytes
   */
  async validateMimeType(file: File): Promise<boolean> {
    const allowedTypes = ['image/jpeg', 'image/png', 'audio/wav', 'audio/mp4'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid MIME type: ${file.type}. Strict validation failed.`);
    }
    return true;
  }

  /**
   * Virus scan hook (Stub)
   * Real implementation would send to ClamAV or similar via Edge Function
   */
  async scanForViruses(file: File): Promise<boolean> {
    // console.log(`Scanning ${file.name} for viruses...`);
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
