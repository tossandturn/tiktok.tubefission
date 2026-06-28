import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { startScraperRun, waitForRunCompletion, getDatasetItems, transformVideoData } from "@/lib/apify";

export const dynamic = "force-dynamic";

/**
 * Fetch creator data from Apify and save to database
 * This ensures we never return 404 for a creator page
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    // Check if creator exists in database
    const existingCreator = await prisma.creator.findUnique({
      where: { username },
    });

    // Videos will be empty for now (can be populated separately)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingVideos: any[] = [];

    // If creator exists and was updated recently (within 24 hours), return from database
    if (existingCreator && existingCreator.updatedAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      return NextResponse.json({
        success: true,
        source: "database",
        creator: { ...existingCreator, videos: existingVideos },
      });
    }

    // If no Apify token, return existing creator or error
    const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
    if (!APIFY_API_TOKEN) {
      if (existingCreator) {
        return NextResponse.json({
          success: true,
          source: "database",
          creator: { ...existingCreator, videos: existingVideos },
        });
      }
      return NextResponse.json(
        { error: "Creator not found and Apify API not configured" },
        { status: 404 }
      );
    }

    // Fetch from Apify
    try {
      const run = await startScraperRun({
        profiles: [username],
        maxResults: 10,
        maxResultsPerQuery: 10,
        shouldDownloadVideos: false,
        shouldDownloadCovers: false,
      });

      await waitForRunCompletion(run.runId, 2);
      const items = await getDatasetItems(run.runId, 10);

      if (!items || items.length === 0) {
        if (existingCreator) {
          return NextResponse.json({
            success: true,
            source: "database",
            creator: { ...existingCreator, videos: existingVideos },
          });
        }
        return NextResponse.json(
          { error: "Creator not found on TikTok" },
          { status: 404 }
        );
      }

      // Transform and save data
      const transformed = items.map(transformVideoData);
      const firstItem = transformed[0];

      if (!firstItem.author) {
        if (existingCreator) {
          return NextResponse.json({
            success: true,
            source: "database",
            creator: { ...existingCreator, videos: existingVideos },
          });
        }
        return NextResponse.json(
          { error: "Creator data not available" },
          { status: 404 }
        );
      }

      // Upsert creator
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const creator = await prisma.creator.upsert({
        where: { username },
        create: {
          id: firstItem.author.id || `creator_${Date.now()}`,
          username: username,
          displayName: firstItem.author.displayName || username,
          avatar: firstItem.author.avatar || null,
          followers: firstItem.author.followers || 0,
          following: firstItem.author.following || 0,
          likes: firstItem.author.likes || 0,
          isVerified: firstItem.author.verified || false,
          tiktokId: firstItem.author.id || null,
          country: "US",
          updatedAt: new Date(),
        },
        update: {
          displayName: firstItem.author.displayName || username,
          avatar: firstItem.author.avatar || null,
          followers: firstItem.author.followers || 0,
          following: firstItem.author.following || 0,
          likes: firstItem.author.likes || 0,
          isVerified: firstItem.author.verified || false,
          updatedAt: new Date(),
        },
      });

      // Save videos
      for (const video of transformed) {
        if (!video.id) continue;

        await prisma.video.upsert({
          where: { id: video.id },
          create: {
            id: video.id,
            tiktokId: video.id,
            url: video.videoUrl || null,
            thumbnail: video.thumbnail || null,
            views: BigInt(video.views || 0),
            likes: BigInt(video.likes || 0),
            comments: BigInt(video.comments || 0),
            shares: BigInt(video.shares || 0),
            publishedAt: video.createdAt,
            trendId: "default",
          },
          update: {
            views: BigInt(video.views || 0),
            likes: BigInt(video.likes || 0),
            comments: BigInt(video.comments || 0),
            shares: BigInt(video.shares || 0),
          },
        });
      }

      // Return with videos
      const creatorWithVideos = await prisma.creator.findUnique({
        where: { username },
      });

      return NextResponse.json({
        success: true,
        source: "apify",
        creator: { ...creatorWithVideos, videos: [] },
      });

    } catch (apifyError) {
      console.error("Apify error:", apifyError);
      // Fall back to database if available
      if (existingCreator) {
        return NextResponse.json({
          success: true,
          source: "database",
          creator: { ...existingCreator, videos: existingVideos },
        });
      }
      throw apifyError;
    }

  } catch (error) {
    console.error("Error fetching creator:", error);
    return NextResponse.json(
      { error: "Failed to fetch creator", details: String(error) },
      { status: 500 }
    );
  }
}
