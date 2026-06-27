import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { trends as staticTrends } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const viral = searchParams.get("viral");
  const isNew = searchParams.get("new");
  const country = searchParams.get("country");
  const rising = searchParams.get("rising");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
  const offset = parseInt(searchParams.get("offset") ?? "0");

  try {
    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (viral === "true") where.isViral = true;
    if (isNew === "true") where.isNew = true;
    if (country) where.country = country.toUpperCase();
    if (rising === "true") {
      where.growthRate = { gt: 0 };
    }

    const [trends, total] = await Promise.all([
      prisma.trend.findMany({
        where,
        include: { tags: { include: { tag: true } } },
        orderBy: rising === "true" ? [{ growthRate: "desc" }, { aiScore: "desc" }] : [{ aiScore: "desc" }, { growthRate: "desc" }],
        take: limit,
        skip: offset,
      }),
      prisma.trend.count({ where }),
    ]);

    return NextResponse.json({
      data: trends,
      meta: { total, limit, offset },
    });
  } catch {
    // Database unavailable — return static data
    const filtered = staticTrends.filter((t) => {
      if (category && t.category !== category) return false;
      if (viral === "true" && !t.isViral) return false;
      if (isNew === "true" && !t.isNew) return false;
      if (rising === "true" && t.growthRate <= 0) return false;
      return true;
    });

    const page = filtered.slice(offset, offset + limit).map((t) => ({
      ...t,
      slug: t.id,
      tags: t.tags.map((tag: string) => ({ tag: { name: tag.replace("#", "") } })),
    }));

    return NextResponse.json({
      data: page,
      meta: { total: filtered.length, limit, offset },
    });
  }
}
