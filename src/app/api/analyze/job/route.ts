import { NextRequest, NextResponse } from "next/server";

// Job status endpoint - temporarily disabled
export async function GET(req: NextRequest) {
  console.log("Job status request:", req.url);
  return NextResponse.json({
    status: "disabled",
    message: "Async job processing is temporarily disabled. Please use the main analyze endpoint.",
  });
}
