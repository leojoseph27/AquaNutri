/**
 * POST /api/recommend
 * Body: RecommendationFilters
 * Returns ranked fish species matching the user's deficiencies + filters.
 */
import { NextRequest, NextResponse } from "next/server";
import { recommendFish } from "@/lib/aquanutri/recommend";
import type { RecommendationFilters } from "@/lib/aquanutri/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<RecommendationFilters>;
    const filters: RecommendationFilters = {
      deficiencies: body.deficiencies ?? [],
      waterTypes: body.waterTypes ?? [],
      region: body.region,
      farmingOnly: body.farmingOnly ?? false,
      maxDifficulty: body.maxDifficulty,
    };
    const ranked = recommendFish(filters);
    return NextResponse.json({ count: ranked.length, recommendations: ranked });
  } catch (e) {
    return NextResponse.json(
      { error: "recommendation failed", detail: String(e) },
      { status: 500 },
    );
  }
}
