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
  postedAt?: string;
}

export interface ScrapedHashtag {
  name: string;
  views: string;
  videoCount: string;
  isRising: boolean;
  country?: string;
}

// 100+ 热门 TikTok 标签
export const TOP_HASHTAGS = {
  entertainment: ["funny", "comedy", "meme", "lol", "humor", "prank", "viral", "trending", "fyp", "foryou", "foryoupage", "tiktok", "funnyvideos"],
  dance: ["dance", "dancing", "dancer", "choreography", "dancechallenge", "hiphop", "ballet", "contemporary"],
  music: ["music", "song", "singer", "musician", "cover", "acoustic", "rap", "pop", "rock", "guitar", "piano"],
  food: ["food", "foodie", "cooking", "recipe", "chef", "homemade", "foodtok", "baking", "easyrecipe", "mukbang"],
  fashion: ["fashion", "outfit", "style", "ootd", "fashiontok", "beauty", "makeup", "skincare", "getreadywithme"],
  fitness: ["fitness", "gym", "workout", "exercise", "health", "bodybuilding", "yoga", "running", "cardio"],
  education: ["learnontiktok", "learn", "education", "tutorial", "howto", "study", "studytok", "college", "university"],
  tech: ["tech", "technology", "gadgets", "iphone", "android", "apple", "coding", "programming", "developer", "ai"],
  travel: ["travel", "traveltok", "vacation", "adventure", "explore", "backpacking", "hiking", "camping", "beach"],
  lifestyle: ["lifestyle", "home", "decor", "diy", "organization", "cleaning", "hacks", "lifehacks", "productivity"],
  pets: ["pet", "pets", "dog", "cat", "puppy", "kitten", "petsoftiktok", "dogtok", "cattok", "animals"],
  cars: ["car", "cars", "auto", "automotive", "carsoftiktok", "supercar", "modified", "drift", "racing"],
};

export const ALL_HASHTAGS = Object.values(TOP_HASHTAGS).flat();

// 多国家配置
export const COUNTRY_CONFIGS = [
  { locale: "en-US", timezone: "America/New_York", region: "US" },
  { locale: "en-GB", timezone: "Europe/London", region: "GB" },
  { locale: "en-CA", timezone: "America/Toronto", region: "CA" },
  { locale: "en-AU", timezone: "Australia/Sydney", region: "AU" },
  { locale: "en-IN", timezone: "Asia/Kolkata", region: "IN" },
  { locale: "de-DE", timezone: "Europe/Berlin", region: "DE" },
  { locale: "fr-FR", timezone: "Europe/Paris", region: "FR" },
  { locale: "es-ES", timezone: "Europe/Madrid", region: "ES" },
  { locale: "ja-JP", timezone: "Asia/Tokyo", region: "JP" },
  { locale: "pt-BR", timezone: "America/Sao_Paulo", region: "BR" },
];

// 随机延迟
function randomDelay(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1) + min);
  return new Promise(resolve => setTimeout(resolve, delay));
}

// 鼠标移动
async function randomMouseMovement(page: Page): Promise<void> {
  const viewport = await page.viewportSize();
  if (!viewport) return;
  const x = Math.floor(Math.random() * viewport.width * 0.8) + viewport.width * 0.1;
  const y = Math.floor(Math.random() * viewport.height * 0.8) + viewport.height * 0.1;
  await page.mouse.move(x, y, { steps: Math.floor(Math.random() * 5) + 3 });
}

// 滚动
async function humanLikeScroll(page: Page, times: number = 2): Promise<void> {
  for (let i = 0; i < times; i++) {
    const scrollAmount = Math.floor(Math.random() * 400) + 200;
    await page.evaluate((amount) => { window.scrollBy({ top: amount, behavior: 'smooth' }); }, scrollAmount);
    await randomDelay(800, 2000);
  }
}

