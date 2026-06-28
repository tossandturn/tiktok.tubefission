import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { WatchlistButton } from "@/components/watchlist-button";
import { Button } from "@/components/ui/button";

import { Card } from "@/components/ui/card";
import {
  ArrowLeft, Eye, Heart, MessageCircle, Share2,
  Zap, Clock, BarChart3, Sparkles,
  Flame, Play, User
} from "lucide-react";
import { TikTokEmbed } from "@/components/tiktok-embed";
import VideoExport from "@/components/video-export";

interface VideoPageProps {
  params: Promise<{ id: string }>;
}

function formatNumber(n: number | string | undefined) {
  const num = Number(n || 0);
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toLocaleString();
}

function calculateEngagement(views: number, likes: number, comments: number) {
  if (views === 0) return 0;
  return (((likes + comments * 2) / views) * 100).toFixed(2);
}

export async function generateMetadata({ params }: VideoPageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const video = await prisma.video.findUnique({
      where: { id },
    });

    if (!video) {
      return { title: "Video Not Found | TikTok Intelligence" };
    }

    // Fetch trend separately since Video model has no direct trend relation
    let trendTitle = "TikTok Video";
    if (video.trendId) {
      const trend = await prisma.trend.findUnique({ where: { id: video.trendId }, select: { title: true } });
      if (trend) trendTitle = trend.title;
    }

    return {
      title: `Video Analysis: ${trendTitle} | TikTok Intelligence`,
      description: `Analyze viral TikTok video performance. ${formatNumber(Number(video.views))} views, engagement metrics, and AI-powered insights.`,
      openGraph: {
        title: `Video Analysis - ${formatNumber(Number(video.views))} views`,
        description: `TikTok video analytics and viral insights`,
        images: video.thumbnail ? [{ url: video.thumbnail }] : undefined,
      },
    };
  } catch {
    return { title: "Video | TikTok Intelligence" };
  }
}

export async function generateStaticParams() {
  // Return empty - pages will be generated on-demand via ISR
  return [];
}

export const dynamicParams = true;

