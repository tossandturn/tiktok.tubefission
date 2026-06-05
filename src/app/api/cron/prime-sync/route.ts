import { NextRequest, NextResponse } from "next/server";
import { getTrendingHashtags, syncHashtagData, checkApiBalance } from "@/lib/prime-api";
import { prisma } from "@/lib/prisma";

const CRON_SECRET_KEY = process.env.CRON_SECRET_KEY || "";

export const dynamic = "force-dynamic";

/**
 * Sync trending hashtags from PrimeApi
 * Runs daily to keep data fresh
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (key !== CRON_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const country = searchParams.get("country") || "US";
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  try {
    // Check API balance first
    const balance = await checkApiBalance();
    if (balance.remaining <= 0) {
      return NextResponse.json({
        error: "API quota exceeded",
        balance
      }, { status: 429 });
    }

    // Fetch trending hashtags
    const result = await getTrendingHashtags(country, limit);

    if (!result.success || !result.data) {
      return NextResponse.json({
        error: "Failed to fetch data",
        details: result.error
      }, { status: 500 });
    }

    // Sync to database
    const syncResults = {
      success: 0,
      failed: 0,
      hashtags: [] as string[],
    };

    for (const hashtag of result.data) {
      try {
        await syncHashtagData(hashtag, country);
        syncResults.success++;
        syncResults.hashtags.push(hashtag.name);
      } catch {
        syncResults.failed++;
      }
    }

    // Log the sync
    await prisma.scrapeLog.create({
      data: {
        type: "primeapi_hashtags",
        status: "success",
        count: syncResults.success,
        error: null,
        metadata: {
          country,
          total: result.data.length,
          failed: syncResults.failed,
          balance: balance.remaining
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Synced ${syncResults.success} hashtags`,
      data: {
        country,
        synced: syncResults.success,
        failed: syncResults.failed,
        hashtags: syncResults.hashtags,
        apiBalance: balance.remaining,
      },
    });

  } catch (error) {
    console.error("PrimeApi sync error:", error);

    // Log error
    await prisma.scrapeLog.create({
      data: {
        type: "primeapi_hashtags",
        status: "error",
        count: 0,
        error: String(error),
        metadata: { country },
      },
    });

    return NextResponse.json({
      error: "Sync failed",
      details: String(error),
    }, { status: 500 });
  }
}
