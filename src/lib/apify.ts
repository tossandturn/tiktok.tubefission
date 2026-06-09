/**
 * Apify TikTok Scraper Service
 * Free tier: 10,000 compute units/month (~2-3 hours runtime)
 * Rate limit: No hard limit, depends on proxy rotation
 * Docs: https://apify.com/curious_coder/tiktok-scraper
 */

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN || "";
const APIFY_BASE_URL = "https://api.apify.com/v2";
const TIKTOK_SCRAPER_ACTOR = process.env.APIFY_TIKTOK_SCRAPER_ACTOR || "curious_coder/tiktok-scraper";

interface ApifyRunResponse {
  data: {
    id: string;
    status: "READY" | "RUNNING" | "SUCCEEDED" | "FAILED";
    startedAt: string;
    finishedAt?: string;
    errorMessage?: string;
  };
}

interface ApifyDatasetItem {
  id: string;
  text?: string;
  desc?: string;
  url?: string;
  webVideoUrl?: string;
  createTime?: string;
  stats?: {
    diggCount?: number;
    shareCount?: number;
    commentCount?: number;
    playCount?: number;
  };
  author?: {
    id?: string;
    uniqueId?: string;
    nickname?: string;
    avatarThumb?: string;
    followerCount?: number;
    followingCount?: number;
    heartCount?: number;
    verified?: boolean;
  };
  music?: {
    id?: string;
    title?: string;
    authorName?: string;
  };
  hashtags?: Array<{ name: string }>;
  video?: {
    cover?: string;
    playAddr?: string;
  };
}

interface ScraperOptions {
  hashtags?: string[];
  profiles?: string[];
  searchQueries?: string[];
  maxResults?: number;
  maxResultsPerQuery?: number;
  shouldDownloadVideos?: boolean;
  shouldDownloadCovers?: boolean;
  proxy?: "residential" | "datacenter";
}

/**
 * Start TikTok scraper run
 */
