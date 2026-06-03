import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Get user's watchlist
export async function GET(req: Request) {
  try {
    // Get user from session token (simplified)
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const watchlist = await prisma.watchlist.findMany({
      where: { userId: session.userId },
      include: {
        trend: true,
        hashtag: true,
        creator: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, watchlist });
  } catch (error) {
    console.error("Watchlist fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch watchlist" }, { status: 500 });
  }
}

// Add item to watchlist
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const { type, id, notes } = await req.json();

    // Check if already in watchlist
    const existing = await prisma.watchlist.findFirst({
      where: {
        userId: session.userId,
        ...(type === "trend" && { trendId: id }),
        ...(type === "hashtag" && { hashtagId: id }),
        ...(type === "creator" && { creatorId: id }),
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Already in watchlist" }, { status: 409 });
    }

    // Add to watchlist
    const watchlistItem = await prisma.watchlist.create({
      data: {
        userId: session.userId,
        ...(type === "trend" && { trendId: id }),
        ...(type === "hashtag" && { hashtagId: id }),
        ...(type === "creator" && { creatorId: id }),
        notes,
      },
      include: {
        trend: true,
        hashtag: true,
        creator: true,
      },
    });

    return NextResponse.json({ success: true, item: watchlistItem });
  } catch (error) {
    console.error("Watchlist add error:", error);
    return NextResponse.json({ error: "Failed to add to watchlist" }, { status: 500 });
  }
}

// Remove from watchlist
export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const { id } = await req.json();

    await prisma.watchlist.delete({
      where: { id, userId: session.userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Watchlist delete error:", error);
    return NextResponse.json({ error: "Failed to remove from watchlist" }, { status: 500 });
  }
}
