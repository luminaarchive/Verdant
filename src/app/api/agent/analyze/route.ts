import { NextRequest, NextResponse } from "next/server";
import { runNaLIAgent } from "@/lib/agent/core/orchestrator";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { observationId, photoUrl, audioUrl, text, latitude, longitude, accuracyMeters } = body;

    if (!observationId) {
      return NextResponse.json({ error: "observationId is required" }, { status: 400 });
    }

    if (!photoUrl && !audioUrl && !text) {
      return NextResponse.json({ error: "At least one input (photoUrl, audioUrl, text) is required" }, { status: 400 });
    }

    logger.info("Agent analyze request started", { observationId, userId: session.user.id });

    const result = await runNaLIAgent({
      observationId,
      photoUrl,
      audioUrl,
      text,
      latitude,
      longitude,
    });

    if (result.success) {
      logger.info("Agent analyze request finished successfully", { observationId });
      return NextResponse.json(result.data, { status: 200 });
    } else {
      logger.error("Agent analyze request failed", { observationId, error: result.error });
      return NextResponse.json(
        { error: result.error.message, code: result.error.code }, 
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error("Agent analyze route error", { error });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
