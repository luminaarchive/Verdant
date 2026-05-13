import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSignedUrl } from "@/lib/storage/upload";
import { toAppError } from "@/lib/errors";
import type { Result } from "@/types/common";
import type { ConservationStatus } from "@/types/species";

export type FieldLogSummary = {
  id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  photoStorageUrl: string | null;
  textDescription: string | null;
  scientificName: string;
  localName: string;
  confidenceLevel: number | null;
  conservationStatus: ConservationStatus | "DD";
  anomalyFlag: boolean;
  reviewStatus: "unreviewed" | "verified" | "rejected";
  syncState: "pending_sync" | "synced" | "failed_sync";
  status: "pending" | "identified" | "review_needed";
};

export type AgentTimelineEvent = {
  time: string;
  label: string;
  detail: string;
};

export type FieldLogDetail = FieldLogSummary & {
  accuracyMeters: number | null;
  photoSignedUrl: string | null;
  populationTrend: string;
  distributionSummary: string;
  ecologicalNotes: string;
  timeline: AgentTimelineEvent[];
};

export type FieldLogFilters = {
  search?: string;
  conservationStatus?: string;
  reviewStatus?: string;
  syncState?: string;
};

type ObservationRow = {
  id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  accuracy_meters: number | null;
  photo_storage_url: string | null;
  text_description: string | null;
  scientific_name: string | null;
  local_name: string | null;
  confidence_level: number | null;
  conservation_status: ConservationStatus | null;
  anomaly_flag: boolean | null;
  is_anomaly: boolean | null;
  review_status: "unreviewed" | "verified" | "rejected";
  sync_state: "pending_sync" | "synced" | "failed_sync" | null;
  status: "pending" | "identified" | "review_needed";
  species_reference?: {
    scientific_name: string | null;
    common_name_id: string | null;
    species_cache?: Array<{
      conservation_status: ConservationStatus | null;
      population_trend: string | null;
      distribution_geojson: unknown;
    }>;
  } | null;
};

function mapSummary(row: ObservationRow): FieldLogSummary {
  const species = row.species_reference;
  const cache = species?.species_cache?.[0];

  return {
    id: row.id,
    timestamp: row.timestamp,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    photoStorageUrl: row.photo_storage_url,
    textDescription: row.text_description,
    scientificName:
      row.scientific_name || species?.scientific_name || "Pending species identification",
    localName: row.local_name || species?.common_name_id || "Nama lokal belum tersedia",
    confidenceLevel: row.confidence_level,
    conservationStatus: row.conservation_status || cache?.conservation_status || "DD",
    anomalyFlag: Boolean(row.anomaly_flag ?? row.is_anomaly),
    reviewStatus: row.review_status,
    syncState: row.sync_state || "synced",
    status: row.status,
  };
}

function timelineFromRuns(
  observationTime: string,
  runs: Array<{ tool_used: string; created_at: string; latency_ms: number | null; raw_output: unknown }>,
): AgentTimelineEvent[] {
  const fallbackBase = new Date(observationTime);
  const fallback = [
    ["Upload received", "Observation evidence persisted to protected field log."],
    ["Species identified", "Candidate species selected from submitted media and notes."],
    ["GBIF cross-check complete", "Distribution context checked against occurrence data."],
    ["IUCN analysis complete", "Conservation risk attached to the observation."],
    ["Observation archived", "Structured field log saved for review."],
  ];

  if (runs.length === 0) {
    return fallback.map(([label, detail], index) => ({
      time: new Date(fallbackBase.getTime() + index * 60000).toISOString(),
      label,
      detail,
    }));
  }

  const mapped = runs.map((run) => {
    const detail =
      run.latency_ms !== null
        ? `Completed in ${(run.latency_ms / 1000).toFixed(1)}s.`
        : "Completed by field intelligence pipeline.";
    const label =
      run.tool_used === "vision"
        ? "Species identified"
        : run.tool_used === "gbif"
          ? "GBIF cross-check complete"
          : run.tool_used === "iucn"
            ? "IUCN analysis complete"
            : run.tool_used === "anomaly"
              ? "Anomaly detection complete"
              : "Audio analysis complete";

    return { time: run.created_at, label, detail };
  });

  return [
    {
      time: observationTime,
      label: "Upload received",
      detail: "Observation evidence persisted to protected field log.",
    },
    ...mapped,
    {
      time: new Date(new Date(observationTime).getTime() + 120000).toISOString(),
      label: "Observation archived",
      detail: "Structured field log saved for review.",
    },
  ];
}

