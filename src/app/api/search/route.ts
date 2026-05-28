import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 50);

  if (!q || q.length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters" },
      { status: 400 }
    );
  }

  const [trends, hashtags, creators] = await Promise.all([
    prisma.trend.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      include: { tags: { include: { tag: true } } },
      take: limit,
      orderBy: { aiScore: "desc" },
    }),
    prisma.hashtag.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: limit,
      orderBy: { growthRate: "desc" },
    }),
    prisma.creator.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { displayName: { contains: q, mode: "insensitive" } },
        ],
      },
      take: limit,
      orderBy: { followers: "desc" },
    }),
  ]);

  return NextResponse.json({
    data: { trends, hashtags, creators },
    meta: { query: q, total: trends.length + hashtags.length + creators.length },
  });
}