export const revalidate = 3600; // 1 hour

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;

  // Handle placeholder id from generateStaticParams fallback
  if (id === "placeholder") {
    notFound();
  }

  try {
    const video = await prisma.video.findUnique({
      where: { id },
    });

    if (!video) {
      notFound();
    }

    // Fetch trend data separately since Video model has no direct trend relation
    let trendData: { title: string; slug: string; description: string | null } | null = null;
    if (video.trendId) {
      trendData = await prisma.trend.findUnique({
        where: { id: video.trendId },
        select: { title: true, slug: true, description: true },
      });
    }

    // Get related videos from same trend
    const relatedVideos = await prisma.video.findMany({
      where: {
        trendId: video.trendId,
        id: { not: video.id },
      },
      take: 6,
      orderBy: { views: "desc" },
    });

    // Calculate metrics
    const views = Number(video.views) || 0;
    const likes = Number(video.likes) || 0;
    const comments = Number(video.comments) || 0;
    const engagement = calculateEngagement(views, likes, comments);
    const likeRate = views > 0 ? ((likes / views) * 100).toFixed(2) : "0";
    const commentRate = views > 0 ? ((comments / views) * 100).toFixed(3) : "0";

    // Generate insights based on data
    const insights = [];
    if (views > 10_000_000) {
      insights.push({ icon: "🔥", title: "Mega Viral", desc: "Over 10M views places this in the top 1% of TikTok content", level: "viral" });
    } else if (views > 1_000_000) {
      insights.push({ icon: "⚡", title: "Viral Hit", desc: "Crossed 1M views - significant algorithmic boost", level: "high" });
    } else if (views > 100_000) {
      insights.push({ icon: "📈", title: "Trending", desc: "Strong performance with sustained engagement", level: "medium" });
    }

    if (Number(engagement) > 10) {
      insights.push({ icon: "💎", title: "High Engagement", desc: `${engagement}% engagement is well above TikTok average of 5-8%`, level: "high" });
    }

    if (Number(likeRate) > 5) {
      insights.push({ icon: "❤️", title: "Like Magnet", desc: `${likeRate}% like rate indicates strong content appeal`, level: "medium" });
    }


  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 pt-4 pb-2">
        <Link
          href="/trending"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Trends</span>
        </Link>
      </div>

      {/* Video Player Section */}
      <div className="max-w-4xl mx-auto px-4 mb-6">
        <div className="aspect-[9/16] max-h-[600px] mx-auto bg-zinc-900 rounded-xl overflow-hidden">
          {video.url ? (
            <TikTokEmbed videoId={video.tiktokId || video.id} thumbnail={video.thumbnail} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-500">Video preview not available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Info */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white mb-2">
              {trendData?.title || "TikTok Video Analysis"}
            </h1>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff0050] to-[#ff4080] flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-zinc-400 text-sm">@{trendData?.slug || "creator"}</span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">{trendData?.description}</p>
          </div>
          <div className="flex gap-2">
            <WatchlistButton type="trend" id={video.trendId || ""} variant="icon" />
            <Button variant="outline" size="icon" className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <div className="text-zinc-500 text-xs mb-1 flex items-center gap-1">
              <Eye className="w-3 h-3" /> VIEWS
            </div>
            <div className="text-2xl font-bold text-white">{formatNumber(views)}</div>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <div className="text-zinc-500 text-xs mb-1 flex items-center gap-1">
              <Heart className="w-3 h-3" /> LIKES
            </div>
            <div className="text-2xl font-bold text-[#ff0050]">{formatNumber(likes)}</div>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <div className="text-zinc-500 text-xs mb-1 flex items-center gap-1">
              <MessageCircle className="w-3 h-3" /> COMMENTS
            </div>
            <div className="text-2xl font-bold text-[#00f2ea]">{formatNumber(comments)}</div>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <div className="text-zinc-500 text-xs mb-1 flex items-center gap-1">
              <Zap className="w-3 h-3" /> ENGAGEMENT
            </div>
            <div className="text-2xl font-bold text-green-400">{engagement}%</div>
          </Card>
        </div>

        {/* Export Section */}
        <Card className="bg-zinc-900 border-zinc-800 p-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-zinc-400">Export Report</span>
          </div>
          <VideoExport
            video={{
              id: video.id,
              url: video.url ?? undefined,
              tiktokId: video.tiktokId ?? undefined,
              views: video.views.toString(),
              likes: video.likes?.toString() || "0",
              comments: video.comments?.toString(),
              shares: video.shares?.toString(),
              author: trendData?.slug || "creator",
              description: trendData?.description || "",
              duration: video.duration?.toString(),
              viralScore: video.viralScore,
              engagementRate: Number(engagement),
              trend: trendData ? { title: trendData.title, category: undefined } : undefined
            }}
            velocity={views / 30}
          />
        </Card>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#ff0050]" />
            AI Insights
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {insights.map((insight, idx) => (
              <Card
                key={idx}
                className={`bg-zinc-900 border-zinc-800 p-4 ${
                  insight.level === "viral" ? "border-[#ff0050]/50 bg-[#ff0050]/5" :
                  insight.level === "high" ? "border-green-500/50 bg-green-500/5" :
                  "border-zinc-700"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{insight.icon}</span>
                  <div>
                    <div className="font-bold text-white text-sm mb-1">{insight.title}</div>
                    <div className="text-zinc-400 text-xs">{insight.desc}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#00f2ea]" />
          Performance Metrics
        </h2>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Like Rate */}
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400 uppercase">Like Rate</span>
              <span className="text-sm font-bold text-white">{likeRate}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#ff0050] rounded-full"
                style={{ width: `${Math.min(100, Number(likeRate) * 10)}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-2">TikTok average: 4-6%</p>
          </Card>

          {/* Comment Rate */}
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400 uppercase">Comment Rate</span>
              <span className="text-sm font-bold text-white">{commentRate}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00f2ea] rounded-full"
                style={{ width: `${Math.min(100, Number(commentRate) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-2">TikTok average: 0.5-1%</p>
          </Card>

          {/* Video Duration */}
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400 uppercase">Duration</span>
              <span className="text-sm font-bold text-white flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {video.duration || "0:15"}
              </span>
            </div>
            <div className="text-xs text-zinc-500">
              Optimal length for engagement: 15-60 seconds
            </div>
          </Card>

          {/* Viral Score */}
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400 uppercase">Viral Score</span>
              <span className="text-sm font-bold text-[#ff0050]">
                {video.viralScore?.toFixed(0) || "--"}/100
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00f2ea] to-[#ff0050] rounded-full"
                style={{ width: `${video.viralScore || 0}%` }}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Related Videos */}
      {relatedVideos.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 pb-12">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Related Videos
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {relatedVideos.map((v) => (
              <Link
                key={v.id}
                href={`/video/${v.id}`}
                className="group block aspect-[9/16] bg-zinc-900 rounded-xl overflow-hidden"
              >
                {v.thumbnail ? (
                  <Image
                    src={v.thumbnail}
                    alt="TikTok video"
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-zinc-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-center gap-1 text-white text-xs">
                    <Eye className="w-3 h-3" />
                    {formatNumber(Number(v.views))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  } catch {
    notFound();
  }
}
