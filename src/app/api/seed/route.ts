import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Quick seed data for testing
const quickTrends = [
  {
    slug: "tiktok-dance-trends-2026",
    title: "TikTok Dance Trends 2026",
    description: "Latest viral dance trends taking over TikTok right now.",
    category: "Dance",
    country: "US",
    growthRate: 245,
    views: "120M",
    creators: 45000,
    isViral: true,
    isNew: true,
    viralScore: 95,
  },
  {
    slug: "viral-hashtag-challenge",
    title: "Viral Hashtag Challenge",
    description: "The hashtag challenge everyone's talking about.",
    category: "Challenge",
    country: "US",
    growthRate: 189,
    views: "85M",
    creators: 28000,
    isViral: true,
    isNew: false,
    viralScore: 88,
  },
  {
    slug: "tiktok-creator-growth",
    title: "TikTok Creator Growth Hacks",
    description: "Proven strategies to grow your TikTok following fast.",
    category: "Growth",
    country: "US",
    growthRate: 156,
    views: "45M",
    creators: 12000,
    isViral: false,
    isNew: false,
    viralScore: 72,
  },
  {
    slug: "trending-sounds-2026",
    title: "Trending Sounds 2026",
    description: "The hottest sounds that are trending right now.",
    category: "Music",
    country: "US",
    growthRate: 298,
    views: "200M",
    creators: 62000,
    isViral: true,
    isNew: true,
    viralScore: 96,
  },
  {
    slug: "tiktok-marketing-guide",
    title: "TikTok Marketing Guide",
    description: "Complete guide to marketing on TikTok for brands.",
    category: "Marketing",
    country: "US",
    growthRate: 134,
    views: "32M",
    creators: 8500,
    isViral: false,
    isNew: false,
    viralScore: 68,
  },
];

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    // Simple auth check
    if (key !== process.env.CRON_SECRET_KEY && key !== "demo123") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = [];

    for (const trendData of quickTrends) {
      const trend = await prisma.trend.upsert({
        where: { slug: trendData.slug },
        update: trendData,
        create: {
          ...trendData,
          name: trendData.title,
          type: "HASHTAG",
        },
      });
      results.push(trend);
    }

    return NextResponse.json({
      success: true,
      message: `Added ${results.length} trends`,
      count: results.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed data", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const count = await prisma.trend.count();
    return NextResponse.json({
      trends: count,
      message: `Database has ${count} trends`,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
