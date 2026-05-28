import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const trend = await prisma.trend.findUnique({
    where: { slug: id },
    include: {
      tags: { include: { tag: true } },
      videos: { take: 5, orderBy: { views: "desc" } },
      trendCreators: {
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              followers: true,
            },
          },
        },
      },
    },
  });

  if (!trend) {
    return NextResponse.json({ error: "Trend not found" }, { status: 404 });
  }

  return NextResponse.json({ data: trend });
}
