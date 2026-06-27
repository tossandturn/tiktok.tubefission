import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN || "";
const APIFY_BASE_URL = "https://api.apify.com/v2";
// Apify actor IDs use ~ separator, not /
const TIKTOK_SCRAPER_ACTOR = (process.env.APIFY_TIKTOK_SCRAPER_ACTOR || "curious_coder/tiktok-scraper").replace("/", "~");

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
 * Fetch TikTok video data using yt-dlp
 */
async function fetchViaYtDlp(url: string): Promise<{
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}> {
  // Try without proxy first, then with proxy if available
  const proxyUrl = process.env.YT_DLP_PROXY || "";
  const attempts = proxyUrl
    ? [`yt-dlp --dump-json --no-download "${url}" 2>/dev/null`, `yt-dlp --dump-json --no-download --proxy "${proxyUrl}" "${url}" 2>/dev/null`]
    : [`yt-dlp --dump-json --no-download "${url}" 2>/dev/null`];

  for (const cmd of attempts) {
    try {
      const { stdout } = await execAsync(`${cmd} || echo "{}"`, { timeout: 30000 });
      const data = JSON.parse(stdout);

      if (!data.id) continue;

      return {
        success: true,
        data: {
          id: data.id,
          title: data.title,
          description: data.description,
          thumbnail: data.thumbnail,
          view_count: data.view_count,
          like_count: data.like_count,
          comment_count: data.comment_count,
          repost_count: data.repost_count,
          uploader: data.uploader,
          uploader_id: data.uploader_id,
          upload_date: data.upload_date,
        },
      };
    } catch (error) {
      console.error("yt-dlp error:", error);
    }
  }

  return { success: false, error: "yt-dlp failed for all attempts" };
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
          const item = datasetItems[0];
          return {
            success: true,
            data: {
              id: item.id,
              title: item.text || item.desc || "TikTok Video",
              description: item.desc || "",
              thumbnail: item.video?.cover || "",
              view_count: item.stats?.playCount || 0,
              like_count: item.stats?.diggCount || 0,
              comment_count: item.stats?.commentCount || 0,
              repost_count: item.stats?.shareCount || 0,
              uploader: item.author?.nickname || "",
              uploader_id: item.author?.id || "",
              upload_date: item.createTime || "",
              followers: item.author?.followerCount || 0,
              following: item.author?.followingCount || 0,
              likes: item.author?.heartCount || 0,
              verified: item.author?.verified || false,
            },
          };
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

/**
 * Fetch video data using multiple sources (yt-dlp first, then Apify)
 */
async function fetchVideoData(url: string): Promise<{
  success: boolean;
  data?: Record<string, unknown>;
  source?: string;
  error?: string;
}> {
  // Try yt-dlp first (works locally, may fail on Vercel)
  console.log("Trying yt-dlp...");
  const ytResult = await fetchViaYtDlp(url);
  if (ytResult.success && ytResult.data) {
    console.log("yt-dlp success");
    return { success: true, data: ytResult.data, source: "yt-dlp" };
  }
  console.log("yt-dlp failed:", ytResult.error);

  // Fall back to Apify
  console.log("Trying Apify...");
  const apifyResult = await fetchViaApify(url);
  if (apifyResult.success && apifyResult.data) {
    console.log("Apify success");
    return { success: true, data: apifyResult.data, source: "apify" };
  }
  console.log("Apify failed:", apifyResult.error);

  return {
    success: false,
    error: `Both yt-dlp and Apify failed. yt-dlp: ${ytResult.error}. Apify: ${apifyResult.error}`,
  };
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

    // Fetch video data
    if (parsed.username && parsed.videoId) {
      try {
        const result = await fetchVideoData(url);

        if (!result.success || !result.data) {
          return NextResponse.json({
            success: false,
            error: result.error || "Failed to fetch video data from TikTok.",
          }, { status: 500 });
        }

        const videoData = result.data;

        // Extract data
        const description = String(videoData.description || videoData.desc || videoData.text || "");
        const title = String(videoData.title || videoData.desc || videoData.text || "").split('\n')[0] || "TikTok Video";
        const thumbnail = String(videoData.thumbnail || "");
        const view_count = Number(videoData.view_count || videoData.playCount || 0);
        const like_count = Number(videoData.like_count || videoData.diggCount || 0);
        const comment_count = Number(videoData.comment_count || videoData.commentCount || 0);
        const repost_count = Number(videoData.repost_count || videoData.shareCount || 0);
        const uploader = String(videoData.uploader || videoData.nickname || parsed.username || "");
        const uploader_id = String(videoData.uploader_id || videoData.authorId || "");
        const upload_date = String(videoData.upload_date || videoData.createTime || "");
        const followers = Number(videoData.followers || videoData.followerCount || 0);
        const following = Number(videoData.following || videoData.followingCount || 0);
        const likes_count = Number(videoData.likes || videoData.heartCount || 0);
        const verified = Boolean(videoData.verified);

        // Get or create the creator
        const creator = await prisma.creator.upsert({
          where: { username: parsed.username },
          create: {
            id: `creator_${parsed.videoId}`,
            tiktokId: uploader_id,
            username: parsed.username,
            displayName: uploader || parsed.username,
            avatar: thumbnail,
            followers: followers,
            following: following,
            likes: likes_count,
            isVerified: verified,
            updatedAt: new Date(),
          },
          update: {
            displayName: uploader || parsed.username,
            avatar: thumbnail,
            followers: followers,
            following: following,
            likes: likes_count,
            isVerified: verified,
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

        // Create the video entry
        const videoId = `video_${parsed.videoId}`;
        const views = String(view_count || 0);
        const likes = String(like_count || 0);
        const comments = String(comment_count || 0);
        const shares = String(repost_count || 0);

        // Parse upload date
        let publishedAt = new Date();
        if (upload_date) {
          try {
            if (/^\d+$/.test(upload_date)) {
              publishedAt = new Date(parseInt(upload_date) * 1000);
            } else if (upload_date.length === 8) {
              const year = parseInt(upload_date.substring(0, 4));
              const month = parseInt(upload_date.substring(4, 6)) - 1;
              const day = parseInt(upload_date.substring(6, 8));
              publishedAt = new Date(year, month, day);
            } else if (upload_date.includes('T')) {
              publishedAt = new Date(upload_date);
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
          source: result.source,
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
