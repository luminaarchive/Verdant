import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ObservationLayerRow = {
  id: string;
  scientific_name: string | null;
  local_name: string | null;
  latitude: number | null;
  longitude: number | null;
  conservation_status: string | null;
  review_status: string | null;
  is_anomaly: boolean | null;
  anomaly_flag: boolean | null;
  created_at: string | null;
};

function deterministicOffset(seed: string, scale: number) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 100000;
  }
  return (hash / 100000 - 0.5) * scale;
}

function protectCoordinates(row: ObservationLayerRow) {
  const sensitive = row.conservation_status === "CR" || row.conservation_status === "EN";
  if (typeof row.latitude !== "number" || typeof row.longitude !== "number") return null;

  return {
    lat: sensitive ? row.latitude + deterministicOffset(`${row.id}:lat`, 0.1) : row.latitude,
    lng: sensitive ? row.longitude + deterministicOffset(`${row.id}:lng`, 0.1) : row.longitude,
    protected: sensitive,
  };
}

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: observations, error: observationError } = await supabase
    .from("observations")
    .select(
      "id, scientific_name, local_name, latitude, longitude, conservation_status, review_status, is_anomaly, anomaly_flag, created_at",
    )
    .eq("user_id", session.user.id)
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("created_at", { ascending: false })
    .limit(200);

  const { data: threats } = await supabase
    .from("threat_events")
    .select("id, source, type, severity, timestamp, raw_payload")
    .order("timestamp", { ascending: false })
    .limit(200);

  if (observationError) {
    return NextResponse.json({ error: observationError.message }, { status: 500 });
  }

  const observationLayer = ((observations ?? []) as ObservationLayerRow[])
    .map((row) => {
      const coordinates = protectCoordinates(row);
      if (!coordinates) return null;

      return {
        id: row.id,
        species: row.scientific_name || row.local_name || "Species pending",
        localName: row.local_name,
        status: row.conservation_status || "NE",
        reviewStatus: row.review_status || "pending",
        anomaly: Boolean(row.is_anomaly || row.anomaly_flag),
        ...coordinates,
      };
    })
    .filter(Boolean);

  return NextResponse.json(
    {
      observations: observationLayer,
      threats: threats ?? [],
      disclaimer:
        "Map layers use persisted NaLI records. Sensitive CR/EN coordinates are obfuscated on the operational map.",
    },
    { status: 200 },
  );
}
