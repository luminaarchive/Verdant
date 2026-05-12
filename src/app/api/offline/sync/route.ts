import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { offlineQueueSchema } from "@/lib/validation/observationInput";
import { observationService } from "@/lib/services/observation.service";

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Expected an array of queue items" }, { status: 400 });
    }

    let synced = 0;
    let failed = 0;
    const results = [];

    for (const item of body) {
      const parsed = offlineQueueSchema.safeParse(item);
      if (!parsed.success) {
        failed++;
        results.push({ localTempId: item.localTempId, error: "Validation failed" });
        continue;
      }

      // Sync currently only supports textual data re-submission via this endpoint
      // as multipart forms are needed for files, but we can pass text logic through
      const result = await observationService.createAndAnalyze(session.user.id, {
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        accuracyMeters: parsed.data.accuracyMeters,
        textDescription: parsed.data.textDescription,
      });

      if (result.success) {
        synced++;
        results.push({ localTempId: parsed.data.localTempId, observationId: result.data.observationId });
      } else {
        failed++;
        results.push({ localTempId: parsed.data.localTempId, error: result.error.message });
      }
    }

    return NextResponse.json({ synced, failed, results }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
