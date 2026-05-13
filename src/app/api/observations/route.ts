import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getObservationsByUser } from "@/lib/supabase/queries/observations";
import { createFieldObservation } from "@/lib/usecases/createFieldObservation";

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

  const result = await getObservationsByUser(session.user.id, page, pageSize);

  if (!result.success) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json(result.data, { status: 200 });
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const photo = formData.get("photoFile");
    const textDescription = formData.get("textDescription");
    const latitude = Number(formData.get("latitude"));
    const longitude = Number(formData.get("longitude"));
    const accuracyMeters = Number(formData.get("accuracyMeters") || 0);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json({ error: "Valid latitude and longitude are required" }, { status: 400 });
    }

    if (!(photo instanceof File) && !String(textDescription || "").trim()) {
      return NextResponse.json(
        { error: "At least one observation input is required" },
        { status: 400 },
      );
    }

    const result = await createFieldObservation({
      userId: session.user.id,
      photoFile: photo instanceof File ? photo : undefined,
      textDescription: String(textDescription || ""),
      latitude,
      longitude,
      accuracyMeters,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid observation payload" }, { status: 400 });
  }
}
