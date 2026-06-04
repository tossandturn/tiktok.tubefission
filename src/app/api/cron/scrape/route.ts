import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scrapeHashtagList, scrapeHashtagVideos, batchScrapeHashtags, ALL_HASHTAGS, closeBrowser } from "@/lib/scraper-enhanced";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes max

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
 * 运行批量标签发现 - 处理大量标签
 */
async function runBulkHashtagScrape(limit: number = 100) {
  console.log(`[CRON] Starting bulk hashtag scrape (limit: ${limit})...`);

  try {
    // 使用增强版 scraper，处理100个标签
    const hashtags = await scrapeHashtagList(limit);

    let successCount = 0;
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
        successCount++;
      } catch (e) {
        console.error(`[CRON] Failed to upsert hashtag ${h.name}:`, e);
      }
    }

    await logScrape("bulk_hashtags", "success", hashtags.length, undefined, {
      requested: limit,
      processed: hashtags.length,
      upserted: successCount,
    });

    console.log(`[CRON] Bulk scrape done: ${hashtags.length} hashtags, ${successCount} upserted`);
    return { success: true, count: hashtags.length, upserted: successCount };
  } catch (error) {
    await logScrape("bulk_hashtags", "error", 0, String(error));
    console.error("[CRON] Bulk scrape failed:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * 运行视频批量抓取 - 为目标标签抓取更多视频
 */
async function runVideoScrape(topN: number = 10, videosPerHashtag: number = 50) {
  console.log(`[CRON] Starting video scrape (top ${topN} hashtags, ${videosPerHashtag} videos each)...`);

  try {
    // 获取最热门的标签
    const hashtags = await prisma.hashtag.findMany({
      orderBy: [{ isRising: "desc" }, { videos: "desc" }],
      take: topN,
    });

    const hashtagNames = hashtags.map(h => h.name);
    const results = await batchScrapeHashtags(hashtagNames, videosPerHashtag);

    let totalVideos = 0;
    const resultsArray = Array.from(results.entries());
    for (const [hashtag, videos] of resultsArray) {
      // 查找或创建对应的 Trend
      const trend = await prisma.trend.findFirst({
        where: { title: { contains: hashtag, mode: 'insensitive' } }
      });

      if (!trend) continue;

      for (const video of videos) {
        try {
          await prisma.video.upsert({
            where: { id: video.id },
            update: {
              views: video.views,
              tiktokId: video.id,
              scrapedAt: new Date(),
            },
            create: {
              id: video.id,
              trendId: trend.id,
              tiktokId: video.id,
              url: video.url,
              views: video.views,
            },
          });
          totalVideos++;
        } catch (e) {
          console.error(`[CRON] Failed to upsert video ${video.id}:`, e);
        }
      }
    }

    await logScrape("videos", "success", totalVideos, undefined, {
      hashtags: hashtagNames.length,
      videosPerHashtag,
    });

    console.log(`[CRON] Video scrape done: ${totalVideos} videos from ${hashtagNames.length} hashtags`);
    return { success: true, count: totalVideos, hashtags: hashtagNames.length };
  } catch (error) {
    await logScrape("videos", "error", 0, String(error));
    console.error("[CRON] Video scrape failed:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * CRON endpoint - 支持多种模式
 * ?key=SECRET&mode=bulk - 批量抓取100个标签
 * ?key=SECRET&mode=videos - 抓取前10标签的视频（50个/标签）
 * ?key=SECRET&mode=full - 运行完整流程
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const mode = searchParams.get("mode") ?? "bulk";

  const secretKey = process.env.CRON_SECRET_KEY;
  if (!secretKey || key !== secretKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let result;

    if (mode === "bulk") {
      // 批量抓取100个热门标签
      result = await runBulkHashtagScrape(100);
    } else if (mode === "videos") {
      // 抓取前10个标签的视频（50个/标签）
      result = await runVideoScrape(10, 50);
    } else if (mode === "full") {
      // 完整流程：先批量标签，再抓取视频
      const bulkResult = await runBulkHashtagScrape(50);
      await new Promise(r => setTimeout(r, 30000)); // 30秒间隔
      const videoResult = await runVideoScrape(5, 30);
      result = { bulk: bulkResult, videos: videoResult };
    } else {
      return NextResponse.json({ error: "Invalid mode. Use: bulk, videos, full" }, { status: 400 });
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
