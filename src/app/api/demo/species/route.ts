import { NextRequest, NextResponse } from "next/server";
import { findDemoSpecies, localizeDemoSpeciesResult } from "@/lib/demo/species";
import { checkRateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";

function getClientKey(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

export async function GET(req: NextRequest) {
  const rateLimit = checkRateLimit(`demo:species:${getClientKey(req)}`, {
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded for public species demo.",
        isDemo: true,
      },
      { headers: rateLimitHeaders(rateLimit), status: 429 },
    );
  }

  const query = req.nextUrl.searchParams.get("q") ?? "";
  if (!query.trim()) {
    return NextResponse.json(
      {
        error: "Species query is required.",
        isDemo: true,
      },
      { headers: rateLimitHeaders(rateLimit), status: 400 },
    );
  }

  const species = findDemoSpecies(query);
  if (!species) {
    return NextResponse.json(
      {
        error: "No NaLI golden-set species matched this public demo query.",
        isDemo: true,
        source: "nali-golden-set",
      },
      { headers: rateLimitHeaders(rateLimit), status: 404 },
    );
  }

  const language = req.nextUrl.searchParams.get("lang") === "id" ? "id" : "en";

  return NextResponse.json(localizeDemoSpeciesResult(species, language), {
    headers: {
      ...rateLimitHeaders(rateLimit),
      "Cache-Control": "private, no-store",
    },
    status: 200,
  });
}
