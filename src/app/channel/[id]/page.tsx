import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { WatchlistButton } from "@/components/watchlist-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Users, Eye, Heart, TrendingUp, Award,
  BarChart3, Share2, Zap
} from "lucide-react";

interface ChannelPageProps {
  params: Promise<{ id: string }>;
}

function formatNumber(n: number | undefined) {
  if (!n) return "0";
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

export async function generateMetadata({ params }: ChannelPageProps): Promise<Metadata> {
  const { id } = await params;
  const creator = await prisma.creator.findUnique({
    where: { username: id },
  });

  if (!creator) {
    return { title: "Creator Not Found | TikTok Intelligence" };
  }

  return {
    title: `${creator.displayName} (@${creator.username}) | TikTok Creator Analytics`,
    description: `Analyze @${creator.username} TikTok performance. ${formatNumber(creator.followers)} followers, ${creator.engagementRate?.toFixed(1) || 0}% engagement rate. AI-powered creator intelligence.`,
    openGraph: {
      title: `@${creator.username} - TikTok Creator Analytics`,
      description: `${formatNumber(creator.followers)} followers · ${creator.engagementRate?.toFixed(1) || 0}% engagement`,
      images: creator.avatar ? [{ url: creator.avatar }] : undefined,
    },
  };
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { id } = await params;

  const creator = await prisma.creator.findUnique({
    where: { username: id },
  });

  if (!creator) {
    notFound();
  }

  // Calculate metrics
  const avgViews = creator.avgViews || 0;
  const engagementRate = creator.engagementRate || 0;
  const momentumScore = creator.momentumScore || 0;
  const viralRate = creator.viralVideoRate || 0;

  // Generate insights
  const insights = [];
  if (creator.followers > 10_000_000) {
    insights.push({ icon: "👑", title: "Mega Creator", desc: "Top 0.1% of TikTok creators by follower count", level: "viral" });
  } else if (creator.followers > 1_000_000) {
    insights.push({ icon: "⭐", title: "Macro Creator", desc: "Strong influence in the TikTok ecosystem", level: "high" });
  } else if (creator.followers > 100_000) {
    insights.push({ icon: "🚀", title: "Rising Creator", desc: "Growing audience with solid engagement", level: "medium" });
  }

  if (engagementRate > 10) {
    insights.push({ icon: "💎", title: "High Engagement", desc: `${engagementRate.toFixed(1)}% rate is 3x TikTok average`, level: "high" });
  }

  if (viralRate > 20) {
    insights.push({ icon: "🔥", title: "Viral Machine", desc: `${viralRate.toFixed(0)}% of videos go viral`, level: "viral" });
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 pt-4 pb-2">
        <Link href="/explore" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Explore</span>
        </Link>
      </div>

      {/* Creator Profile */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="flex items-start gap-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-zinc-800">
            {creator.avatar ? (
              <Image src={creator.avatar} alt={creator.displayName} fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#ff0050] to-[#ff4080] flex items-center justify-center">
                <span className="text-3xl font-bold text-white">{creator.username[0]?.toUpperCase()}</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white">{creator.displayName}</h1>
              {creator.isVerified && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  <Award className="w-3 h-3 mr-1" /> Verified
                </Badge>
              )}
            </div>
            <p className="text-zinc-400 text-sm mb-2">@{creator.username}</p>
            {creator.bio && <p className="text-zinc-500 text-sm mb-3">{creator.bio}</p>}
            {creator.niche && (
              <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                {creator.niche}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <WatchlistButton type="creator" id={creator.id} variant="button" />
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
              <Users className="w-3 h-3" /> FOLLOWERS
            </div>
            <div className="text-2xl font-bold text-white">{formatNumber(creator.followers)}</div>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <div className="text-zinc-500 text-xs mb-1 flex items-center gap-1">
              <Eye className="w-3 h-3" /> AVG VIEWS
            </div>
            <div className="text-2xl font-bold text-[#00f2ea]">{formatNumber(avgViews)}</div>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <div className="text-zinc-500 text-xs mb-1 flex items-center gap-1">
              <Heart className="w-3 h-3" /> ENGAGEMENT
            </div>
            <div className="text-2xl font-bold text-[#ff0050]">{engagementRate.toFixed(1)}%</div>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <div className="text-zinc-500 text-xs mb-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> MOMENTUM
            </div>
            <div className="text-2xl font-bold text-green-400">{momentumScore.toFixed(0)}</div>
          </Card>
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#ff0050]" />
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
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400 uppercase">Viral Video Rate</span>
              <span className="text-sm font-bold text-white">{viralRate.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#00f2ea] to-[#ff0050] rounded-full" style={{ width: `${Math.min(100, viralRate * 2)}%` }} />
            </div>
            <p className="text-xs text-zinc-500 mt-2">Percentage of videos exceeding 1M views</p>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400 uppercase">Growth Prediction</span>
              <span className="text-sm font-bold text-green-400">+{(creator.predictedGrowth30d || 0).toFixed(1)}%</span>
            </div>
            <div className="text-xs text-zinc-500">Predicted follower growth over next 30 days</div>
          </Card>
        </div>
      </div>

      {/* Associated Trends - Coming Soon */}
      {/* Recent Videos - Coming Soon */}
    </div>
  );
}
