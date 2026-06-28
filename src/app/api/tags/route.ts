import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "16"), 50);

  try {
    // Build where clause
    const where: Record<string, unknown> = {};
    if (country) {
      where.country = country.toUpperCase();
    }

    // Get trends with their tags for the country
    const trends = await prisma.trend.findMany({
      where,
      orderBy: [
        { viralScore: "desc" },
        { growthRate: "desc" },
      ],
      take: 100, // Get enough trends to aggregate tags
    });

    // Aggregate tags with counts
    const tagMap = new Map<string, { name: string; count: number; growth: number }>();

    trends.forEach((trend) => {
      (trend.tags || []).forEach((tagName: string) => {
        const existing = tagMap.get(tagName);

        if (existing) {
          existing.count += trend.creators;
          existing.growth = Math.max(existing.growth, trend.growthRate);
        } else {
          tagMap.set(tagName, {
            name: tagName,
            count: trend.creators,
            growth: trend.growthRate,
          });
        }
      });
    });

    // Convert to array and sort by count
    const tags = Array.from(tagMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return NextResponse.json({
      data: tags,
      meta: { country, total: tags.length },
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}
