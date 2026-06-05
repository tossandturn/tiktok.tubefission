import { NextRequest, NextResponse } from "next/server";
import {
  startScraperRun,
  waitForRunCompletion,
  getDatasetItems,
  transformVideoData,
  getAccountUsage,
} from "@/lib/apify";
import { prisma } from "@/lib/prisma";

const CRON_SECRET_KEY = process.env.CRON_SECRET_KEY || "";

export const dynamic = "force-dynamic";

/**
 * Apify TikTok Scraper Sync
 * Fetches trending content and syncs to database
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (key !== CRON_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const country = searchParams.get("country") || "US";
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const mode = searchParams.get("mode") || "hashtags"; // hashtags, profiles, search

  try {
    // Check Apify account usage
    const usage = await getAccountUsage();
    if (usage.percentage > 90) {
      return NextResponse.json({
        error: "Apify quota almost exhausted",
        usage,
      }, { status: 429 });
    }

    let runId: string;
    let scraperConfig: { hashtags?: string[]; profiles?: string[]; searchQueries?: string[] };

    // Define scrape targets by country
    const countryTargets: Record<string, { hashtags: string[]; profiles: string[] }> = {
      US: {
        hashtags: ["fyp", "viral", "trending", "foryou", "usa", "funny", "dance"],
        profiles: ["charlidamelio", "khaby.lame", "bellapoarch"],
      },
      JP: {
        hashtags: ["fyp", "trending", "japan", "tiktokjapan", "dance", "kawaii"],
        profiles: ["hikakin", "seikin"],
      },
      KR: {
        hashtags: ["fyp", "korea", "kpop", "trending", "dance"],
        profiles: [],
      },
      GB: {
        hashtags: ["fyp", "uk", "trending", "british", "viral"],
        profiles: [],
      },
      HK: {
        hashtags: ["fyp", "hongkong", "hk", "trending"],
        profiles: [],
      },
      TW: {
        hashtags: ["fyp", "taiwan", "tw", "trending"],
        profiles: [],
      },
    };

    const targets = countryTargets[country] || countryTargets["US"];

    switch (mode) {
      case "hashtags":
        scraperConfig = { hashtags: targets.hashtags };
        break;
      case "profiles":
        scraperConfig = { profiles: targets.profiles };
        break;
      case "search":
        scraperConfig = { searchQueries: [`${country} trending`] };
        break;
      default:
        scraperConfig = { hashtags: targets.hashtags };
    }

    // Start scraper run
    const run = await startScraperRun({
      ...scraperConfig,
      maxResults: limit,
      maxResultsPerQuery: Math.min(20, Math.floor(limit / (scraperConfig.hashtags?.length || 1))),
      shouldDownloadVideos: false,
      shouldDownloadCovers: false,
      proxy: "residential",
    });

    runId = run.runId;

    // Wait for completion (max 5 minutes)
    await waitForRunCompletion(runId, 5);

    // Get results
    const items = await getDatasetItems(runId, limit);

    // Transform and save to database
    const results = {
      videos: 0,
      creators: 0,
      hashtags: 0,
      errors: [] as string[],
    };

    for (const item of items) {
      try {
        const data = transformVideoData(item);

        if (!data.author) continue;

        // Save creator
        const creator = await prisma.creator.upsert({
          where: { username: data.author.username },
          create: {
            id: data.author.id || `creator_${Date.now()}`,
            username: data.author.username,
            displayName: data.author.displayName,
            avatar: data.author.avatar,
            followers: data.author.followers,
            following: data.author.following,
            likes: data.author.likes,
            isVerified: data.author.verified,
            country,
            updatedAt: new Date(),
          },
          update: {
            followers: data.author.followers,
            following: data.author.following,
            likes: data.author.likes,
            updatedAt: new Date(),
          },
        });
        results.creators++;

        // Save video
        await prisma.video.upsert({
          where: { id: data.id },
          create: {
            id: data.id,
            title: data.title,
            description: data.description,
            thumbnail: data.thumbnail,
            videoUrl: data.videoUrl,
            views: data.views,
            likes: data.likes,
            comments: data.comments,
            shares: data.shares,
            createdAt: data.createdAt,
            creatorId: creator.id,
            country,
          },
          update: {
            views: data.views,
            likes: data.likes,
            comments: data.comments,
            shares: data.shares,
          },
        });
        results.videos++;

        // Save hashtags
        for (const tagName of data.hashtags) {
          await prisma.hashtag.upsert({
            where: {
              name_country: {
                name: tagName,
                country,
              },
            },
            create: {
              name: tagName,
              country,
              videos: 1,
              scrapedAt: new Date(),
            },
            update: {
              videos: { increment: 1 },
              scrapedAt: new Date(),
            },
          });
          results.hashtags++;
        }

      } catch (error) {
        results.errors.push(String(error));
      }
    }

    // Log sync
    await prisma.scrapeLog.create({
      data: {
        type: "apify_sync",
        status: "success",
        count: results.videos,
        metadata: {
          country,
          mode,
          runId,
          videos: results.videos,
          creators: results.creators,
          hashtags: results.hashtags,
          errors: results.errors.length,
          apifyUsage: usage.percentage,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Synced ${results.videos} videos, ${results.creators} creators`,
      data: {
        country,
        mode,
        runId,
        ...results,
        apifyUsage: usage,
      },
    });

  } catch (error) {
    console.error("Apify sync error:", error);

    await prisma.scrapeLog.create({
      data: {
        type: "apify_sync",
        status: "error",
        count: 0,
        error: String(error),
        metadata: { country, mode },
      },
    });

    return NextResponse.json({
      error: "Sync failed",
      details: String(error),
    }, { status: 500 });
  }
}
