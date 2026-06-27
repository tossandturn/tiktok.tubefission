import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country");
  const viral = searchParams.get("viral");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
  const offset = parseInt(searchParams.get("offset") ?? "0");

  try {
    const where: Record<string, unknown> = {};
    if (country) where.country = country.toUpperCase();
    if (viral === "true") where.isViral = true;

    const [sounds, total] = await Promise.all([
      prisma.sound.findMany({
        where,
        orderBy: [
          { isViral: "desc" },
          { uses: "desc" },
          { viralScore: "desc" },
        ],
        take: limit,
        skip: offset,
        select: {
          id: true,
          title: true,
          author: true,
          thumbnail: true,
          uses: true,
          growthRate: true,
          isViral: true,
          viralScore: true,
          trendingSince: true,
        },
      }),
      prisma.sound.count({ where }),
    ]);

    return NextResponse.json({
      data: sounds,
      meta: { total, limit, offset },
    });
  } catch (error) {
    console.error("Failed to fetch sounds:", error);
    // Return empty data on error
    return NextResponse.json({
      data: [],
      meta: { total: 0, limit, offset },
    });
  }
}
