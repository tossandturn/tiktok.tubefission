/**
 * SECTION 2: Scraper Reconstruction
 * Daily Scraper Job with Historical Snapshots
 *
 * Pattern: Append-only, never overwrite
 * - Save creator (upsert)
 * - Create creator snapshot row
 * - Save video (upsert)
 * - Create video snapshot row
 * - Save hashtag (upsert)
 * - Create hashtag snapshot row
 */

import { prisma } from "../src/lib/db";
import { scrapeHashtagList, scrapeHashtag, scrapeHashtagVideos, closeBrowser } from "../src/lib/scraper-enhanced";

interface ScrapeContext {
  country: string;
  scrapedAt: Date;
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
 * demand = views + likes + growth
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

/**
 * Parse numeric values from scraped strings
 */
function parseNumericValue(value: string): number {
  if (!value) return 0;
  const clean = value.replace(/[^\d.]/g, "");
  const num = parseFloat(clean);
  if (value.includes("K")) return num * 1000;
  if (value.includes("M")) return num * 1000000;
  if (value.includes("B")) return num * 1000000000;
  return num || 0;
}

async function logScrape(type: string, status: string, count: number, error?: string, metadata?: Record<string, unknown>) {
  await prisma.scrapeLog.create({
    data: { type, status, count, error: error ?? undefined, metadata: metadata as unknown as undefined },
  });
}

/**
 * Save creator with upsert pattern and create daily snapshot
 */
async function saveCreatorAndSnapshot(
  username: string,
  displayName: string,
  followers: number,
  following: number,
  likes: number,
  avatar?: string,
  niche?: string,
  bio?: string,
  isVerified?: boolean
) {
  const creator = await prisma.creator.upsert({
    where: { username },
    update: {
      displayName,
      avatar,
      followers,
      following,
      likes,
      niche,
      bio,
      isVerified: isVerified ?? false,
      updatedAt: new Date(),
    },
    create: {
      username,
      displayName,
      avatar,
      followers,
      following,
      likes,
      niche,
      bio,
      isVerified: isVerified ?? false,
    },
  });

  // Get previous snapshot for growth calculation
  const previousSnapshot = await prisma.creatorDailySnapshot.findFirst({
    where: { creatorId: creator.id },
    orderBy: { createdAt: "desc" },
  });

  let trendScore = 0;
  if (previousSnapshot) {
    const followerGrowth = previousSnapshot.followers > 0
      ? ((followers - previousSnapshot.followers) / previousSnapshot.followers) * 100
      : 0;
    const likeGrowth = Number(previousSnapshot.totalLikes) > 0
      ? ((likes - Number(previousSnapshot.totalLikes)) / Number(previousSnapshot.totalLikes)) * 100
      : 0;
    trendScore = calculateTrendScore(followerGrowth, likeGrowth, 0, 0);
  }

  // Create daily snapshot (append-only)
  await prisma.creatorDailySnapshot.create({
    data: {
      creatorId: creator.id,
      followers,
      following,
      totalLikes: BigInt(likes),
      totalVideos: 0,
      trendScore,
    },
  });

  return creator;
}

/**
 * Save video with upsert pattern and create daily snapshot
 */
async function saveVideoAndSnapshot(
  tiktokId: string,
  trendId: string,
  views: string,
  likes: string,
  shares: string,
  comments: string,
  url?: string,
  thumbnail?: string,
  duration?: string
) {
  const video = await prisma.video.upsert({
    where: { tiktokId },
    update: {
      url,
      thumbnail,
      views,
      likes,
      shares,
      comments,
      duration,
      scrapedAt: new Date(),
    },
    create: {
      trendId,
      tiktokId,
      url,
      thumbnail,
      views,
      likes,
      shares,
      comments,
      duration,
    },
  });

  const currentViews = parseNumericValue(views);
  const currentLikes = parseNumericValue(likes);
  const currentShares = parseNumericValue(shares);
  const currentComments = parseNumericValue(comments);

  // Get previous snapshot for growth calculation
  const previousSnapshot = await prisma.videoDailySnapshot.findFirst({
    where: { videoId: video.id },
    orderBy: { collectedAt: "desc" },
  });

  let viewsGrowth = 0;
  let likesGrowth = 0;
  let sharesGrowth = 0;
  let commentsGrowth = 0;
  let trendScore = 0;

  if (previousSnapshot) {
    const prevViews = Number(previousSnapshot.views);
    const prevLikes = Number(previousSnapshot.likes);
    const prevShares = Number(previousSnapshot.shares);
    const prevComments = Number(previousSnapshot.comments);

    viewsGrowth = prevViews > 0 ? ((currentViews - prevViews) / prevViews) * 100 : 0;
    likesGrowth = prevLikes > 0 ? ((currentLikes - prevLikes) / prevLikes) * 100 : 0;
    sharesGrowth = prevShares > 0 ? ((currentShares - prevShares) / prevShares) * 100 : 0;
    commentsGrowth = prevComments > 0 ? ((currentComments - prevComments) / prevComments) * 100 : 0;

    trendScore = calculateTrendScore(viewsGrowth, likesGrowth, sharesGrowth, commentsGrowth);
  }

  // Create daily snapshot (append-only)
  await prisma.videoDailySnapshot.create({
    data: {
      videoId: video.id,
      views: BigInt(Math.floor(currentViews)),
      likes: BigInt(Math.floor(currentLikes)),
      comments: BigInt(Math.floor(currentComments)),
      shares: BigInt(Math.floor(currentShares)),
      viewsGrowth,
      likesGrowth,
      sharesGrowth,
      commentsGrowth,
      trendScore,
    },
  });

  return video;
}

/**
 * Save hashtag with upsert pattern and create daily snapshot
 */
async function saveHashtagAndSnapshot(
  name: string,
  country: string,
  views: string,
  videos: number,
  growthRate?: number,
  category?: string,
  isRising?: boolean
) {
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
      growthRate: growthRate ?? 0,
      category,
      isRising: isRising ?? false,
      scrapedAt: new Date(),
    },
    create: {
      name: name.toLowerCase(),
      country,
      views,
      videos,
      growthRate: growthRate ?? 0,
      category,
      isRising: isRising ?? false,
    },
  });

  const viewCount = parseNumericValue(views);

  // Get previous snapshot for trend score calculation
  const previousSnapshot = await prisma.hashtagDailySnapshot.findFirst({
    where: { hashtagId: hashtag.id },
    orderBy: { collectedAt: "desc" },
  });

  let trendScore = 0;
  if (previousSnapshot) {
    const viewGrowth = Number(previousSnapshot.viewCount) > 0
      ? ((viewCount - Number(previousSnapshot.viewCount)) / Number(previousSnapshot.viewCount)) * 100
      : 0;
    trendScore = calculateTrendScore(viewGrowth, growthRate ?? 0, 0, 0);
  }

  // Create daily snapshot (append-only)
  await prisma.hashtagDailySnapshot.create({
    data: {
      hashtagId: hashtag.id,
      usageCount: BigInt(videos),
      videoCount: videos,
      viewCount: BigInt(Math.floor(viewCount)),
      growthRate: growthRate ?? 0,
      trendScore,
    },
  });

  return hashtag;
}

