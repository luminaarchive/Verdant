import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const hash = (req.nextUrl.searchParams.get("hash") ?? "").trim().toLowerCase();

  if (!/^[a-f0-9]{64}$/.test(hash)) {
    return NextResponse.json({ error: "A valid SHA-256 hash is required." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("verify_observation_hash", {
    lookup_hash: hash,
  });

  if (error) {
    return NextResponse.json(
      {
        error: "Hash verification is unavailable until the evidence migration is active.",
        details: error.message,
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ result: Array.isArray(data) ? (data[0] ?? null) : data }, { status: 200 });
}
