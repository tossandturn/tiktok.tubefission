import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country") || "US";
    const limit = parseInt(searchParams.get("limit") || "50");
    const sortBy = searchParams.get("sortBy") || "viralScore";

    // Validate sortBy
    const validSortFields = ["viralScore", "views", "growthRate", "velocity", "videos"];
    const orderField = validSortFields.includes(sortBy) ? sortBy : "viralScore";

    // Get hashtags for specific country
    const hashtags = await prisma.hashtag.findMany({
      where: { country },
      orderBy: { [orderField]: "desc" },
      take: limit,
    });

    // Calculate rankings
    const rankedHashtags = hashtags.map((hashtag, index) => ({
      rank: index + 1,
      id: hashtag.id,
      name: hashtag.name,
      views: hashtag.views,
      videos: hashtag.videos,
      growthRate: hashtag.growthRate,
      velocity: hashtag.velocity,
      viralScore: hashtag.viralScore,
      isRising: hashtag.isRising,
      category: hashtag.category,
      engagementRate: hashtag.engagementRate,
      scrapedAt: hashtag.scrapedAt,
    }));

    // Get country stats for word cloud
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyStats = await prisma.countryDailyStats.findFirst({
      where: {
        country,
        date: {
          gte: today,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      country,
      hashtags: rankedHashtags,
      wordCloud: dailyStats?.wordCloud || null,
      boomingKeywords: dailyStats?.boomingKeywords || null,
      totalCount: hashtags.length,
    });
  } catch (error) {
    console.error("Error fetching hashtag rankings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch rankings", details: String(error) },
      { status: 500 }
    );
  }
}