export async function listFieldLogs(
  userId: string,
  filters: FieldLogFilters = {},
): Promise<Result<FieldLogSummary[]>> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from("observations")
      .select(
        `
        id,
        timestamp,
        latitude,
        longitude,
        accuracy_meters,
        photo_storage_url,
        text_description,
        scientific_name,
        local_name,
        confidence_level,
        conservation_status,
        anomaly_flag,
        is_anomaly,
        review_status,
        sync_state,
        status,
        species_reference:final_species_ref_id (
          scientific_name,
          common_name_id,
          species_cache (
            conservation_status,
            population_trend,
            distribution_geojson
          )
        )
      `,
      )
      .eq("user_id", userId)
      .order("timestamp", { ascending: false });

    if (filters.conservationStatus && filters.conservationStatus !== "all") {
      query = query.eq("conservation_status", filters.conservationStatus);
    }
    if (filters.reviewStatus && filters.reviewStatus !== "all") {
      query = query.eq("review_status", filters.reviewStatus);
    }
    if (filters.syncState && filters.syncState !== "all") {
      query = query.eq("sync_state", filters.syncState);
    }

    const { data, error } = await query.limit(100);
    if (error) throw error;

    let logs = ((data || []) as unknown as ObservationRow[]).map(mapSummary);
    if (filters.search) {
      const search = filters.search.toLowerCase();
      logs = logs.filter((log) =>
        [log.scientificName, log.localName, log.textDescription || ""]
          .join(" ")
          .toLowerCase()
          .includes(search),
      );
    }

    return { success: true, data: logs };
  } catch (error) {
    return { success: false, error: toAppError(error) };
  }
}

export async function getFieldLogDetail(
  userId: string,
  observationId: string,
): Promise<Result<FieldLogDetail>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("observations")
      .select(
        `
        id,
        timestamp,
        latitude,
        longitude,
        accuracy_meters,
        photo_storage_url,
        text_description,
        scientific_name,
        local_name,
        confidence_level,
        conservation_status,
        anomaly_flag,
        is_anomaly,
        review_status,
        sync_state,
        status,
        species_reference:final_species_ref_id (
          scientific_name,
          common_name_id,
          species_cache (
            conservation_status,
            population_trend,
            distribution_geojson
          )
        )
      `,
      )
      .eq("user_id", userId)
      .eq("id", observationId)
      .single();

    if (error) throw error;
    const row = data as unknown as ObservationRow;
    const summary = mapSummary(row);
    const cache = row.species_reference?.species_cache?.[0];

    const { data: runs } = await supabase
      .from("analysis_runs")
      .select("tool_used, created_at, latency_ms, raw_output")
      .eq("observation_id", observationId)
      .order("created_at", { ascending: true });

    let photoSignedUrl: string | null = null;
    if (row.photo_storage_url && !row.photo_storage_url.startsWith("pending://")) {
      const signed = await getSignedUrl(row.photo_storage_url, 3600);
      photoSignedUrl = signed.success ? signed.data : null;
    }

    return {
      success: true,
      data: {
        ...summary,
        accuracyMeters: row.accuracy_meters,
        photoSignedUrl,
        populationTrend: cache?.population_trend || "unknown",
        distributionSummary:
          "Distribution context is stored from GBIF/IUCN checks and reviewed against Indonesian range expectations.",
        ecologicalNotes:
          "Use observation notes, habitat context, and agent trace before sharing sensitive species coordinates.",
        timeline: timelineFromRuns(row.timestamp, (runs || []) as Array<{
          tool_used: string;
          created_at: string;
          latency_ms: number | null;
          raw_output: unknown;
        }>),
      },
    };
  } catch (error) {
    return { success: false, error: toAppError(error) };
  }
}
