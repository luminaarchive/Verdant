import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lng = Number(req.nextUrl.searchParams.get("lng"));
  const radiusM = Number(req.nextUrl.searchParams.get("radius_m") ?? 500);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "Valid latitude and longitude are required." }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("get_observations_nearby", {
    lat,
    lng,
    radius_m: Number.isFinite(radiusM) ? Math.max(50, Math.min(radiusM, 5000)) : 500,
  });

  if (error) {
    return NextResponse.json(
      {
        error: "Location memory is unavailable until the PostGIS migration is active.",
        details: error.message,
        rows: [],
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ rows: data ?? [] }, { status: 200 });
}
