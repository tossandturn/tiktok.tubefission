import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN || "";
const APIFY_BASE_URL = "https://api.apify.com/v2";
const TIKTOK_SCRAPER_ACTOR = process.env.APIFY_TIKTOK_SCRAPER_ACTOR || "curious_coder/tiktok-scraper";

/**
 * Parse TikTok URL to extract video ID and username
 */
function parseTikTokUrl(url: string): { videoId?: string; username?: string; fullUsername?: string } | null {
  try {
    const urlObj = new URL(url);

    // Format: https://www.tiktok.com/@username/video/1234567890
    const pathMatch = urlObj.pathname.match(/\/@[^/]+\/video\/(\d+)/);
    if (pathMatch) {
      const fullUsername = urlObj.pathname.match(/\/(@[^/]+)\/video\//)?.[1] || "";
      const username = fullUsername.replace("@", "");
      return { videoId: pathMatch[1], username, fullUsername };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch TikTok video data via Apify
 */
async function fetchViaApify(url: string): Promise<{
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}> {
  if (!APIFY_API_TOKEN) {
    return { success: false, error: "APIFY_API_TOKEN not configured" };
  }

  try {
    // Start a scraper run with the video URL
    const runResponse = await fetch(
      `${APIFY_BASE_URL}/acts/${TIKTOK_SCRAPER_ACTOR}/runs`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${APIFY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: {
            urls: [url],
            shouldDownloadCovers: false,
            shouldDownloadVideos: false,
          },
        }),
      }
    );

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      return { success: false, error: `Apify API error: ${runResponse.status} - ${errorText}` };
    }

    const runData = await runResponse.json();
    const runId = runData.data.id;

    // Poll for completion (max 2 minutes)
    const startTime = Date.now();
    const maxWaitMs = 2 * 60 * 1000;

    while (Date.now() - startTime < maxWaitMs) {
      const statusResponse = await fetch(
        `${APIFY_BASE_URL}/acts/${TIKTOK_SCRAPER_ACTOR}/runs/${runId}`,
        {
          headers: { "Authorization": `Bearer ${APIFY_API_TOKEN}` },
        }
      );

      const statusData = await statusResponse.json();
      const status = statusData.data.status;

      if (status === "SUCCEEDED") {
        // Get dataset items
        const datasetResponse = await fetch(
          `${APIFY_BASE_URL}/acts/${TIKTOK_SCRAPER_ACTOR}/runs/${runId}/dataset/items?limit=1`,
          {
            headers: { "Authorization": `Bearer ${APIFY_API_TOKEN}` },
          }
        );

        const datasetItems = await datasetResponse.json();

        if (datasetItems && datasetItems.length > 0) {
          return { success: true, data: datasetItems[0] };
        }

        return { success: false, error: "No data returned from Apify" };
      }

      if (status === "FAILED") {
        return { success: false, error: `Apify run failed: ${statusData.data.errorMessage}` };
      }

      // Wait 3 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    return { success: false, error: "Apify run timed out" };
  } catch (error) {
    console.error("Apify fetch error:", error);
    return { success: false, error: String(error) };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    const parsed = parseTikTokUrl(url);
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid TikTok URL format. Use: https://www.tiktok.com/@username/video/1234567890" },
        { status: 400 }
      );
    }

    // Check if video already exists in database
    const existingVideos = await prisma.$queryRaw`
      SELECT id, "tiktokId", url, thumbnail, views, likes, comments, shares, "publishedAt", "trendId"
      FROM "Video"
      WHERE url LIKE ${`%${url}%`}
      OR "tiktokId" = ${parsed.videoId || ""}
      LIMIT 1
    `;

    const existingVideo = Array.isArray(existingVideos) && existingVideos.length > 0
      ? existingVideos[0]
      : null;

    if (existingVideo) {
      return NextResponse.json({
        success: true,
        video: existingVideo,
        cached: true,
      });
    }

    // Fetch video data via Apify
    if (parsed.username && parsed.videoId) {
      try {
        console.log("Fetching video data via Apify...");
        const apifyResult = await fetchViaApify(url);

        if (!apifyResult.success || !apifyResult.data) {
          return NextResponse.json({
            success: false,
            error: apifyResult.error || "Failed to fetch video data from TikTok.",
          }, { status: 500 });
        }

        const videoData = apifyResult.data;

        // Extract data from Apify response
        const id = String(videoData.id || parsed.videoId);
        const description = String(videoData.desc || videoData.text || "");
        const title = String(videoData.desc || "").split('\n')[0] || "TikTok Video";
        const thumbnail = String((videoData as Record<string, unknown>).video && typeof (videoData as Record<string, unknown>).video === 'object' ? ((videoData as Record<string, unknown>).video as Record<string, unknown>).cover : "" || "");
        const stats = (videoData.stats || {}) as Record<string, number>;
        const view_count = stats.playCount || 0;
        const like_count = stats.diggCount || 0;
        const comment_count = stats.commentCount || 0;
        const repost_count = stats.shareCount || 0;
        const author = (videoData.author || {}) as Record<string, unknown>;
        const uploader = String(author.nickname || parsed.username || "");
        const uploader_id = String(author.id || "");
        const createTime = String(videoData.createTime || "");

        // Get or create the creator
        const creator = await prisma.creator.upsert({
          where: { username: parsed.username },
          create: {
            id: `creator_${parsed.videoId}`,
            tiktokId: uploader_id,
            username: parsed.username,
            displayName: uploader || parsed.username,
            avatar: thumbnail,
            followers: Number(author.followerCount || 0),
            following: Number(author.followingCount || 0),
            likes: Number(author.heartCount || 0),
            isVerified: Boolean(author.verified),
            updatedAt: new Date(),
          },
          update: {
            displayName: uploader || parsed.username,
            avatar: thumbnail,
            followers: Number(author.followerCount || 0),
            following: Number(author.followingCount || 0),
            likes: Number(author.heartCount || 0),
            isVerified: Boolean(author.verified),
            updatedAt: new Date(),
          },
        });

        // Get or create the "analyzed" trend
        const trend = await prisma.trend.upsert({
          where: { id: "analyzed" },
          create: {
            id: "analyzed",
            slug: "analyzed",
            title: "Analyzed Videos",
            description: "Videos analyzed via URL",
            thumbnail: thumbnail || "",
            category: "analysis",
            country: "US",
            views: "0",
            creators: 0,
            avgViews: "0",
            publishedAt: new Date(),
          },
          update: {},
        });

        // Create the video entry with real data
        const videoId = `video_${parsed.videoId}`;
        const views = String(view_count || 0);
        const likes = String(like_count || 0);
        const comments = String(comment_count || 0);
        const shares = String(repost_count || 0);

        // Parse upload date
        let publishedAt = new Date();
        if (createTime) {
          try {
            if (typeof createTime === 'string' && /^\d+$/.test(createTime)) {
              publishedAt = new Date(parseInt(createTime) * 1000);
            }
          } catch {
            // Use current date if parsing fails
          }
        }

        await prisma.$executeRaw`
          INSERT INTO "Video" (
            id, "tiktokId", url, thumbnail, views, likes, comments, shares,
            "publishedAt", "scrapedAt", "trendId"
          ) VALUES (
            ${videoId},
            ${parsed.videoId},
            ${url},
            ${thumbnail || ""},
            ${views},
            ${likes},
            ${comments},
            ${shares},
            ${publishedAt},
            ${new Date()},
            ${trend.id}
          )
          ON CONFLICT (id) DO UPDATE SET
            views = ${views},
            likes = ${likes},
            comments = ${comments},
            shares = ${shares},
            thumbnail = ${thumbnail || ""},
            "scrapedAt" = ${new Date()}
        `;

        // Fetch the created video
        const newVideos = await prisma.$queryRaw`
          SELECT id, "tiktokId", url, thumbnail, views, likes, comments, shares, "publishedAt", "trendId"
          FROM "Video"
          WHERE id = ${videoId}
        `;
        const video = Array.isArray(newVideos) && newVideos.length > 0 ? newVideos[0] : null;

        return NextResponse.json({
          success: true,
          video: video,
          creator: creator,
          cached: false,
          source: "apify",
          title: title,
          description: description,
        });

      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        return NextResponse.json({
          success: false,
          error: "Failed to fetch video data from TikTok. Please try again later.",
          details: String(fetchError),
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: false,
      error: "Invalid URL format. Please use the full TikTok URL.",
    }, { status: 400 });

  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: "Failed to analyze video", details: String(error) },
      { status: 500 }
    );
  }
}
