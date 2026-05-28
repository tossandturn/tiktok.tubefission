import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const trends = await prisma.trend.findMany({
    where: {
      OR: [{ isViral: true }, { isNew: true }],
      aiScore: { gte: 60 },
    },
    include: { tags: { include: { tag: true } } },
    orderBy: [{ aiScore: "desc" }, { growthRate: "desc" }],
    take: 10,
  });

  const hashtags = await prisma.hashtag.findMany({
    where: { isRising: true },
    orderBy: { growthRate: "desc" },
    take: 10,
  });

  const sounds = await prisma.sound.findMany({
    where: { isViral: true },
    orderBy: { uses: "desc" },
    take: 5,
  });

  return NextResponse.json({
    data: {
      trends,
      hashtags,
      sounds,
      generatedAt: new Date().toISOString(),
    },
  });
}
