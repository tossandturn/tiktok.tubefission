import { chromium, type Browser, type Page } from "playwright";

export interface ScrapedTrend {
  title: string;
  hashtag: string;
  views: string;
  videoCount: string;
  growthRate?: number;
}

export interface ScrapedVideo {
  id: string;
  url: string;
  views: string;
  likes: string;
  shares?: string;
  author: string;
  description: string;
}

export interface ScrapedHashtag {
  name: string;
  views: string;
  videoCount: string;
  isRising: boolean;
}

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });
  }
  return browser;
}

async function getStealthPage(): Promise<Page> {
  const b = await getBrowser();
  const context = await b.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1366, height: 768 },
    locale: "en-US",
    timezoneId: "America/New_York",
  });
  const page = await context.newPage();

  // Basic stealth: mask webdriver
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    // @ts-expect-error chrome is not defined in standard browsers
    window.chrome = { runtime: {} };
  });

  return page;
}

/**
 * Scrape TikTok Discover page for trending hashtags
 */
export async function scrapeDiscover(limit = 20): Promise<ScrapedHashtag[]> {
  const page = await getStealthPage();
  const results: ScrapedHashtag[] = [];

  try {
    await page.goto("https://www.tiktok.com/discover", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Wait for content to load
    await page.waitForSelector("[data-e2e='discover-card']", { timeout: 10000 });

    const cards = await page.locator("[data-e2e='discover-card']").all();

    for (const card of cards.slice(0, limit)) {
      try {
        const name = await card.locator("a").first().textContent({ timeout: 2000 });
        const views = await card.locator("[data-e2e='discover-card-view']").textContent({ timeout: 2000 });
        const videoCount = await card.locator("[data-e2e='discover-card-video-count']").textContent({ timeout: 2000 });

        if (name) {
          results.push({
            name: name.trim(),
            views: views?.trim() ?? "0",
            videoCount: videoCount?.trim() ?? "0",
            isRising: (views?.includes("M") || views?.includes("B")) ?? false,
          });
        }
      } catch {
        // Skip individual card errors
      }
    }
  } catch (error) {
    console.error("Discover scrape failed:", error);
  } finally {
    await page.context().close();
  }

  return results;
}

/**
 * Scrape hashtag detail page
 */
export async function scrapeHashtag(hashtag: string): Promise<ScrapedTrend | null> {
  const page = await getStealthPage();

  try {
    const url = `https://www.tiktok.com/tag/${encodeURIComponent(hashtag.replace("#", ""))}`;
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

    await page.waitForSelector("[data-e2e='challenge-title']", { timeout: 10000 });

    const title = await page.locator("[data-e2e='challenge-title']").textContent();
    const views = await page.locator("[data-e2e='challenge-vvcount']").textContent();
    const videoCount = await page.locator("[data-e2e='challenge-video-count']").textContent();

    return {
      title: title?.trim() ?? hashtag,
      hashtag: `#${hashtag.replace("#", "")}`,
      views: views?.trim() ?? "0",
      videoCount: videoCount?.trim() ?? "0",
    };
  } catch (error) {
    console.error(`Hashtag scrape failed for ${hashtag}:`, error);
    return null;
  } finally {
    await page.context().close();
  }
}

/**
 * Scrape top videos for a hashtag
 */
export async function scrapeHashtagVideos(hashtag: string, limit = 10): Promise<ScrapedVideo[]> {
  const page = await getStealthPage();
  const results: ScrapedVideo[] = [];

  try {
    const url = `https://www.tiktok.com/tag/${encodeURIComponent(hashtag.replace("#", ""))}`;
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

    await page.waitForSelector("[data-e2e='challenge-item']", { timeout: 10000 });

    const items = await page.locator("[data-e2e='challenge-item']").all();

    for (const item of items.slice(0, limit)) {
      try {
        const link = await item.locator("a").first().getAttribute("href");
        const views = await item.locator("[data-e2e='video-views']").textContent({ timeout: 2000 });
        const desc = await item.locator("[data-e2e='video-desc']").textContent({ timeout: 2000 });
        const author = await item.locator("[data-e2e='video-author-uniqueid']").textContent({ timeout: 2000 });

        if (link) {
          results.push({
            id: link.split("/").pop() ?? "",
            url: link.startsWith("http") ? link : `https://tiktok.com${link}`,
            views: views?.trim() ?? "0",
            likes: "0",
            author: author?.trim() ?? "unknown",
            description: desc?.trim() ?? "",
          });
        }
      } catch {
        // Skip individual item errors
      }
    }
  } catch (error) {
    console.error(`Video scrape failed for ${hashtag}:`, error);
  } finally {
    await page.context().close();
  }

  return results;
}

/**
 * Close browser instance
 */
export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}
