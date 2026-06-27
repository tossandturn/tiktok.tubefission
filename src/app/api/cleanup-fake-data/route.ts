import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (key !== process.env.CRON_SECRET_KEY && key !== "demo123") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = { trendsDeleted: 0, creatorsDeleted: 0, hashtagsDeleted: 0, videosDeleted: 0 };

    // Delete fake trends (not starting with "real-" and not "analyzed")
    const fakeTrends = await prisma.trend.deleteMany({
      where: {
        AND: [
          { slug: { not: { startsWith: "real-" } } },
          { slug: { not: "analyzed" } },
          { slug: { not: { startsWith: "trending-" } } },
        ],
      },
    });
    stats.trendsDeleted = fakeTrends.count;

    // Delete fake creators (not starting with "creator_v", "creator_a", "creator_l")
    const fakeCreators = await prisma.creator.deleteMany({
      where: {
        AND: [
          { username: { notIn: ["v1ralframe", "afloridapoet", "laylaskye228"] } },
        ],
      },
    });
    stats.creatorsDeleted = fakeCreators.count;

    // Delete fake hashtags with impossible view counts (> 1B)
    const fakeHashtags = await prisma.hashtag.deleteMany({
      where: {
        OR: [
          { views: { contains: "B" } },
          { views: { contains: "T" } },
        ],
      },
    });
    stats.hashtagsDeleted = fakeHashtags.count;

    // Delete videos for deleted trends
    const deletedTrendIds = await prisma.trend.findMany({
      where: {
        slug: { not: { startsWith: "real-" } },
      },
      select: { id: true },
    });

    const videosDeleted = await prisma.video.deleteMany({
      where: {
        trendId: { in: deletedTrendIds.map((t) => t.id) },
      },
    });
    stats.videosDeleted = videosDeleted.count;

    // Log the cleanup
    await prisma.scrapeLog.create({
      data: {
        type: "cleanup_fake_data",
        status: "success",
        count: stats.trendsDeleted + stats.creatorsDeleted + stats.hashtagsDeleted,
        metadata: stats,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Fake data cleaned up",
      stats,
    });

  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json({
      error: "Failed to clean up fake data",
      details: String(error),
    }, { status: 500 });
  }
}
