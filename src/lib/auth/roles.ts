import type { SupabaseClient } from "@supabase/supabase-js";

export async function getOperationalRole(supabase: SupabaseClient, userId: string) {
  const [{ data: roleRows }, { data: userRow }] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", userId),
    supabase.from("users").select("role").eq("id", userId).maybeSingle(),
  ]);

  const roles = new Set<string>((roleRows ?? []).map((row: { role: string }) => row.role));
  if (userRow?.role) roles.add(userRow.role);

  return {
    roles,
    canReview: roles.has("reviewer") || roles.has("admin"),
    isAdmin: roles.has("admin"),
  };
}
