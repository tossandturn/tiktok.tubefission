import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country");
  const category = searchParams.get("category");
  const rising = searchParams.get("rising");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
  const offset = parseInt(searchParams.get("offset") ?? "0");

  try {
    const where: Record<string, unknown> = {};
    if (country) where.country = country.toUpperCase();
    if (category) where.category = category;
    if (rising === "true") where.isRising = true;

    const [hashtags, total] = await Promise.all([
      prisma.hashtag.findMany({
        where,
        orderBy: [
          { isRising: "desc" },
          { viralScore: "desc" },
          { views: "desc" },
        ],
        take: limit,
        skip: offset,
        select: {
          id: true,
          name: true,
          views: true,
          videos: true,
          growthRate: true,
          category: true,
          isRising: true,
          viralScore: true,
        },
      }),
      prisma.hashtag.count({ where }),
    ]);

    return NextResponse.json({
      data: hashtags,
      meta: { total, limit, offset },
    });
  } catch {
    // Database unavailable — return empty with fallback
    return NextResponse.json({
      data: [],
      meta: { total: 0, limit, offset },
    });
  }
}
