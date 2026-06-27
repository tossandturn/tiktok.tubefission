import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const MAX_GUEST_ANALYZES = Number.MAX_SAFE_INTEGER;
const MAX_LOGGED_IN_ANALYZES = Number.MAX_SAFE_INTEGER;

// Generate a simple fingerprint from request
function getFingerprint(req: NextRequest): string {
  const userAgent = req.headers.get("user-agent") || "";
  const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown";
  return Buffer.from(`${ip}-${userAgent}`).toString("base64").substring(0, 32);
}

// Get IP address
function getIpAddress(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
         req.ip ||
         "unknown";
}

// Get current date string YYYY-MM-DD
function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export async function GET(req: NextRequest) {
  try {
    // Check auth token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth-token")?.value;

    let userId: string | null = null;
    let isAuthenticated = false;

    if (authToken) {
      const session = await prisma.session.findUnique({
        where: { token: authToken },
        include: { user: true },
      });

      if (session && session.expiresAt > new Date()) {
        userId = session.userId;
        isAuthenticated = true;
      }
    }

    const fingerprint = getFingerprint(req);
    const ipAddress = getIpAddress(req);
    const today = getToday();

    // Get today's analyze count
    const dailyLimit = await prisma.dailyAnalyzeLimit.findFirst({
      where: userId
        ? { userId, date: today }
        : { ipAddress, date: today },
    });

    const usedAnalyzes = dailyLimit?.count || 0;
    const maxAnalyzes = isAuthenticated ? MAX_LOGGED_IN_ANALYZES : MAX_GUEST_ANALYZES;
    const remainingAnalyzes = Math.max(0, maxAnalyzes - usedAnalyzes);
    const hasReachedLimit = usedAnalyzes >= maxAnalyzes;

    // Get total analyzes
    const totalAnalyzes = await prisma.analyzeTracking.count({
      where: userId
        ? { userId }
        : { fingerprint, isGuest: true },
    });

    return NextResponse.json({
      isAuthenticated,
      usedAnalyzes,
      remainingAnalyzes,
      maxAnalyzes,
      hasReachedLimit,
      totalAnalyzes,
      needsLogin: hasReachedLimit && !isAuthenticated,
    });

  } catch (error) {
    console.error("Analyze limit check error:", error);
    return NextResponse.json(
      { error: "Failed to check analyze limit" },
      { status: 500 }
    );
  }
}

// Increment analyze count
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth-token")?.value;

    let userId: string | null = null;
    let isAuthenticated = false;

    if (authToken) {
      const session = await prisma.session.findUnique({
        where: { token: authToken },
      });

      if (session && session.expiresAt > new Date()) {
        userId = session.userId;
        isAuthenticated = true;
      }
    }

    const fingerprint = getFingerprint(req);
    const ipAddress = getIpAddress(req);
    const today = getToday();

    // Upsert daily limit
    await prisma.dailyAnalyzeLimit.upsert({
      where: userId
        ? { userId_date: { userId, date: today } }
        : { ipAddress_date: { ipAddress, date: today } },
      create: {
        userId,
        ipAddress: userId ? null : ipAddress,
        date: today,
        count: 1,
      },
      update: {
        count: { increment: 1 },
      },
    });

    // Track this analyze
    const body = await req.json().catch(() => ({}));
    await prisma.analyzeTracking.create({
      data: {
        userId,
        fingerprint: userId ? null : fingerprint,
        ipAddress: userId ? null : ipAddress,
        type: body.type || "video",
        targetId: body.targetId,
        targetUrl: body.targetUrl,
        data: body.data,
        isGuest: !isAuthenticated,
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Analyze tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track analyze" },
      { status: 500 }
    );
  }
}
