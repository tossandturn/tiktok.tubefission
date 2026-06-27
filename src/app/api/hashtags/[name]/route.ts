import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { startScraperRun, waitForRunCompletion, getDatasetItems } from "@/lib/apify";

export const dynamic = "force-dynamic";

/**
 * Fetch hashtag data from Apify and save to database
 * This ensures we never return 404 for a hashtag page
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const decodedName = decodeURIComponent(name).toLowerCase().replace(/^#/, "");

    // Check if hashtag exists in database
    const existingHashtag = await prisma.hashtag.findFirst({
      where: { name: decodedName },
    });

    // If hashtag exists and was updated recently (within 24 hours), return from database
    if (existingHashtag && existingHashtag.scrapedAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      return NextResponse.json({
        success: true,
        source: "database",
        hashtag: existingHashtag,
      });
    }

    // If no Apify token, return existing hashtag or error
    const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
    if (!APIFY_API_TOKEN) {
      if (existingHashtag) {
        return NextResponse.json({
          success: true,
          source: "database",
          hashtag: existingHashtag,
        });
      }
      return NextResponse.json(
        { error: "Hashtag not found and Apify API not configured" },
        { status: 404 }
      );
    }

    // Fetch from Apify
    try {
      const run = await startScraperRun({
        hashtags: [decodedName],
        maxResults: 50,
        maxResultsPerQuery: 50,
        shouldDownloadVideos: false,
        shouldDownloadCovers: false,
      });

      await waitForRunCompletion(run.runId, 3);
      const items = await getDatasetItems(run.runId, 50);

      if (!items || items.length === 0) {
        if (existingHashtag) {
          return NextResponse.json({
            success: true,
            source: "database",
            hashtag: existingHashtag,
          });
        }
        return NextResponse.json(
          { error: "Hashtag not found on TikTok" },
          { status: 404 }
        );
      }

      // Calculate hashtag stats from videos
      let totalViews = 0;
      let totalLikes = 0;
      let totalComments = 0;
      let totalShares = 0;

      for (const item of items) {
        const stats = item.stats || {};
        totalViews += stats.playCount || 0;
        totalLikes += stats.diggCount || 0;
        totalComments += stats.commentCount || 0;
        totalShares += stats.shareCount || 0;
      }

      // Upsert hashtag
      const hashtag = await prisma.hashtag.upsert({
        where: {
          name_country: {
            name: decodedName,
            country: "US",
          },
        },
        create: {
          name: decodedName,
          country: "US",
          views: totalViews >= 1000000
            ? (totalViews / 1000000).toFixed(1) + "M"
            : totalViews >= 1000
            ? (totalViews / 1000).toFixed(1) + "K"
            : String(totalViews),
          videos: items.length,
          growthRate: 15, // Default growth rate
          scrapedAt: new Date(),
        },
        update: {
          views: totalViews >= 1000000
            ? (totalViews / 1000000).toFixed(1) + "M"
            : totalViews >= 1000
            ? (totalViews / 1000).toFixed(1) + "K"
            : String(totalViews),
          videos: items.length,
          scrapedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        source: "apify",
        hashtag,
        stats: {
          totalViews,
          totalLikes,
          totalComments,
          totalShares,
          videoCount: items.length,
        },
      });

    } catch (apifyError) {
      console.error("Apify error:", apifyError);
      // Fall back to database if available
      if (existingHashtag) {
        return NextResponse.json({
          success: true,
          source: "database",
          hashtag: existingHashtag,
        });
      }
      throw apifyError;
    }

  } catch (error) {
    console.error("Error fetching hashtag:", error);
    return NextResponse.json(
      { error: "Failed to fetch hashtag", details: String(error) },
      { status: 500 }
    );
  }
}
