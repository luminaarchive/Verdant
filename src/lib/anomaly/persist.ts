import type { SupabaseClient } from "@supabase/supabase-js";
import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";
import { evaluateH3AnomalyFlags, type H3AnomalyFlag } from "./h3";

type PersistH3AnomaliesInput = {
  fallbackClient: SupabaseClient;
  observationId: string;
  speciesRefId: string | null;
  h3Cell: string | null;
  iucnStatus: string | null;
};

type CountRows = { count: number | null };

export async function persistH3AnomalyFlags(input: PersistH3AnomaliesInput) {
  if (!input.h3Cell || !input.speciesRefId) return { flags: [] as H3AnomalyFlag[], persisted: false };

  const admin = getOptionalSupabaseAdminClient();
  const client = admin ?? input.fallbackClient;
  const since = new Date();
  since.setMonth(since.getMonth() - 12);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [yearResult, monthResult] = await Promise.all([
    client
      .from("observations")
      .select("id", { count: "exact", head: true })
      .eq("final_species_ref_id", input.speciesRefId)
      .eq("h3_cell_res7", input.h3Cell)
      .neq("id", input.observationId)
      .gte("created_at", since.toISOString()) as unknown as Promise<CountRows>,
    client
      .from("observations")
      .select("id", { count: "exact", head: true })
      .eq("final_species_ref_id", input.speciesRefId)
      .eq("h3_cell_res7", input.h3Cell)
      .gte("created_at", monthStart.toISOString()) as unknown as Promise<CountRows>,
  ]);

  const sameSpeciesInGridLast12Months = yearResult.count ?? 0;
  const currentMonthCount = monthResult.count ?? 1;
  const monthlyAverage = sameSpeciesInGridLast12Months / 12;
  const flags = evaluateH3AnomalyFlags({
    sameSpeciesInGridLast12Months,
    currentMonthCount,
    monthlyAverage,
    iucnStatus: input.iucnStatus,
    h3Cell: input.h3Cell,
  });

  if (!flags.length) return { flags, persisted: true };

  const { error } = await client.from("observation_anomaly_flags").insert(
    flags.map((flag) => ({
      observation_id: input.observationId,
      flag_type: flag.flagType,
      severity: flag.severity,
      reason: flag.reason,
      baseline_window_months: flag.baselineWindowMonths,
      h3_cell: flag.h3Cell,
    })),
  );

  if (!error) {
    await client
      .from("observations")
      .update({
        is_anomaly: true,
        anomaly_flag: true,
        observation_status: flags.some((flag) => flag.severity === "critical" || flag.severity === "high")
          ? "pending_review"
          : "submitted",
        qa_flag: flags.some((flag) => flag.severity === "critical" || flag.severity === "high"),
      })
      .eq("id", input.observationId);
  }

  return { flags, persisted: !error, error: error?.message };
}
