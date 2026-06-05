/**
 * SECTION 2: Scraper API with Historical Snapshots
 * Daily Scraper Job - API Version
 *
 * Pattern: Append-only, never overwrite
 * - Save creator (upsert) + create snapshot
 * - Save video (upsert) + create snapshot
 * - Save hashtag (upsert) + create snapshot
 * - Calculate trend scores and opportunity scores
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scrapeHashtagList, batchScrapeHashtags, closeBrowser } from "@/lib/scraper-enhanced";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes max

// Countries to scrape
const COUNTRIES = ["US", "GB", "CA", "AU", "DE"];

async function logScrape(type: string, status: string, count: number, error?: string, metadata?: Record<string, unknown>) {
  try {
    await prisma.scrapeLog.create({
      data: { type, status, count, error: error ?? undefined, metadata: metadata as unknown as undefined },
    });
  } catch (e) {
    console.error("Failed to log scrape:", e);
  }
}

/**
 * SECTION 7: Trend Score Formula
 * trendScore = 0.35*viewsGrowth + 0.25*likesGrowth + 0.20*sharesGrowth + 0.20*commentsGrowth
 */
function calculateTrendScore(
  viewsGrowth: number,
  likesGrowth: number,
  sharesGrowth: number,
  commentsGrowth: number
): number {
  const score =
    0.35 * viewsGrowth +
    0.25 * likesGrowth +
    0.20 * sharesGrowth +
    0.20 * commentsGrowth;
  return Math.round(score * 100) / 100;
}

/**
 * SECTION 8: Opportunity Score Formula
 * demand = views + likes + growth*1000
 * competition = creatorCount + videoCount
 * opportunity = demand / competition
 */
function calculateOpportunityScore(
  views: number,
  likes: number,
  growth: number,
  creatorCount: number,
  videoCount: number
): number {
  const demand = views + likes + growth * 1000;
  const competition = creatorCount + videoCount;
  if (competition === 0) return 0;
  const score = demand / competition;
  return Math.round(score * 100) / 100;
}

function parseNumericValue(value: string): number {
  if (!value) return 0;
  const clean = value.replace(/[^\d.]/g, "");
  const num = parseFloat(clean);
  if (value.includes("K")) return num * 1000;
  if (value.includes("M")) return num * 1000000;
  if (value.includes("B")) return num * 1000000000;
  return num || 0;
}

/**
 * Save hashtag with upsert + daily snapshot
 */
async function saveHashtagWithSnapshot(
  name: string,
  country: string,
  views: string,
  videos: number,
  isRising: boolean
) {
  // Upsert hashtag
  const hashtag = await prisma.hashtag.upsert({
    where: {
      name_country: {
        name: name.toLowerCase(),
        country,
      },
    },
    update: {
      views,
      videos,
      isRising,
      scrapedAt: new Date(),
    },
    create: {
      name: name.toLowerCase(),
      country,
      views,
      videos,
      isRising,
    },
  });

  // Get previous snapshot for growth calculation
  const previousSnapshot = await prisma.hashtagDailySnapshot.findFirst({
    where: { hashtagId: hashtag.id },
    orderBy: { collectedAt: "desc" },
  });

  const viewCount = parseNumericValue(views);
  let trendScore = 0;
  let growthRate = 0;

  if (previousSnapshot) {
    const prevViews = Number(previousSnapshot.viewCount);
    growthRate = prevViews > 0 ? ((viewCount - prevViews) / prevViews) * 100 : 0;
    trendScore = calculateTrendScore(growthRate, 0, 0, 0);
  }

  // Create daily snapshot (append-only)
  await prisma.hashtagDailySnapshot.create({
    data: {
      hashtagId: hashtag.id,
      usageCount: BigInt(videos),
      videoCount: videos,
      viewCount: BigInt(Math.floor(viewCount)),
      growthRate,
      trendScore,
    },
  });

  return hashtag;
}

/**
 * Save video with upsert + daily snapshot
 */
