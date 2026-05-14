import { NextRequest, NextResponse } from "next/server";
import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getOperationalRole } from "@/lib/auth/roles";

const allowedActions = new Set(["verify", "request_clarification", "reject"]);

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getOperationalRole(supabase, session.user.id);
  if (!role.canReview) {
    return NextResponse.json({ error: "Reviewer or admin role required." }, { status: 403 });
  }

  const body = await req.json();
  const observationId = String(body.observationId ?? "");
  const action = String(body.action ?? "");
  const reason = String(body.reason ?? "").trim();
  const confidenceDelta = Number(body.confidenceDelta ?? 0);

  if (!observationId || !allowedActions.has(action)) {
    return NextResponse.json({ error: "Observation ID and valid review action are required." }, { status: 400 });
  }

  const admin = getOptionalSupabaseAdminClient();
  const client = admin ?? supabase;
  const reviewStatus = action === "verify" ? "verified" : action === "reject" ? "rejected" : "clarification_requested";
  const observationStatus = action === "verify" ? "verified" : action === "reject" ? "rejected" : "pending_review";

  const { error: insertError } = await client.from("review_actions").insert({
    observation_id: observationId,
    reviewer_id: session.user.id,
    action,
    reason,
    confidence_delta: Number.isFinite(confidenceDelta) ? confidenceDelta : 0,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await client
    .from("observations")
    .update({
      review_status: reviewStatus,
      observation_status: observationStatus,
      verified_by_human: action === "verify",
      reviewed_by: session.user.id,
      reviewer_id: session.user.id,
      review_notes: reason || null,
      review_confidence_delta: Number.isFinite(confidenceDelta) ? confidenceDelta : 0,
    })
    .eq("id", observationId);

  return NextResponse.json({ ok: true }, { status: 200 });
}