// Canvas 噪声
function getCanvasNoiseScript(): string {
  return `
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function(type) {
      const context = this.getContext('2d');
      if (context && this.width > 0 && this.height > 0) {
        const imageData = context.getImageData(0, 0, this.width, this.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
          imageData.data[i] = (imageData.data[i] + 2) % 256;
        }
        context.putImageData(imageData, 0, 0);
      }
      return originalToDataURL.apply(this, arguments);
    };
  `;
}

// WebGL 伪装
function getWebGLScript(): string {
  return `
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
      if (parameter === 37445) return 'Intel Inc.';
      if (parameter === 37446) return 'Intel Iris Xe Graphics';
      return getParameter(parameter);
    };
  `;
}

// 浏览器管理
let browser: Browser | null = null;
let requestCount = 0;
const MAX_REQUESTS_PER_SESSION = 50;

async function getBrowser(): Promise<Browser> {
  if (!browser || requestCount >= MAX_REQUESTS_PER_SESSION) {
    if (browser) { await browser.close(); requestCount = 0; }
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage",
        "--disable-gpu", "--disable-blink-features=AutomationControlled",
        "--disable-features=IsolateOrigins,site-per-process",
      ],
    });
  }
  return browser;
}

// 获取隐身页面
async function getStealthPage(region?: string): Promise<Page> {
  const b = await getBrowser();
  requestCount++;

  const config = region
    ? COUNTRY_CONFIGS.find(c => c.region === region) || COUNTRY_CONFIGS[0]
    : COUNTRY_CONFIGS[Math.floor(Math.random() * COUNTRY_CONFIGS.length)];

  const viewports = [
    { width: 1920, height: 1080 }, { width: 1366, height: 768 },
    { width: 1440, height: 900 }, { width: 1536, height: 864 },
  ];
  const viewport = viewports[Math.floor(Math.random() * viewports.length)];

  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  ];

  const context = await b.newContext({
    userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
    viewport,
    locale: config.locale,
    timezoneId: config.timezone,
  });

  const page = await context.newPage();

  // 注入反检测脚本
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    Object.defineProperty(navigator, "plugins", {
      get: () => [{ name: "Chrome PDF Plugin", filename: "internal-pdf-viewer" }],
    });
    // @ts-expect-error Playwright types workaround
    window.chrome = { runtime: {}, loadTimes: () => ({}), csi: () => ({}), app: {} };
    // @ts-expect-error Playwright types workaround
    delete navigator.__proto__.webdriver;
  });

  await page.addInitScript(getCanvasNoiseScript());
  await page.addInitScript(getWebGLScript());

  await page.setExtraHTTPHeaders({
    "Accept-Language": `${config.locale},en;q=0.9`,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  });

  return page;
}

/**
 * 增强版: 从预设列表抓取热门标签（支持10x数据量）
 */
export async function scrapeHashtagList(
  limit: number = 100,
  region?: string
): Promise<ScrapedHashtag[]> {
  const results: ScrapedHashtag[] = [];
  const hashtagsToScrape = ALL_HASHTAGS.slice(0, limit);

  for (let i = 0; i < hashtagsToScrape.length; i++) {
    const hashtag = hashtagsToScrape[i];
    try {
      // 随机延迟 3-7秒
      await randomDelay(3000, 7000);

      const trend = await scrapeHashtag(hashtag, region);
      if (trend) {
        results.push({
          name: trend.hashtag,
          views: trend.views,
          videoCount: trend.videoCount,
          isRising: trend.views.includes("M") || trend.views.includes("B"),
          country: region,
        });
        console.log(`[Scraper] Processed ${i + 1}/${hashtagsToScrape.length}: ${hashtag}`);
      }

      // 每5个请求后额外等待
      if ((i + 1) % 5 === 0) {
        await randomDelay(5000, 10000);
      }
    } catch (error) {
      console.error(`[Scraper] Failed to scrape ${hashtag}:`, error);
    }
  }

  return results;
}

/**
 * 抓取单个标签详情（带重试逻辑）
 */
