/**
 * POST /api/predict
 * Proxies a skin image upload to the Python Flask inference service (port 5001).
 * Returns the model's ranked deficiency predictions.
 */
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SKIN_API_PORT = 5001;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get("image");
    if (!image || !(image instanceof File)) {
      return NextResponse.json({ error: "no image uploaded" }, { status: 400 });
    }

    // Forward the same multipart form to the Flask service.
    const upstream = new FormData();
    upstream.append("image", image, image.name || "skin.jpg");

    const resp = await fetch(`http://localhost:${SKIN_API_PORT}/predict`, {
      method: "POST",
      body: upstream,
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return NextResponse.json(
        { error: `inference service error: ${resp.status}`, detail: txt },
        { status: 502 },
      );
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: "inference request failed", detail: String(e) },
      { status: 500 },
    );
  }
}

/** GET /api/predict?probe=1 - lightweight probe to check if the Flask service is up. */
export async function GET() {
  try {
    const resp = await fetch(`http://localhost:${SKIN_API_PORT}/health`, {
      method: "GET",
    });
    if (!resp.ok) {
      return NextResponse.json({ status: "down", up: false }, { status: 503 });
    }
    const data = await resp.json();
    return NextResponse.json({ status: "ok", up: true, ...data });
  } catch {
    return NextResponse.json({ status: "down", up: false }, { status: 503 });
  }
}
