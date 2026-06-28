import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { analyzeTrend, scanOpportunities } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { trendId, context } = body;

    if (trendId) {
      const trend = await prisma.trend.findUnique({
        where: { id: trendId },
      });

      if (!trend) {
        return NextResponse.json({ error: "Trend not found" }, { status: 404 });
      }

      const analysis = await analyzeTrend({
        title: trend.title,
        description: trend.description ?? "",
        category: trend.category ?? "",
        growthRate: trend.growthRate,
        views: trend.views,
        creators: trend.creators,
        tags: trend.tags ?? [],
      });

      // Cache AI result
      await prisma.trend.update({
        where: { id: trendId },
        data: {
          aiScore: analysis.opportunityScore,
          aiPrediction: analysis.prediction,
          velocity: analysis.timing === "now" ? 90 : analysis.timing === "24h" ? 70 : 50,
        },
      });

      return NextResponse.json({ data: analysis });
    }

    if (context) {
      const opportunities = await scanOpportunities(context);
      return NextResponse.json({ data: opportunities });
    }

    return NextResponse.json({ error: "Missing trendId or context" }, { status: 400 });
  } catch (error) {
    console.error("Prediction API error:", error);
    return NextResponse.json(
      { error: "Analysis failed", detail: String(error) },
      { status: 500 }
    );
  }
}
