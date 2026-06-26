import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const OPENCLAW_PROXY_URL = process.env.OPENCLAW_PROXY_URL || "http://localhost:3001";

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

    // Short URL format
    if (urlObj.hostname.includes("vm.tiktok.com") || urlObj.pathname.startsWith("/t/")) {
      return { videoId: undefined, username: undefined, fullUsername: undefined };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch TikTok video data via Openclaw proxy
 */
async function fetchViaProxy(url: string): Promise<{
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${OPENCLAW_PROXY_URL}/api/tiktok/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { success: false, error: "Proxy returned error" };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Proxy fetch error:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Fetch TikTok video data using yt-dlp (fallback)
 */
async function fetchTikTokData(url: string): Promise<{
  id?: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  repost_count?: number;
  uploader?: string;
  uploader_id?: string;
  uploader_url?: string;
  upload_date?: string;
}> {
  try {
    // Use yt-dlp to extract video info
    // --dump-json outputs all metadata as JSON
    // --no-download skips downloading the video
    const { stdout } = await execAsync(
      `yt-dlp --dump-json --no-download "${url}" 2>/dev/null || echo "{}"`,
      { timeout: 30000 }
    );

    const data = JSON.parse(stdout);

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      thumbnail: data.thumbnail,
      duration: data.duration,
      view_count: data.view_count,
      like_count: data.like_count,
      comment_count: data.comment_count,
      repost_count: data.repost_count,
      uploader: data.uploader,
      uploader_id: data.uploader_id,
      uploader_url: data.uploader_url,
      upload_date: data.upload_date,
    };
  } catch (error) {
    console.error("yt-dlp error:", error);
    return {};
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

    // If URL has username, fetch real data
    if (parsed.username && parsed.videoId) {
      try {
        let videoData: Record<string, unknown>;
        let source = "proxy";

        // Try Openclaw proxy first
        console.log("Trying Openclaw proxy...");
        const proxyResult = await fetchViaProxy(url);

        if (proxyResult.success && proxyResult.data) {
          console.log("Proxy success, using proxy data");
          videoData = proxyResult.data;
        } else {
          // Fallback to direct yt-dlp
          console.log("Proxy failed, falling back to yt-dlp:", proxyResult.error);
          const ytData = await fetchTikTokData(url);

          // Check if yt-dlp returned valid data
          if (!ytData.id) {
            return NextResponse.json({
              success: false,
              error: "Unable to fetch video data. The video may be private, unavailable, or yt-dlp is not installed.",
            }, { status: 404 });
          }

          // Convert yt-dlp format to unified format
          videoData = {
            id: ytData.id,
            title: ytData.title,
            description: ytData.description,
            thumbnail: ytData.thumbnail,
            view_count: ytData.view_count,
            like_count: ytData.like_count,
            comment_count: ytData.comment_count,
            repost_count: ytData.repost_count,
            uploader: ytData.uploader,
            uploader_id: ytData.uploader_id,
            upload_date: ytData.upload_date,
          };
          source = "yt-dlp";
        }

        // Handle unified video data format
        const id = videoData.id || videoData.videoId || parsed.videoId;
        const description = String(videoData.description || "");
        const title = String(videoData.title || description?.split('\n')[0] || "TikTok Video");
        const thumbnail = String(videoData.thumbnail || videoData.coverUrl || "");
        const view_count = Number(videoData.view_count || videoData.views || videoData.playCount || 0);
        const like_count = Number(videoData.like_count || videoData.likes || videoData.diggCount || 0);
        const comment_count = Number(videoData.comment_count || videoData.comments || videoData.commentCount || 0);
        const repost_count = Number(videoData.repost_count || videoData.shares || videoData.shareCount || 0);
        const uploader = String(videoData.uploader || (videoData.author as Record<string, unknown>)?.nickname || parsed.username || "");
        const uploader_id = String(videoData.uploader_id || (videoData.author as Record<string, unknown>)?.id || "");
        const upload_date = String(videoData.upload_date || videoData.createTime || "");

        if (!id) {
          return NextResponse.json({
            success: false,
            error: "Unable to fetch video data. The video may be private, unavailable, or the proxy/yt-dlp is not accessible.",
          }, { status: 404 });
        }

        // Get or create the creator
        const creator = await prisma.creator.upsert({
          where: { username: parsed.username },
          create: {
            id: `creator_${parsed.videoId}`,
            tiktokId: uploader_id,
            username: parsed.username,
            displayName: uploader || parsed.username,
            avatar: thumbnail,
            followers: 0,
            following: 0,
            likes: 0,
            isVerified: false,
            updatedAt: new Date(),
          },
          update: {
            displayName: uploader || parsed.username,
            avatar: thumbnail,
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

        // Parse upload date if available
        let publishedAt = new Date();
        if (upload_date) {
          try {
            if (typeof upload_date === 'number') {
              // Unix timestamp in seconds
              publishedAt = new Date(upload_date * 1000);
            } else if (upload_date.length === 8) {
              // Format: YYYYMMDD
              const year = parseInt(upload_date.substring(0, 4));
              const month = parseInt(upload_date.substring(4, 6)) - 1;
              const day = parseInt(upload_date.substring(6, 8));
              publishedAt = new Date(year, month, day);
            } else if (upload_date.includes('T')) {
              // ISO format
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
          source: source,
          title: title,
          description: description,
        });

      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        return NextResponse.json({
          success: false,
          error: "Failed to fetch video data from TikTok. Please ensure the proxy is running or yt-dlp is installed, and the video is public.",
          details: String(fetchError),
        }, { status: 500 });
      }
    }

    // For short URLs, we can't extract info yet
    return NextResponse.json({
      success: false,
      error: "Short TikTok URLs are not supported yet. Please use the full URL format: https://www.tiktok.com/@username/video/1234567890",
    }, { status: 400 });

  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: "Failed to analyze video", details: String(error) },
      { status: 500 }
    );
  }
}
