import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { startScraperRun, waitForRunCompletion, getDatasetItems, transformVideoData } from "@/lib/apify";

export const dynamic = "force-dynamic";

/**
 * Daily sync from Apify to Neon
 * Fetches trending content and syncs to database
 * Runs every 24 hours
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secretKey = searchParams.get("key");

  // Verify cron secret
  const CRON_SECRET = process.env.CRON_SECRET_KEY;
  if (!CRON_SECRET || secretKey !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const country = searchParams.get("country") || "US";
  const results = {
    creators: { added: 0, updated: 0 },
    videos: { added: 0, updated: 0 },
    hashtags: { added: 0, updated: 0 },
    errors: [] as string[],
  };

  try {
    const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
    if (!APIFY_API_TOKEN) {
      return NextResponse.json(
        { error: "APIFY_API_TOKEN not configured" },
        { status: 500 }
      );
    }

    // Countries and their trending hashtags
    const countryTargets: Record<string, string[]> = {
      US: ["fyp", "viral", "trending", "foryou", "usa", "funny", "dance"],
      JP: ["fyp", "trending", "japan", "tiktokjapan", "dance", "kawaii"],
      KR: ["fyp", "korea", "kpop", "trending", "dance"],
      GB: ["fyp", "uk", "trending", "british", "viral"],
      HK: ["fyp", "hongkong", "hk", "trending"],
      TW: ["fyp", "taiwan", "tw", "trending"],
    };

    const hashtags = countryTargets[country] || countryTargets["US"];

    // Start scraper for trending hashtags
    const run = await startScraperRun({
      hashtags,
      maxResults: 100,
      maxResultsPerQuery: 20,
      shouldDownloadVideos: false,
      shouldDownloadCovers: false,
    });

    // Wait for completion (max 5 minutes)
    await waitForRunCompletion(run.runId, 5);

    // Get results
    const items = await getDatasetItems(run.runId, 100);

    // Process each video
    for (const item of items) {
      try {
        const data = transformVideoData(item);

        if (!data.author || !data.id) continue;

        // Upsert creator
        await prisma.creator.upsert({
          where: { username: data.author.username },
          create: {
            id: data.author.id || `creator_${Date.now()}`,
            username: data.author.username,
            displayName: data.author.displayName,
            avatar: data.author.avatar || null,
            followers: data.author.followers || 0,
            following: data.author.following || 0,
            likes: data.author.likes || 0,
            isVerified: data.author.verified || false,
            tiktokId: data.author.id || null,
            country,
            updatedAt: new Date(),
          },
          update: {
            displayName: data.author.displayName,
            avatar: data.author.avatar || null,
            followers: data.author.followers || 0,
            following: data.author.following || 0,
            likes: data.author.likes || 0,
            isVerified: data.author.verified || false,
            updatedAt: new Date(),
          },
        });
        results.creators.updated++;

        // Upsert video
        await prisma.video.upsert({
          where: { id: data.id },
          create: {
            id: data.id,
            tiktokId: data.id,
            url: data.videoUrl || null,
            thumbnail: data.thumbnail || null,
            views: BigInt(data.views || 0),
            likes: BigInt(data.likes || 0),
            comments: BigInt(data.comments || 0),
            shares: BigInt(data.shares || 0),
            publishedAt: data.createdAt,
            trendId: "default",
          },
          update: {
            views: BigInt(data.views || 0),
            likes: BigInt(data.likes || 0),
            comments: BigInt(data.comments || 0),
            shares: BigInt(data.shares || 0),
          },
        });
        results.videos.updated++;

        // Upsert hashtags
        for (const tagName of data.hashtags) {
          await prisma.hashtag.upsert({
            where: {
              name_country: {
                name: tagName.toLowerCase(),
                country,
              },
            },
            create: {
              name: tagName.toLowerCase(),
              country,
              videos: 1,
              scrapedAt: new Date(),
            },
            update: {
              videos: { increment: 1 },
              scrapedAt: new Date(),
            },
          });

          // Simple tracking - assume most are updates after first run
          results.hashtags.updated++;
        }

      } catch (error) {
        results.errors.push(String(error));
      }
    }

    // Log the sync
    await prisma.scrapeLog.create({
      data: {
        type: "daily_apify_sync",
        status: "success",
        count: items.length,
        metadata: {
          country,
          results,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Daily sync completed for ${country}`,
      data: results,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Daily sync error:", error);

    // Log the error
    await prisma.scrapeLog.create({
      data: {
        type: "daily_apify_sync",
        status: "error",
        count: 0,
        error: String(error),
        metadata: { country },
      },
    });

    return NextResponse.json(
      {
        error: "Sync failed",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
