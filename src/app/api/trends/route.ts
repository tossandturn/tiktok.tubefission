import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const viral = searchParams.get("viral");
  const isNew = searchParams.get("new");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
  const offset = parseInt(searchParams.get("offset") ?? "0");

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (viral === "true") where.isViral = true;
  if (isNew === "true") where.isNew = true;

  const [trends, total] = await Promise.all([
    prisma.trend.findMany({
      where,
      include: { tags: { include: { tag: true } } },
      orderBy: [{ aiScore: "desc" }, { growthRate: "desc" }],
      take: limit,
      skip: offset,
    }),
    prisma.trend.count({ where }),
  ]);

  return NextResponse.json({
    data: trends,
    meta: { total, limit, offset },
  });
}
