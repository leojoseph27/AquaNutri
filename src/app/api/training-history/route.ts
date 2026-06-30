/**
 * GET /api/training-history
 * Returns the ResNet50 training accuracy/loss curves (for Fig. 7 in the UI).
 * Falls back to a stub if the model hasn't finished training yet.
 */
import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HISTORY_PATH = path.join(process.cwd(), "ml", "models", "training_history.json");

export async function GET() {
  if (!existsSync(HISTORY_PATH)) {
    return NextResponse.json({
      available: false,
      message: "Model training not yet completed. Check back shortly.",
    });
  }
  try {
    const raw = readFileSync(HISTORY_PATH, "utf-8");
    return NextResponse.json({ available: true, ...JSON.parse(raw) });
  } catch (e) {
    return NextResponse.json(
      { available: false, error: String(e) },
      { status: 500 },
    );
  }
}
