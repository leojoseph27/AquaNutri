/** GET /api/fish-db - returns the full fish nutrient database. */
import { NextResponse } from "next/server";
import { getFishDb } from "@/lib/aquanutri/fish-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ count: getFishDb().length, species: getFishDb() });
}