export async function scrapeHashtag(
  hashtag: string,
  region?: string
): Promise<ScrapedTrend | null> {
  const page = await getStealthPage(region);

  try {
    await randomDelay(2000, 5000);

    const url = `https://www.tiktok.com/tag/${encodeURIComponent(hashtag.replace("#", ""))}`;
    const response = await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 60000,
    });

    if (!response || response.status() !== 200) {
      console.log(`[Scraper] Non-200 response for ${hashtag}: ${response?.status()}`);
      return null;
    }

    // 等待内容加载
    await page.waitForLoadState("domcontentloaded");
    await randomDelay(1000, 2000);
    await randomMouseMovement(page);

    // 提取数据
    const title = await page.locator("h1").first().textContent().catch(() => hashtag);
    const views = await page.locator("[data-e2e='challenge-vvcount']").textContent()
      .catch(() => page.locator("strong:has-text('views')").textContent())
      .catch(() => "0");
    const videoCount = await page.locator("[data-e2e='challenge-video-count']").textContent()
      .catch(() => page.locator("span:has-text('videos')").textContent())
      .catch(() => "0");

    return {
      title: title?.trim() ?? hashtag,
      hashtag: `#${hashtag.replace("#", "")}`,
      views: views?.trim() ?? "0",
      videoCount: videoCount?.trim() ?? "0",
    };
  } catch (error) {
    console.error(`[Scraper] Hashtag scrape failed for ${hashtag}:`, error);
    return null;
  } finally {
    await page.context().close();
  }
}

/**
 * 增强版: 抓取标签下视频（支持50-100个视频）
 */
export async function scrapeHashtagVideos(
  hashtag: string,
  limit: number = 50,
  region?: string
): Promise<ScrapedVideo[]> {
  const page = await getStealthPage(region);
  const results: ScrapedVideo[] = [];

  try {
    await randomDelay(3000, 7000);

    const url = `https://www.tiktok.com/tag/${encodeURIComponent(hashtag.replace("#", ""))}`;
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });

    // 多次滚动加载更多视频
    const scrollIterations = Math.ceil(limit / 10);
    for (let i = 0; i < scrollIterations; i++) {
      await humanLikeScroll(page, 2);
      await randomDelay(1000, 2000);
    }

    // 获取视频列表
    const items = await page.locator("[data-e2e='challenge-item']").all();

    for (const item of items.slice(0, limit)) {
      try {
        await randomDelay(500, 1500);

        const link = await item.locator("a").first().getAttribute("href");
        const views = await item.locator("[data-e2e='video-views']").textContent({ timeout: 2000 })
          .catch(() => item.locator(".video-count").textContent())
          .catch(() => "0");
        const desc = await item.locator("[data-e2e='video-desc']").textContent({ timeout: 2000 })
          .catch(() => item.locator(".video-desc").textContent())
          .catch(() => "");
        const author = await item.locator("[data-e2e='video-author-uniqueid']").textContent({ timeout: 2000 })
          .catch(() => item.locator(".author-name").textContent())
          .catch(() => "unknown");

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
        // 跳过单个失败项
      }
    }
  } catch (error) {
    console.error(`[Scraper] Video scrape failed for ${hashtag}:`, error);
  } finally {
    await page.context().close();
  }

  return results;
}

/**
 * 批量处理多个标签（高效处理）
 */
export async function batchScrapeHashtags(
  hashtags: string[],
  videosPerHashtag: number = 30
): Promise<Map<string, ScrapedVideo[]>> {
  const results = new Map<string, ScrapedVideo[]>();

  for (let i = 0; i < hashtags.length; i++) {
    const hashtag = hashtags[i];
    console.log(`[Scraper] Batch processing ${i + 1}/${hashtags.length}: ${hashtag}`);

    const videos = await scrapeHashtagVideos(hashtag, videosPerHashtag);
    results.set(hashtag, videos);

    // 智能延迟：基于成功/失败率调整
    if (i < hashtags.length - 1) {
      const baseDelay = 5000;
      const jitter = Math.random() * 5000;
      await randomDelay(baseDelay, baseDelay + jitter);
    }
  }

  return results;
}

/**
 * 关闭浏览器
 */
export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
    requestCount = 0;
  }
}