async function saveVideoWithSnapshot(
  videoId: string,
  trendId: string,
  views: string,
  likes: string,
  url?: string
) {
  // Upsert video
  const video = await prisma.video.upsert({
    where: { tiktokId: videoId },
    update: {
      views,
      likes,
      scrapedAt: new Date(),
    },
    create: {
      trendId,
      tiktokId: videoId,
      url,
      views,
      likes,
    },
  });

  const currentViews = parseNumericValue(views);
  const currentLikes = parseNumericValue(likes);

  // Get previous snapshot
  const previousSnapshot = await prisma.videoDailySnapshot.findFirst({
    where: { videoId: video.id },
    orderBy: { collectedAt: "desc" },
  });

  let viewsGrowth = 0;
  let likesGrowth = 0;
  let trendScore = 0;

  if (previousSnapshot) {
    const prevViews = Number(previousSnapshot.views);
    const prevLikes = Number(previousSnapshot.likes);
    viewsGrowth = prevViews > 0 ? ((currentViews - prevViews) / prevViews) * 100 : 0;
    likesGrowth = prevLikes > 0 ? ((currentLikes - prevLikes) / prevLikes) * 100 : 0;
    trendScore = calculateTrendScore(viewsGrowth, likesGrowth, 0, 0);
  }

  // Create daily snapshot
  await prisma.videoDailySnapshot.create({
    data: {
      videoId: video.id,
      views: BigInt(Math.floor(currentViews)),
      likes: BigInt(Math.floor(currentLikes)),
      comments: BigInt(0),
      shares: BigInt(0),
      viewsGrowth,
      likesGrowth,
      sharesGrowth: 0,
      commentsGrowth: 0,
      trendScore,
    },
  });

  return video;
}

/**
 * Calculate and store opportunity scores for hashtags
 */
