/**
 * GET/POST /api/scans
 * - GET  returns the user's scan timeline (read from localStorage on the client).
 *        This endpoint is a no-op stub kept for symmetry; the client reads
 *        localStorage directly to avoid round-tripping data URLs through the
 *        server.
 * - POST echoes back the scan record so the client can persist it locally.
 *        This keeps the "save" flow server-callable if we later move to a DB.
 */
import { NextRequest, NextResponse } from "next/server";
import type { ScanRecord } from "@/lib/aquanutri/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<ScanRecord>;
    if (!body.id || !body.timestamp) {
      return NextResponse.json({ error: "missing id/timestamp" }, { status: 400 });
    }
    // Echo back - client persists to localStorage.
    return NextResponse.json({ ok: true, record: body });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
