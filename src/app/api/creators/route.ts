import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { featuredCreators } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country");
  const niche = searchParams.get("niche");
  const verified = searchParams.get("verified");
  const rising = searchParams.get("rising");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
  const offset = parseInt(searchParams.get("offset") ?? "0");

  try {
    const where: Record<string, unknown> = {};
    if (country) where.country = country.toUpperCase();
    if (niche) where.niche = niche;
    if (verified === "true") where.isVerified = true;

    const [creators, total] = await Promise.all([
      prisma.creator.findMany({
        where,
        orderBy: rising === "true" ? [{ predictedGrowth7d: "desc" }, { momentumScore: "desc" }] : [{ momentumScore: "desc" }, { followers: "desc" }],
        take: limit,
        skip: offset,
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          followers: true,
          niche: true,
          momentumScore: true,
          predictedGrowth7d: true,
          isVerified: true,
        },
      }),
      prisma.creator.count({ where }),
    ]);

    return NextResponse.json({
      data: creators,
      meta: { total, limit, offset },
    });
  } catch {
    // Database unavailable — return static fallback
    const mapped = featuredCreators.map(c => ({
      id: c.id,
      username: c.name.toLowerCase().replace(/\s+/g, ""),
      displayName: c.name,
      avatar: c.avatar,
      followers: parseFloat(c.followers) * 1000000,
      niche: c.niche,
      momentumScore: 50,
      predictedGrowth7d: 0,
      isVerified: true,
    }));

    return NextResponse.json({
      data: mapped,
      meta: { total: mapped.length, limit, offset },
    });
  }
}