export async function startScraperRun(
  options: ScraperOptions
): Promise<{ runId: string; status: string }> {
  if (!APIFY_API_TOKEN) {
    throw new Error("APIFY_API_TOKEN not configured");
  }

  const input = {
    hashtags: options.hashtags?.map(h => h.replace("#", "")) || [],
    profiles: options.profiles || [],
    searchQueries: options.searchQueries || [],
    maxResults: options.maxResults || 100,
    maxResultsPerQuery: options.maxResultsPerQuery || 50,
    shouldDownloadVideos: options.shouldDownloadVideos || false,
    shouldDownloadCovers: options.shouldDownloadCovers || false,
    proxy: options.proxy || "residential",
  };

  const response = await fetch(
    `${APIFY_BASE_URL}/acts/${TIKTOK_SCRAPER_ACTOR}/runs`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${APIFY_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Apify API error: ${response.status} - ${error}`);
  }

  const data: ApifyRunResponse = await response.json();
  return {
    runId: data.data.id,
    status: data.data.status,
  };
}

/**
 * Check run status
 */
export async function getRunStatus(runId: string): Promise<{
  status: string;
  finishedAt?: string;
  errorMessage?: string;
}> {
  const response = await fetch(
    `${APIFY_BASE_URL}/acts/${TIKTOK_SCRAPER_ACTOR}/runs/${runId}`,
    {
      headers: {
        "Authorization": `Bearer ${APIFY_API_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get run status: ${response.status}`);
  }

  const data: ApifyRunResponse = await response.json();
  return {
    status: data.data.status,
    finishedAt: data.data.finishedAt,
    errorMessage: data.data.errorMessage,
  };
}

/**
 * Get dataset items from run
 */
export async function getDatasetItems(
  runId: string,
  limit: number = 100,
  offset: number = 0
): Promise<ApifyDatasetItem[]> {
  const response = await fetch(
    `${APIFY_BASE_URL}/acts/${TIKTOK_SCRAPER_ACTOR}/runs/${runId}/dataset/items?limit=${limit}&offset=${offset}`,
    {
      headers: {
        "Authorization": `Bearer ${APIFY_API_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get dataset: ${response.status}`);
  }

  return await response.json();
}

/**
 * Poll until run completes
 */
export async function waitForRunCompletion(
  runId: string,
  maxWaitMinutes: number = 10
): Promise<boolean> {
  const startTime = Date.now();
  const maxWaitMs = maxWaitMinutes * 60 * 1000;

  while (Date.now() - startTime < maxWaitMs) {
    const status = await getRunStatus(runId);

    if (status.status === "SUCCEEDED") {
      return true;
    }

    if (status.status === "FAILED") {
      throw new Error(`Run failed: ${status.errorMessage}`);
    }

    // Wait 10 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  throw new Error("Run timeout");
}

/**
 * Get user info by username
 */
export async function getUserInfo(username: string): Promise<ApifyDatasetItem["author"] | null> {
  const { runId } = await startScraperRun({
    profiles: [username],
    maxResults: 1,
    maxResultsPerQuery: 1,
  });

  await waitForRunCompletion(runId, 2);

  const items = await getDatasetItems(runId, 1);
  return items[0]?.author || null;
}

/**
 * Get videos by hashtag
 */
export async function getVideosByHashtag(
  hashtag: string,
  limit: number = 50
): Promise<ApifyDatasetItem[]> {
  const { runId } = await startScraperRun({
    hashtags: [hashtag.replace("#", "")],
    maxResults: limit,
    maxResultsPerQuery: limit,
  });

  await waitForRunCompletion(runId, 5);

  return await getDatasetItems(runId, limit);
}

/**
 * Search videos
 */
export async function searchVideos(
  query: string,
  limit: number = 50
): Promise<ApifyDatasetItem[]> {
  const { runId } = await startScraperRun({
    searchQueries: [query],
    maxResults: limit,
    maxResultsPerQuery: limit,
  });

  await waitForRunCompletion(runId, 5);

  return await getDatasetItems(runId, limit);
}

/**
 * Transform Apify video data to our Video model
 */
export function transformVideoData(item: ApifyDatasetItem) {
  return {
    id: item.id,
    title: item.text || item.desc || "Untitled",
    description: item.desc || "",
    thumbnail: item.video?.cover || "",
    videoUrl: item.video?.playAddr || "",
    views: item.stats?.playCount || 0,
    likes: item.stats?.diggCount || 0,
    comments: item.stats?.commentCount || 0,
    shares: item.stats?.shareCount || 0,
    createdAt: item.createTime ? new Date(parseInt(item.createTime) * 1000) : new Date(),
    author: item.author ? {
      id: item.author.id || "",
      username: item.author.uniqueId || "",
      displayName: item.author.nickname || "",
      avatar: item.author.avatarThumb || "",
      followers: item.author.followerCount || 0,
      following: item.author.followingCount || 0,
      likes: item.author.heartCount || 0,
      verified: item.author.verified || false,
    } : null,
    hashtags: item.hashtags?.map(h => h.name) || [],
    music: item.music ? {
      id: item.music.id || "",
      title: item.music.title || "",
      author: item.music.authorName || "",
    } : null,
  };
}

/**
 * Check Apify account usage
 */
export async function getAccountUsage(): Promise<{
  computeUnitsUsed: number;
  computeUnitsLimit: number;
  percentage: number;
}> {
  const response = await fetch(
    `${APIFY_BASE_URL}/users/me/usage`,
    {
      headers: {
        "Authorization": `Bearer ${APIFY_API_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get usage: ${response.status}`);
  }

  const data = await response.json();
  return {
    computeUnitsUsed: data.data?.computeUnitsUsed || 0,
    computeUnitsLimit: data.data?.computeUnitsLimit || 10000,
    percentage: data.data?.percentage || 0,
  };
}
