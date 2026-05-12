import { createServerSupabaseClient } from "../server";
import { toAppError } from "../../errors";
import type { Result, PaginatedResult, ObservationStatus } from "../../../types/common";
import type { Observation } from "../../../types/observation";

export async function getObservationById(id: string): Promise<Result<Observation>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("observations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) throw new Error("Observation not found");

    return { success: true, data: data as Observation };
  } catch (error) {
    return { success: false, error: toAppError(error) };
  }
}

export async function getObservationsByUser(
  userId: string,
  page: number,
  pageSize: number
): Promise<Result<PaginatedResult<Observation>>> {
  try {
    const supabase = await createServerSupabaseClient();
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data, error, count } = await supabase
      .from("observations")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })
      .range(start, end);

    if (error) throw error;

    return {
      success: true,
      data: {
        data: data as Observation[],
        total: count ?? 0,
        page,
        pageSize,
      },
    };
  } catch (error) {
    return { success: false, error: toAppError(error) };
  }
}

export async function createObservation(input: Partial<Observation>): Promise<Result<Observation>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("observations")
      .insert(input)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as Observation };
  } catch (error) {
    return { success: false, error: toAppError(error) };
  }
}

export async function updateObservationStatus(
  id: string,
  status: ObservationStatus
): Promise<Result<Observation>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("observations")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as Observation };
  } catch (error) {
    return { success: false, error: toAppError(error) };
  }
}

export async function flagObservationForReview(id: string): Promise<Result<Observation>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("observations")
      .update({ review_status: "unreviewed", qa_flag: true })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as Observation };
  } catch (error) {
    return { success: false, error: toAppError(error) };
  }
}
