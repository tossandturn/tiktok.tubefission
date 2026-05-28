import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scrapeDiscover, scrapeHashtag, closeBrowser } from "@/lib/scraper";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes max execution time

async function logScrape(type: string, status: string, count: number, error?: string, metadata?: Record<string, unknown>) {
  try {
    await prisma.scrapeLog.create({
      data: { type, status, count, error: error ?? undefined, metadata: metadata as unknown as undefined },
    });
  } catch (e) {
    console.error("Failed to log scrape:", e);
  }
}

async function runDiscoverScrape() {
  console.log("[CRON] Starting discover scrape...");

  try {
    // Limit to 15 hashtags per run to avoid rate limits
    const hashtags = await scrapeDiscover(15);

    for (const h of hashtags) {
      try {
        await prisma.hashtag.upsert({
          where: { name: h.name },
          update: {
            views: h.views,
            videos: parseInt(h.videoCount.replace(/[^0-9]/g, "")) || 0,
            isRising: h.isRising,
            scrapedAt: new Date(),
          },
          create: {
            name: h.name,
            views: h.views,
            videos: parseInt(h.videoCount.replace(/[^0-9]/g, "")) || 0,
            isRising: h.isRising,
          },
        });
      } catch (e) {
        console.error(`Failed to upsert hashtag ${h.name}:`, e);
      }
    }

    await logScrape("discover", "success", hashtags.length);
    console.log(`[CRON] Discover done: ${hashtags.length} hashtags`);
    return { success: true, count: hashtags.length };
  } catch (error) {
    await logScrape("discover", "error", 0, String(error));
    console.error("[CRON] Discover failed:", error);
    return { success: false, error: String(error) };
  }
}

async function runTopHashtagsUpdate() {
  console.log("[CRON] Starting top hashtags update...");

  try {
    // Get top 3 hashtags to update (spaced out to avoid rate limits)
    const hashtags = await prisma.hashtag.findMany({
      orderBy: [{ isRising: "desc" }, { videos: "desc" }],
      take: 3,
    });

    for (const hashtag of hashtags) {
      try {
        const trend = await scrapeHashtag(hashtag.name);
        if (!trend) continue;

        // Calculate growth rate (mock calculation - in real scenario compare with previous data)
        const viewsNum = parseInt(trend.views.replace(/[^0-9]/g, "")) || 0;
        const oldViewsNum = parseInt(hashtag.views.replace(/[^0-9]/g, "")) || 0;
        const growthRate = oldViewsNum > 0 ? ((viewsNum - oldViewsNum) / oldViewsNum) * 100 : 0;

        await prisma.hashtag.update({
          where: { name: hashtag.name },
          data: {
            views: trend.views,
            videos: parseInt(trend.videoCount.replace(/[^0-9]/g, "")) || 0,
            growthRate: growthRate,
            scrapedAt: new Date(),
          },
        });

        console.log(`[CRON] Updated ${hashtag.name}: ${trend.views} views`);

        // Wait 10-15 seconds between hashtags
        await new Promise(resolve => setTimeout(resolve, 10000 + Math.random() * 5000));
      } catch (e) {
        console.error(`Failed to update hashtag ${hashtag.name}:`, e);
      }
    }

    await logScrape("hashtag_update", "success", hashtags.length);
    return { success: true, count: hashtags.length };
  } catch (error) {
    await logScrape("hashtag_update", "error", 0, String(error));
    console.error("[CRON] Hashtag update failed:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * CRON endpoint for scheduled scraping
 * Call this with a secret key to authenticate
 *
 * Usage:
 * GET /api/cron/scrape?key=YOUR_SECRET_KEY&mode=discover
 * GET /api/cron/scrape?key=YOUR_SECRET_KEY&mode=update
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const mode = searchParams.get("mode") ?? "discover";

  // Simple authentication with secret key
  const secretKey = process.env.CRON_SECRET_KEY;
  if (!secretKey || key !== secretKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let result;

    if (mode === "discover") {
      result = await runDiscoverScrape();
    } else if (mode === "update") {
      result = await runTopHashtagsUpdate();
    } else if (mode === "full") {
      // Run both but with long delays
      const discoverResult = await runDiscoverScrape();
      // Wait 30 seconds between operations
      await new Promise(resolve => setTimeout(resolve, 30000));
      const updateResult = await runTopHashtagsUpdate();
      result = { discover: discoverResult, update: updateResult };
    } else {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    await closeBrowser();

    return NextResponse.json({
      success: true,
      mode,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    await closeBrowser();
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
