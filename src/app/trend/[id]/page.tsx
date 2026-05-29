import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Eye, Users, Clock, Share2, Bookmark, Flame, Sparkles, BarChart3, Target, Zap, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdSlot } from "@/components/ad-slot";
import { FloatingTags } from "@/components/floating-tags";
import { StructuredData } from "@/components/structured-data";
import { TikTokEmbed } from "@/components/tiktok-embed";
import { RefreshIndicator } from "@/components/refresh-indicator";
import { TrendHistoryChart } from "@/components/trend-history-chart";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const trend = await prisma.trend.findUnique({
    where: { slug: id },
    include: { tags: { include: { tag: true } } },
  });

  if (!trend) return {};

  return {
    title: trend.title,
    description: trend.description,
    openGraph: {
      title: `${trend.title} | TikTok Intelligence`,
      description: trend.description,
      images: [{ url: trend.thumbnail || "/placeholder-trend.png", width: 600, height: 800, alt: trend.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: trend.title,
      description: trend.description,
      images: [trend.thumbnail || "/placeholder-trend.png"],
    },
    alternates: {
      canonical: `https://tictok.tubefission.com/trend/${id}`,
    },
  };
}

export async function generateStaticParams() {
  const trends = await prisma.trend.findMany({
    select: { slug: true },
    take: 50,
  });
  return trends.map((t) => ({ id: t.slug }));
}

export default async function TrendPage({ params }: Props) {
  const { id } = await params;

  const trend = await prisma.trend.findUnique({
    where: { slug: id },
    include: { tags: { include: { tag: true } } },
  });

  if (!trend) notFound();

  // Get related trends from same category
  const relatedTrends = await prisma.trend.findMany({
    where: {
      category: trend.category,
      slug: { not: id },
    },
    include: { tags: { include: { tag: true } } },
    take: 3,
    orderBy: { viralScore: "desc" },
  });

  const tags = trend.tags.map(t => `#${t.tag.name}`);

  const articleData = {
    headline: trend.title,
    description: trend.description,
    image: trend.thumbnail || "/placeholder-trend.png",
    datePublished: trend.createdAt.toISOString(),
    dateModified: trend.updatedAt.toISOString(),
    author: {
      "@type": "Organization",
      name: "TikTok Intelligence",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://tictok.tubefission.com/trend/${id}`,
    },
  };

  const breadcrumbData = {
    items: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://tictok.tubefission.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: trend.category,
        item: `https://tictok.tubefission.com/explore?category=${trend.category}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: trend.title,
        item: `https://tictok.tubefission.com/trend/${id}`,
      },
    ],
  };

  const sectionVideos = [
    { id: "v1", videoId: "7157280000000000000", thumbnail: "https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=400&h=700&fit=crop", views: "12.4M", likes: "2.1M", duration: "0:24" },
    { id: "v2", videoId: "7157280000000000001", thumbnail: "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=400&h=700&fit=crop", views: "8.7M", likes: "1.4M", duration: "0:31" },
    { id: "v3", videoId: "7157280000000000002", thumbnail: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=700&fit=crop", views: "6.2M", likes: "890K", duration: "0:18" },
  ];

  return (
    <div className="max-w-lg mx-auto pb-12">
      <StructuredData type="article" data={articleData} />
      <StructuredData type="breadcrumb" data={breadcrumbData} />

      {/* Back + Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <Link
          href="/"
          className="p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white/60" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Badge variant="outline" className="border-white/10 text-white/50 text-[10px]">
              {trend.category}
            </Badge>
            {trend.isViral && (
              <span className="flex items-center gap-1 text-tiktok-red text-[10px] font-bold uppercase">
                <Flame className="w-3 h-3" /> Viral
              </span>
            )}
            {!trend.isViral && (
              <span className="flex items-center gap-1 text-tiktok-cyan text-[10px] font-bold uppercase">
                <Sparkles className="w-3 h-3" /> Trending
              </span>
            )}
          </div>
        </div>
        <RefreshIndicator />
      </div>

      {/* Hero Image — Click to search on TikTok */}
      <a
        href={`https://www.tiktok.com/search?q=${encodeURIComponent(tags[0]?.replace('#', '') || trend.title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="relative aspect-[4/5] w-full block cursor-pointer group"
      >
        <Image
          src={trend.thumbnail || "/placeholder-trend.png"}
          alt={trend.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 512px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-tiktok-black via-transparent to-transparent" />

        {/* TikTok overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <svg viewBox="0 0 32 32" fill="none" className="w-12 h-12">
              <path
                d="M24.5 8.5c-2.5 0-4.8-1.3-6.1-3.3v11.8c0 5.2-4.2 9.5-9.5 9.5S-.6 22.2-.6 17s4.2-9.5 9.5-9.5c.5 0 1 0 1.5.1v5.2c-.5-.1-1-.2-1.5-.2-2.4 0-4.3 1.9-4.3 4.3s1.9 4.3 4.3 4.3 4.3-1.9 4.3-4.3V0h5.1c.7 3.2 3.2 5.7 6.4 6.4v2.1z"
                transform="translate(6, 4)"
                fill="#00f2ea"
              />
            </svg>
            <span className="text-white font-semibold text-sm">View on TikTok</span>
          </div>
        </div>

        {/* Country badge */}
        {trend.country && (
          <div className="absolute top-4 left-4 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full pointer-events-none">
            <Globe className="w-3 h-3" />
            {trend.country}
          </div>
        )}

        {/* Growth badge */}
        <div className="absolute top-4 right-4 bg-tiktok-cyan/90 backdrop-blur-sm text-tiktok-black text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1 pointer-events-none">
          <TrendingUp className="w-4 h-4" />
          +{trend.growthRate.toFixed(1)}%
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
          <h1 className="text-2xl font-bold text-white leading-tight mb-2">
            {trend.title}
          </h1>
          <FloatingTags tags={tags} />
        </div>
      </a>

      {/* Stats Bar */}
      <div className="px-4 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-white/60">
            <Eye className="w-4 h-4" />
            <span className="font-semibold text-white">{trend.views}</span>
            <span className="text-xs">views</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-white/60">
            <Users className="w-4 h-4" />
            <span className="font-semibold text-white">{trend.creators.toLocaleString()}</span>
            <span className="text-xs">creators</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-white/60">
            <Clock className="w-4 h-4" />
            <span className="text-xs">{trend.createdAt.toISOString().split("T")[0]}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 flex gap-2">
        <Button
          variant="outline"
          className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button
          variant="outline"
          className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
        >
          <Bookmark className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>

      {/* Description */}
      <div className="px-4 py-4">
        <p className="text-sm text-white/60 leading-relaxed">{trend.description}</p>
      </div>

      <AdSlot position="in-content" />

      {/* Analytics Section */}
      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-5 h-5 text-tiktok-cyan" />
          <h2 className="text-lg font-bold text-white">Signal Analysis</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Score cards */}
          <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
            <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Viral Score</span>
            <div className="text-2xl font-bold text-tiktok-cyan mt-1">{trend.viralScore?.toFixed(0) || 0}</div>
            <div className="text-[10px] text-white/30 mt-0.5">/100</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
            <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Opportunity</span>
            <div className="text-2xl font-bold text-green-400 mt-1">{trend.opportunityScore?.toFixed(0) || 0}</div>
            <div className="text-[10px] text-white/30 mt-0.5">/100</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
            <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Engagement</span>
            <div className="text-2xl font-bold text-purple-400 mt-1">{trend.engagement?.toFixed(0) || 0}</div>
            <div className="text-[10px] text-white/30 mt-0.5">/100</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
            <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Velocity</span>
            <div className="text-2xl font-bold text-yellow-400 mt-1">{trend.velocity?.toFixed(0) || 0}</div>
            <div className="text-[10px] text-white/30 mt-0.5">/100</div>
          </div>
        </div>

        {/* Progress bars */}
        <div className="space-y-3">
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Velocity</span>
              <span className="text-sm font-bold text-tiktok-cyan">{trend.velocity?.toFixed(0) || 0}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-tiktok-cyan to-tiktok-red rounded-full" style={{ width: `${Math.min(trend.velocity || 0, 100)}%` }} />
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Saturation</span>
              <span className="text-sm font-bold text-tiktok-red">{trend.saturation?.toFixed(0) || 0}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-tiktok-cyan to-tiktok-red rounded-full" style={{ width: `${Math.min(trend.saturation || 0, 100)}%` }} />
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Creator Fit</span>
              <span className="text-sm font-bold text-green-400">{trend.creatorFit?.toFixed(0) || 0}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-tiktok-cyan to-green-400 rounded-full" style={{ width: `${Math.min(trend.creatorFit || 0, 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Trend History Chart */}
        <TrendHistoryChart
          trendId={trend.slug}
          growthRate={trend.growthRate}
        />

        {/* Why it blows up + Action time */}
        {(trend.whyItBlowsUp || trend.actionTime) && (
          <div className="grid grid-cols-1 gap-3">
            {trend.whyItBlowsUp && (
              <div className="bg-gradient-to-r from-tiktok-cyan/5 to-transparent rounded-xl p-4 border border-tiktok-cyan/10">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-tiktok-cyan" />
                  <span className="text-[10px] font-medium text-tiktok-cyan uppercase tracking-wider">Why it blows up</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">{trend.whyItBlowsUp}</p>
              </div>
            )}
            {trend.actionTime && (
              <div className="bg-gradient-to-r from-tiktok-red/5 to-transparent rounded-xl p-4 border border-tiktok-red/10">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-tiktok-red" />
                  <span className="text-[10px] font-medium text-tiktok-red uppercase tracking-wider">Action required</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">{trend.actionTime}</p>
              </div>
            )}
          </div>
        )}

        {/* AI Prediction */}
        {trend.aiPrediction && (
          <div className="bg-purple-500/5 rounded-xl p-4 border border-purple-500/10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] font-medium text-purple-400 uppercase tracking-wider">AI Prediction</span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">{trend.aiPrediction}</p>
          </div>
        )}

        {/* Competition + Avg Views */}
        <div className="flex gap-3">
          {trend.competition && (
            <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5 text-center">
              <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Competition</span>
              <div className={`text-lg font-bold mt-1 ${
                trend.competition === "LOW" ? "text-green-400" :
                trend.competition === "MEDIUM" ? "text-yellow-400" : "text-tiktok-red"
              }`}>
                {trend.competition}
              </div>
            </div>
          )}
          {trend.avgViews && (
            <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5 text-center">
              <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Avg Views</span>
              <div className="text-lg font-bold text-white mt-1">{trend.avgViews}</div>
            </div>
          )}
        </div>
      </div>

      {/* Example Videos */}
      <div className="px-4 py-4">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-tiktok-red" />
          Example Videos
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
          {sectionVideos.map((video) => (
            <TikTokEmbed
              key={video.id}
              videoId={video.videoId}
              thumbnail={video.thumbnail}
              views={video.views}
              likes={video.likes}
              duration={video.duration}
            />
          ))}
        </div>
      </div>

      <AdSlot position="in-content" />

      {/* Related Trends */}
      {relatedTrends.length > 0 && (
        <div className="px-4 py-6">
          <h2 className="text-lg font-bold text-white mb-4">Related Signals</h2>
          <div className="space-y-3">
            {relatedTrends.map((t) => (
              <Link
                key={t.slug}
                href={`/trend/${t.slug}`}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/[0.07] transition-colors"
              >
                <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={t.thumbnail || "/placeholder-trend.png"} alt={t.title} fill className="object-cover" sizes="56px" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">{t.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-white/40 mt-0.5">
                    <span className="text-tiktok-cyan">+{t.growthRate.toFixed(1)}%</span>
                    <span>{t.views} views</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