async function calculateOpportunityScores(country: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const hashtags = await prisma.hashtag.findMany({
    where: { country },
    include: {
      dailySnapshots: {
        orderBy: { collectedAt: "desc" },
        take: 1,
      },
    },
  });

  for (const hashtag of hashtags) {
    const latestSnapshot = hashtag.dailySnapshots[0];
    if (!latestSnapshot) continue;

    const views = Number(latestSnapshot.viewCount);
    const videoCount = latestSnapshot.videoCount;
    const growth = latestSnapshot.growthRate;
    const creatorCount = Math.floor(videoCount * 0.3);

    const opportunityScore = calculateOpportunityScore(views, 0, growth, creatorCount, videoCount);

    // Update hashtag viral score
    await prisma.hashtag.update({
      where: { id: hashtag.id },
      data: { viralScore: latestSnapshot.trendScore },
    });

    // Store opportunity score
    await prisma.opportunityScore.create({
      data: {
        targetType: "hashtag",
        targetId: hashtag.id,
        name: hashtag.name,
        demandScore: views + growth * 1000,
        competitionScore: creatorCount + videoCount,
        opportunityScore,
        country,
        expiresAt: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }
}

/**
 * Update trend scores for trends
 */
async function updateTrendScores(country: string) {
  const trends = await prisma.trend.findMany({
    where: { country },
    include: {
      videos: {
        include: {
          dailySnapshots: {
            orderBy: { collectedAt: "desc" },
            take: 1,
          },
        },
      },
      trendCreators: true,
    },
  });

  for (const trend of trends) {
    let totalTrendScore = 0;
    let videoCount = 0;
    let totalViews = 0;
    let totalLikes = 0;

    for (const video of trend.videos) {
      const latestSnapshot = video.dailySnapshots[0];
      if (latestSnapshot) {
        totalTrendScore += latestSnapshot.trendScore;
        totalViews += Number(latestSnapshot.views);
        totalLikes += Number(latestSnapshot.likes);
        videoCount++;
      }
    }

    const avgTrendScore = videoCount > 0 ? totalTrendScore / videoCount : 0;
    const creatorCount = trend.trendCreators.length;

    const opportunityScore = calculateOpportunityScore(
      totalViews,
      totalLikes,
      trend.growthRate,
      creatorCount,
      videoCount
    );

    await prisma.trend.update({
      where: { id: trend.id },
      data: {
        viralScore: avgTrendScore,
        opportunityScore,
      },
    });
  }
}

/**
 * Run bulk hashtag scrape with snapshots
 */
async function runBulkHashtagScrape(country: string, limit: number = 100) {
  console.log(`[CRON] Starting bulk hashtag scrape for ${country} (limit: ${limit})...`);

  try {
    // Pass country parameter to scrapeHashtagList
    const hashtags = await scrapeHashtagList(limit, country);
    let successCount = 0;

    for (const h of hashtags) {
      try {
        await saveHashtagWithSnapshot(
          h.name,
          country,
          h.views,
          parseInt(h.videoCount.replace(/[^0-9]/g, "")) || 0,
          h.isRising
        );
        successCount++;
      } catch (e) {
        console.error(`[CRON] Failed to process hashtag ${h.name}:`, e);
      }
    }

    await logScrape("bulk_hashtags", "success", hashtags.length, undefined, {
      country,
      requested: limit,
      processed: hashtags.length,
      upserted: successCount,
    });

    return { success: true, count: hashtags.length, upserted: successCount };
  } catch (error) {
    await logScrape("bulk_hashtags", "error", 0, String(error), { country });
    return { success: false, error: String(error) };
  }
}

/**
 * Run video scrape with snapshots
 */
async function runVideoScrape(country: string, topN: number = 10, videosPerHashtag: number = 50) {
  console.log(`[CRON] Starting video scrape for ${country} (top ${topN} hashtags)...`);

  try {
    const hashtags = await prisma.hashtag.findMany({
      where: { country },
      orderBy: [{ isRising: "desc" }, { videos: "desc" }],
      take: topN,
    });

    const hashtagNames = hashtags.map(h => h.name);
    // Pass country parameter to batchScrapeHashtags
    const results = await batchScrapeHashtags(hashtagNames, videosPerHashtag, country);

    let totalVideos = 0;
    const resultsArray = Array.from(results.entries());

    for (const [hashtagName, videos] of resultsArray) {
      const trend = await prisma.trend.findFirst({
        where: {
          title: { contains: hashtagName, mode: 'insensitive' },
          country,
        },
      });

      if (!trend) continue;

      for (const video of videos) {
        try {
          await saveVideoWithSnapshot(video.id, trend.id, video.views, video.likes, video.url);
          totalVideos++;
        } catch (e) {
          console.error(`[CRON] Failed to process video ${video.id}:`, e);
        }
      }
    }

    await logScrape("videos", "success", totalVideos, undefined, {
      country,
      hashtags: hashtagNames.length,
      videosPerHashtag,
    });

    return { success: true, count: totalVideos, hashtags: hashtagNames.length };
  } catch (error) {
    await logScrape("videos", "error", 0, String(error), { country });
    return { success: false, error: String(error) };
  }
}

/**
 * Run full scrape pipeline for a country
 */
async function runFullScrape(country: string) {
  console.log(`[CRON] Running full scrape pipeline for ${country}...`);

  // Step 1: Scrape hashtags with snapshots
  const hashtagResult = await runBulkHashtagScrape(country, 50);

  // Wait between requests
  await new Promise(r => setTimeout(r, 10000));

  // Step 2: Scrape videos with snapshots
  const videoResult = await runVideoScrape(country, 5, 30);

  // Step 3: Calculate opportunity scores
  await calculateOpportunityScores(country);

  // Step 4: Update trend scores
  await updateTrendScores(country);

  return { hashtag: hashtagResult, video: videoResult };
}

/**
 * CRON endpoint
 * ?key=SECRET&mode=bulk&country=US
 * ?key=SECRET&mode=videos&country=US
 * ?key=SECRET&mode=full - Run for all countries
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const mode = searchParams.get("mode") ?? "bulk";
  const country = searchParams.get("country") ?? "US";

  const secretKey = process.env.CRON_SECRET_KEY;
  if (!secretKey || key !== secretKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let result: Record<string, unknown> = {};

    if (mode === "full") {
      // Run for all countries
      for (const c of COUNTRIES) {
        console.log(`[CRON] Processing country: ${c}`);
        result[c] = await runFullScrape(c);
      }
    } else if (mode === "bulk") {
      result = await runBulkHashtagScrape(country, 100);
    } else if (mode === "videos") {
      result = await runVideoScrape(country, 10, 50);
    } else if (mode === "scores") {
      // Just recalculate scores
      await calculateOpportunityScores(country);
      await updateTrendScores(country);
      result = { message: "Scores recalculated", country };
    } else {
      return NextResponse.json({ error: "Invalid mode. Use: bulk, videos, full, scores" }, { status: 400 });
    }

    await closeBrowser();

    return NextResponse.json({
      success: true,
      mode,
      country: mode === "full" ? "all" : country,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    await closeBrowser();
    console.error("[CRON] Scrape failed:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
