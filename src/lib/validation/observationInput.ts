import { z } from "zod";

export const observationInputSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracyMeters: z.number().min(0).max(10000).default(0),
  textDescription: z.string().max(2000).optional(),
});

export type ObservationInputSchema = z.infer<typeof observationInputSchema>;

export const offlineQueueSchema = z.object({
  localTempId: z.string().uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracyMeters: z.number().min(0).default(0),
  textDescription: z.string().max(2000).optional(),
  photoStorageRef: z.string().optional(),
  audioStorageRef: z.string().optional(),
});

export type OfflineQueueSchema = z.infer<typeof offlineQueueSchema>;

export const analysisResultSchema = z.object({
  observationId: z.string().uuid(),
  finalSpeciesScientificName: z.string().optional(),
  confidence: z.number().min(0).max(1),
  isAnomaly: z.boolean(),
  conservationStatus: z.string().optional(),
});

export type AnalysisResultSchema = z.infer<typeof analysisResultSchema>;
