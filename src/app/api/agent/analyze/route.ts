import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { observationService } from "@/lib/services/observation.service";
import { observationInputSchema } from "@/lib/validation/observationInput";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    
    const photoFile = formData.get("photoFile") as File | null;
    const audioFile = formData.get("audioFile") as File | null;
    const latitudeStr = formData.get("latitude") as string | null;
    const longitudeStr = formData.get("longitude") as string | null;
    const accuracyMetersStr = formData.get("accuracyMeters") as string | null;
    const textDescription = formData.get("textDescription") as string | null;

    const rawInput = {
      latitude: latitudeStr ? parseFloat(latitudeStr) : undefined,
      longitude: longitudeStr ? parseFloat(longitudeStr) : undefined,
      accuracyMeters: accuracyMetersStr ? parseFloat(accuracyMetersStr) : 0,
      textDescription: textDescription || undefined,
    };

    const parsed = observationInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.issues }, { status: 400 });
    }

    const result = await observationService.createAndAnalyze(session.user.id, {
      photoFile: photoFile || undefined,
      audioFile: audioFile || undefined,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      accuracyMeters: parsed.data.accuracyMeters,
      textDescription: parsed.data.textDescription,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (err) {
    logger.error("analyze route error", { error: err });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
