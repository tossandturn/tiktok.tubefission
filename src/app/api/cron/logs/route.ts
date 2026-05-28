import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);

  // Simple authentication
  const secretKey = process.env.CRON_SECRET_KEY;
  if (!secretKey || key !== secretKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const logs = await prisma.scrapeLog.findMany({
      orderBy: { startedAt: "desc" },
      take: limit,
    });

    // Calculate success rate
    const total = logs.length;
    const successful = logs.filter(l => l.status === "success").length;
    const successRate = total > 0 ? (successful / total) * 100 : 0;

    // Get last 24h stats
    const last24h = await prisma.scrapeLog.findMany({
      where: {
        startedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    return NextResponse.json({
      stats: {
        total,
        successful,
        failed: total - successful,
        successRate: successRate.toFixed(1) + "%",
        last24h: {
          runs: last24h.length,
          successful: last24h.filter(l => l.status === "success").length,
        },
      },
      logs: logs.map(log => ({
        id: log.id,
        type: log.type,
        status: log.status,
        count: log.count,
        error: log.error,
        startedAt: log.startedAt,
        endedAt: log.endedAt,
        metadata: log.metadata,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch logs", details: String(error) },
      { status: 500 }
    );
  }
}
