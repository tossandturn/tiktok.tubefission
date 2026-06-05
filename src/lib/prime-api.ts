/**
 * PrimeApi TikTok Data Service
 * API Documentation: https://primeapi.com/docs
 * Rate Limit: 100 requests/minute
 * Current Balance: 50 requests
 */

const PRIME_API_KEY = process.env.PRIME_API_KEY || "";
const PRIME_API_BASE_URL = process.env.PRIME_API_BASE_URL || "https://api.primeapi.com";

interface PrimeApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface TikTokUserInfo {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  followers: number;
  following: number;
  likes: number;
  verified: boolean;
  bio: string;
}

interface TikTokVideo {
  id: string;
  description: string;
  cover: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
}

interface TikTokHashtag {
  name: string;
  views: string;
  videos: number;
  trending: boolean;
}

/**
 * Check API balance
 */
export async function checkApiBalance(): Promise<{ requests: number; remaining: number }> {
  try {
    const response = await fetch(`${PRIME_API_BASE_URL}/v1/balance`, {
      headers: {
        "Authorization": `Bearer ${PRIME_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      requests: data.requests || 0,
      remaining: data.remaining || 0,
    };
  } catch (error) {
    console.error("Failed to check API balance:", error);
    return { requests: 0, remaining: 0 };
  }
}

/**
 * Get TikTok user info by username
 */
export async function getUserInfo(username: string): Promise<PrimeApiResponse<TikTokUserInfo>> {
  try {
    const response = await fetch(
      `${PRIME_API_BASE_URL}/v1/user/info?username=${encodeURIComponent(username)}`,
      {
        headers: {
          "Authorization": `Bearer ${PRIME_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`Failed to get user info for ${username}:`, error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get TikTok user videos
 */
export async function getUserVideos(
  username: string,
  limit: number = 10
): Promise<PrimeApiResponse<TikTokVideo[]>> {
  try {
    const response = await fetch(
      `${PRIME_API_BASE_URL}/v1/user/videos?username=${encodeURIComponent(username)}&limit=${limit}`,
      {
        headers: {
          "Authorization": `Bearer ${PRIME_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data.videos || [] };
  } catch (error) {
    console.error(`Failed to get user videos for ${username}:`, error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get trending hashtags
 */
export async function getTrendingHashtags(
  country: string = "US",
  limit: number = 20
): Promise<PrimeApiResponse<TikTokHashtag[]>> {
  try {
    const response = await fetch(
      `${PRIME_API_BASE_URL}/v1/hashtags/trending?country=${country}&limit=${limit}`,
      {
        headers: {
          "Authorization": `Bearer ${PRIME_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data.hashtags || [] };
  } catch (error) {
    console.error("Failed to get trending hashtags:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Search TikTok content
 */
export async function searchTikTok(
  query: string,
  type: "user" | "video" | "hashtag" = "video",
  limit: number = 10
): Promise<PrimeApiResponse<unknown[]>> {
  try {
    const response = await fetch(
      `${PRIME_API_BASE_URL}/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`,
      {
        headers: {
          "Authorization": `Bearer ${PRIME_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data.results || [] };
  } catch (error) {
    console.error(`Search failed for ${query}:`, error);
    return { success: false, error: String(error) };
  }
}

/**
 * Sync hashtag data to database
 */
export async function syncHashtagData(
  hashtag: TikTokHashtag,
  country: string = "US"
): Promise<void> {
  const { prisma } = await import("@/lib/prisma");

  try {
    await prisma.hashtag.upsert({
      where: {
        name_country: {
          name: hashtag.name,
          country,
        },
      },
      create: {
        name: hashtag.name,
        country,
        views: hashtag.views,
        videos: hashtag.videos,
        isRising: hashtag.trending,
        scrapedAt: new Date(),
      },
      update: {
        views: hashtag.views,
        videos: hashtag.videos,
        isRising: hashtag.trending,
        scrapedAt: new Date(),
      },
    });

    console.log(`[PrimeApi] Synced hashtag: ${hashtag.name}`);
  } catch (error) {
    console.error(`[PrimeApi] Failed to sync hashtag ${hashtag.name}:`, error);
  }
}