/**
 * Calculate and store opportunity scores for hashtags
 */
async function calculateAndStoreOpportunityScores(country: string) {
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

    const opportunityScore = calculateOpportunityScore(
      views,
      0,
      growth,
      creatorCount,
      videoCount
    );

    await prisma.hashtag.update({
      where: { id: hashtag.id },
      data: { viralScore: latestSnapshot.trendScore },
    });

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
 * Update trend scores and opportunity scores
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

async function runDiscoverScrape(country: string) {
  console.log(`[SCRAPE] Starting discover scrape for ${country}...`);

  try {
    // Use scrapeHashtagList with country parameter
    const hashtags = await scrapeHashtagList(100, country);

    for (const h of hashtags) {
      await saveHashtagAndSnapshot(
        h.name,
        country,
        h.views,
        parseInt(h.videoCount.replace(/[^0-9]/g, "")) || 0,
        h.growthRate,
        "General",
        h.isRising
      );
    }

    await logScrape("discover", "success", hashtags.length, undefined, { country });
    console.log(`[SCRAPE] Discover done: ${hashtags.length} hashtags for ${country}`);
  } catch (error) {
    await logScrape("discover", "error", 0, String(error), { country });
    console.error(`[SCRAPE] Discover failed for ${country}:`, error);
  }
}

async function runHashtagDeepDive(hashtagNames: string[], country: string) {
  console.log(`[SCRAPE] Starting hashtag deep dive for ${country}...`);

  // Process more hashtags (10 instead of 5)
  for (const name of hashtagNames.slice(0, 10)) {
    try {
      // Pass country parameter
      const trend = await scrapeHashtag(name, country);
      if (!trend) continue;

      // Scrape more videos per hashtag (20 instead of 10)
      // Pass country parameter
      const videos = await scrapeHashtagVideos(name, 20, country);
      const slug = trend.hashtag.replace("#", "").toLowerCase().replace(/[^a-z0-9]+/g, "-");

      // Upsert trend
      await prisma.trend.upsert({
        where: { slug },
        update: {
          views: trend.views,
          growthRate: trend.growthRate ?? 0,
          updatedAt: new Date(),
        },
        create: {
          slug,
          title: trend.title,
          description: `Trending hashtag with ${trend.views} views`,
          category: "General",
          country,
          views: trend.views,
          growthRate: trend.growthRate ?? 0,
          creators: parseInt(trend.videoCount.replace(/[^0-9]/g, "")) || 0,
        },
      });

      const trendRecord = await prisma.trend.findUnique({ where: { slug } });
      if (trendRecord) {
        for (const v of videos) {
          await saveVideoAndSnapshot(
            v.id,
            trendRecord.id,
            v.views,
            v.likes,
            "0",
            "0",
            v.url
          );
        }
      }

      await logScrape("hashtag", "success", videos.length, undefined, { hashtag: name, country });
      console.log(`[SCRAPE] ${name}: ${videos.length} videos for ${country}`);
    } catch (error) {
      await logScrape("hashtag", "error", 0, String(error), { hashtag: name, country });
      console.error(`[SCRAPE] ${name} failed for ${country}:`, error);
    }
  }
}

async function main() {
  const mode = process.argv[2] ?? "all";
  const countries = ["US", "GB", "CA", "AU", "DE"];

  try {
    for (const country of countries) {
      if (mode === "discover" || mode === "all") {
        await runDiscoverScrape(country);
      }

      if (mode === "hashtags" || mode === "all") {
        const hashtags = await prisma.hashtag.findMany({
          where: { isRising: true, country },
          orderBy: { growthRate: "desc" },
          take: 5,
        });
        await runHashtagDeepDive(hashtags.map((h: { name: string }) => h.name), country);
      }

      // Calculate scores for this country
      console.log(`[SCRAPE] Calculating opportunity scores for ${country}...`);
      await calculateAndStoreOpportunityScores(country);

      console.log(`[SCRAPE] Updating trend scores for ${country}...`);
      await updateTrendScores(country);
    }
  } finally {
    await closeBrowser();
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

export { calculateTrendScore, calculateOpportunityScore };
