import type { ConservationStatus } from "./species";
import type { ObservationStatus, ReviewStatus, SyncStatus } from "./common";
import type { SpeciesCandidate, ToolName } from "./agent";

export type Observation = {
  id: string;
  userId: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  photoStorageUrl: string | null;
  photoChecksum: string | null;
  audioStorageUrl: string | null;
  audioChecksum: string | null;
  textDescription: string | null;
  finalSpeciesRefId: string | null;
  confidenceLevel: number | null;
  isAnomaly: boolean;
  status: ObservationStatus;
  reviewStatus: ReviewStatus;
  verifiedByHuman: boolean;
  reviewedBy: string | null;
  qaFlag: boolean;
  createdAt: string;
};

export type ObservationInput = {
  photoFile?: File;
  audioFile?: File;
  textDescription?: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
};

export type OfflineQueueItem = {
  id: string;
  userId: string;
  localTempId: string;
  photoStorageRef: string | null;
  audioStorageRef: string | null;
  textDescription: string | null;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  queuedAt: string;
  syncedAt: string | null;
  status: SyncStatus;
};
