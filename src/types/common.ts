import type { AppError } from "../lib/errors";

export type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: AppError };

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type UserRole = "ranger" | "researcher" | "student";

export type SyncStatus = "queued" | "syncing" | "done" | "failed";

export type ReviewStatus = "unreviewed" | "verified" | "rejected";

export type ObservationStatus = "pending" | "identified" | "review_needed";
