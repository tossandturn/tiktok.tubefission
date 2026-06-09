import { NextRequest, NextResponse } from "next/server";

const OPENCLAW_PROXY_URL = process.env.OPENCLAW_PROXY_URL || "http://localhost:3001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    // Forward request to openclaw local proxy
    const response = await fetch(`${OPENCLAW_PROXY_URL}/api/tiktok/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: "Proxy error", details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      {
        error: "Failed to connect to proxy server",
        details: "Make sure openclaw proxy is running at " + OPENCLAW_PROXY_URL,
      },
      { status: 500 }
    );
  }
}
