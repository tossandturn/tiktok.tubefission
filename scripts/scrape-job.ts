import { prisma } from "../src/lib/db";
import { scrapeDiscover, scrapeHashtag, scrapeHashtagVideos, closeBrowser } from "../src/lib/scraper";

async function logScrape(type: string, status: string, count: number, error?: string, metadata?: Record<string, unknown>) {
  await prisma.scrapeLog.create({
    data: { type, status, count, error: error ?? undefined, metadata: metadata as unknown as undefined },
  });
}

async function runDiscoverScrape() {
  console.log("[SCRAPE] Starting discover scrape...");
  const startedAt = new Date();

  try {
    const hashtags = await scrapeDiscover(30);

    for (const h of hashtags) {
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
    }

    await logScrape("discover", "success", hashtags.length);
    console.log(`[SCRAPE] Discover done: ${hashtags.length} hashtags`);
  } catch (error) {
    await logScrape("discover", "error", 0, String(error));
    console.error("[SCRAPE] Discover failed:", error);
  }
}

async function runHashtagDeepDive(hashtagNames: string[]) {
  console.log("[SCRAPE] Starting hashtag deep dive...");

  for (const name of hashtagNames.slice(0, 5)) {
    try {
      const trend = await scrapeHashtag(name);
      if (!trend) continue;

      const videos = await scrapeHashtagVideos(name, 10);

      const slug = trend.hashtag.replace("#", "").toLowerCase().replace(/[^a-z0-9]+/g, "-");

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
          views: trend.views,
          growthRate: trend.growthRate ?? 0,
          creators: parseInt(trend.videoCount.replace(/[^0-9]/g, "")) || 0,
        },
      });

      const trendRecord = await prisma.trend.findUnique({ where: { slug } });
      if (trendRecord) {
        for (const v of videos) {
          await prisma.video.upsert({
            where: { tiktokId: v.id },
            update: { views: v.views, scrapedAt: new Date() },
            create: {
              trendId: trendRecord.id,
              tiktokId: v.id,
              url: v.url,
              views: v.views,
              likes: v.likes,
            },
          });
        }
      }

      await logScrape("hashtag", "success", videos.length, undefined, { hashtag: name });
      console.log(`[SCRAPE] ${name}: ${videos.length} videos`);
    } catch (error) {
      await logScrape("hashtag", "error", 0, String(error), { hashtag: name });
      console.error(`[SCRAPE] ${name} failed:`, error);
    }
  }
}

async function main() {
  const mode = process.argv[2] ?? "all";

  try {
    if (mode === "discover" || mode === "all") {
      await runDiscoverScrape();
    }

    if (mode === "hashtags" || mode === "all") {
      const hashtags = await prisma.hashtag.findMany({
        where: { isRising: true },
        orderBy: { growthRate: "desc" },
        take: 5,
      });
      await runHashtagDeepDive(hashtags.map((h: { name: string }) => h.name));
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
