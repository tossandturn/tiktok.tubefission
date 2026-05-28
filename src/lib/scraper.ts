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

// Anti-detection: Random delays to mimic human behavior
function randomDelay(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1) + min);
  return new Promise(resolve => setTimeout(resolve, delay));
}

// Anti-detection: Random mouse movements
async function randomMouseMovement(page: Page): Promise<void> {
  const viewport = await page.viewportSize();
  if (!viewport) return;

  const x = Math.floor(Math.random() * viewport.width);
  const y = Math.floor(Math.random() * viewport.height);
  await page.mouse.move(x, y, { steps: Math.floor(Math.random() * 5) + 3 });
}

// Anti-detection: Scroll with random speed
async function humanLikeScroll(page: Page): Promise<void> {
  const scrollAmount = Math.floor(Math.random() * 300) + 100;
  await page.evaluate((amount) => {
    window.scrollBy({ top: amount, behavior: 'smooth' });
  }, scrollAmount);
  await randomDelay(500, 1500);
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
        "--disable-blink-features=AutomationControlled",
        "--disable-features=IsolateOrigins,site-per-process",
      ],
    });
  }
  return browser;
}

async function getStealthPage(): Promise<Page> {
  const b = await getBrowser();

  // Random viewport size (common resolutions)
  const viewports = [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1536, height: 864 },
  ];
  const viewport = viewports[Math.floor(Math.random() * viewports.length)];

  // Random user agents
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
  ];
  const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

  const context = await b.newContext({
    userAgent,
    viewport,
    locale: "en-US",
    timezoneId: "America/New_York",
    deviceScaleFactor: 1,
    hasTouch: false,
  });

  const page = await context.newPage();

  // Advanced stealth: mask webdriver and automation
  await page.addInitScript(() => {
    // Remove webdriver
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });

    // Fake plugins
    Object.defineProperty(navigator, "plugins", {
      get: () => [
        { name: "Chrome PDF Plugin", filename: "internal-pdf-viewer" },
        { name: "Native Client", filename: "native-client" },
      ],
    });

    // Fake chrome
    // @ts-expect-error - defining chrome object for anti-detection
    window.chrome = {
      runtime: {},
      loadTimes: () => ({}),
      csi: () => ({}),
      app: {},
    };

    // Remove automation flags
    // @ts-expect-error - removing webdriver from navigator prototype
    delete navigator.__proto__.webdriver;
  });

  // Set extra headers
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "DNT": "1",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Cache-Control": "max-age=0",
  });

  return page;
}

/**
 * Scrape TikTok Discover page for trending hashtags
 * Respects rate limits with delays between requests
 */
export async function scrapeDiscover(limit = 20): Promise<ScrapedHashtag[]> {
  const page = await getStealthPage();
  const results: ScrapedHashtag[] = [];

  try {
    // Random delay before navigation (2-5 seconds)
    await randomDelay(2000, 5000);

    await page.goto("https://www.tiktok.com/discover", {
      waitUntil: "networkidle",
      timeout: 60000,
    });

    // Random mouse movement
    await randomMouseMovement(page);

    // Wait for content with longer timeout
    await page.waitForSelector("[data-e2e='discover-card']", { timeout: 15000 });

    // Scroll to load more content
    for (let i = 0; i < 3; i++) {
      await humanLikeScroll(page);
    }

    const cards = await page.locator("[data-e2e='discover-card']").all();

    for (const card of cards.slice(0, limit)) {
      try {
        // Random delay between processing cards (500ms - 1.5s)
        await randomDelay(500, 1500);

        const name = await card.locator("a").first().textContent({ timeout: 3000 });
        const views = await card.locator("[data-e2e='discover-card-view']").textContent({ timeout: 3000 });
        const videoCount = await card.locator("[data-e2e='discover-card-video-count']").textContent({ timeout: 3000 });

        if (name) {
          results.push({
            name: name.trim(),
            views: views?.trim() ?? "0",
            videoCount: videoCount?.trim() ?? "0",
            isRising: (views?.includes("M") || views?.includes("B")) ?? false,
          });
        }

        // Random mouse movement between cards
        await randomMouseMovement(page);
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
 * Scrape hashtag detail page with rate limiting
 */
export async function scrapeHashtag(hashtag: string): Promise<ScrapedTrend | null> {
  const page = await getStealthPage();

  try {
    // Random delay before navigation (3-7 seconds)
    await randomDelay(3000, 7000);

    const url = `https://www.tiktok.com/tag/${encodeURIComponent(hashtag.replace("#", ""))}`;
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });

    await page.waitForSelector("[data-e2e='challenge-title']", { timeout: 15000 });

    // Random delay before extracting data
    await randomDelay(1000, 2000);
    await randomMouseMovement(page);

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
 * Scrape top videos for a hashtag with delays
 */
export async function scrapeHashtagVideos(hashtag: string, limit = 10): Promise<ScrapedVideo[]> {
  const page = await getStealthPage();
  const results: ScrapedVideo[] = [];

  try {
    // Random delay before navigation (3-7 seconds)
    await randomDelay(3000, 7000);

    const url = `https://www.tiktok.com/tag/${encodeURIComponent(hashtag.replace("#", ""))}`;
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });

    await page.waitForSelector("[data-e2e='challenge-item']", { timeout: 15000 });

    // Scroll to load more videos
    for (let i = 0; i < 2; i++) {
      await humanLikeScroll(page);
    }

    const items = await page.locator("[data-e2e='challenge-item']").all();

    for (const item of items.slice(0, limit)) {
      try {
        // Random delay between processing items (1-3 seconds)
        await randomDelay(1000, 3000);

        const link = await item.locator("a").first().getAttribute("href");
        const views = await item.locator("[data-e2e='video-views']").textContent({ timeout: 3000 });
        const desc = await item.locator("[data-e2e='video-desc']").textContent({ timeout: 3000 });
        const author = await item.locator("[data-e2e='video-author-uniqueid']").textContent({ timeout: 3000 });

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

        await randomMouseMovement(page);
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
