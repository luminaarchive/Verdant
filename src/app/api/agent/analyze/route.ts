import { NextRequest, NextResponse } from "next/server";
import { ObservationOrchestrator } from "@/lib/agent/core/orchestrator";
import { MockVisionTool } from "@/lib/agent/tools/vision.mock";
import { MockGBIFTool } from "@/lib/agent/tools/gbif.mock";
import { MockIUCNTool } from "@/lib/agent/tools/iucn.mock";
import { MockAnomalyTool } from "@/lib/agent/tools/anomaly.mock";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Phase 8: Simple IP/User based rate limiting stub
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `rl_${session.user.id}_${ip}`;
    // In real implementation: await redis.incr(rateLimitKey); if > limit throw 429
    // logger.info("Rate limit checked", { key: rateLimitKey });

    const body = await req.json();
    const { observationId } = body;

    if (!observationId) {
      return NextResponse.json({ error: "observationId is required" }, { status: 400 });
    }

    logger.info("Agent analyze workflow triggered", { observationId, userId: session.user.id });

    // In the new async architecture, we return immediately and run in background
    const pipeline = [
      new MockVisionTool(),
      new MockGBIFTool(),
      new MockIUCNTool(),
      new MockAnomalyTool()
    ];

    const orchestrator = new ObservationOrchestrator(observationId, pipeline);
    
    // Non-blocking async execution
    orchestrator.executeWorkflow().catch(err => {
      logger.error("Async Orchestrator failed", { error: err, observationId });
    });

    return NextResponse.json({ success: true, message: "Orchestration triggered" }, { status: 202 });
  } catch (error) {
    logger.error("Agent analyze route error", { error });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
