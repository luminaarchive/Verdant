import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import {
  buildDarwinCoreArchiveFiles,
  mapObservationToDarwinCore,
  serializeDarwinCoreCsv,
} from "@/lib/export/darwin-core";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("observations")
    .select(
      "id, scientific_name, local_name, latitude, longitude, created_at, timestamp, user_id, review_status, verified_by_human, conservation_status",
    )
    .eq("id", id)
    .eq("user_id", session.user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Observation not found." }, { status: 404 });
  }

  if (data.review_status !== "verified" && !data.verified_by_human) {
    return NextResponse.json(
      { error: "Only verified observations are exported to Darwin Core by default." },
      { status: 403 },
    );
  }

  const occurrence = mapObservationToDarwinCore({
    ...data,
    sensitive: data.conservation_status === "CR" || data.conservation_status === "EN",
    canExportExactCoordinates: req.nextUrl.searchParams.get("exact") === "true",
  });
  const format = req.nextUrl.searchParams.get("format") ?? "csv";

  if (format === "dwca") {
    const zip = new JSZip();
    const files = buildDarwinCoreArchiveFiles([occurrence]);
    Object.entries(files).forEach(([name, content]) => zip.file(name, content));
    const buffer = await zip.generateAsync({ type: "uint8array" });
    const body = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;

    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="nali-observation-${id}.zip"`,
      },
      status: 200,
    });
  }

  return new NextResponse(serializeDarwinCoreCsv([occurrence]), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nali-observation-${id}-darwin-core.csv"`,
    },
    status: 200,
  });
}
