import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, Search, Hash, Users, ArrowRight,
  Flame, Sparkles, Target, BarChart3
} from "lucide-react";

// 30+ SEO keywords for TikTok
export const SEO_KEYWORDS = [
  // Viral Content
  { keyword: "viral-tiktok-videos", title: "Viral TikTok Videos", category: "viral" },
  { keyword: "tiktok-trending-now", title: "TikTok Trending Now", category: "trending" },
  { keyword: "how-to-go-viral-on-tiktok", title: "How to Go Viral on TikTok", category: "guide" },
  { keyword: "tiktok-viral-hacks", title: "TikTok Viral Hacks", category: "viral" },
  { keyword: "tiktok-algorithm-tips", title: "TikTok Algorithm Tips", category: "guide" },

  // Creator Growth
  { keyword: "tiktok-creator-growth", title: "TikTok Creator Growth", category: "growth" },
  { keyword: "tiktok-followers-guide", title: "TikTok Followers Guide", category: "growth" },
  { keyword: "tiktok-engagement-tips", title: "TikTok Engagement Tips", category: "growth" },
  { keyword: "tiktok-content-strategy", title: "TikTok Content Strategy", category: "strategy" },
  { keyword: "tiktok-growth-hacks", title: "TikTok Growth Hacks", category: "growth" },

  // Trends & Sounds
  { keyword: "tiktok-trending-sounds", title: "TikTok Trending Sounds", category: "trends" },
  { keyword: "tiktok-trending-hashtags", title: "TikTok Trending Hashtags", category: "trends" },
  { keyword: "tiktok-challenge-trends", title: "TikTok Challenge Trends", category: "trends" },
  { keyword: "tiktok-dance-trends", title: "TikTok Dance Trends", category: "trends" },
  { keyword: "tiktok-music-trends", title: "TikTok Music Trends", category: "trends" },

  // Analytics
  { keyword: "tiktok-analytics-tools", title: "TikTok Analytics Tools", category: "analytics" },
  { keyword: "tiktok-insights-guide", title: "TikTok Insights Guide", category: "analytics" },
  { keyword: "tiktok-performance-metrics", title: "TikTok Performance Metrics", category: "analytics" },
  { keyword: "tiktok-viral-score", title: "TikTok Viral Score", category: "analytics" },
  { keyword: "tiktok-account-analysis", title: "TikTok Account Analysis", category: "analytics" },

  // Marketing
  { keyword: "tiktok-marketing-guide", title: "TikTok Marketing Guide", category: "marketing" },
  { keyword: "tiktok-brand-promotion", title: "TikTok Brand Promotion", category: "marketing" },
  { keyword: "tiktok-influencer-marketing", title: "TikTok Influencer Marketing", category: "marketing" },
  { keyword: "tiktok-ad-strategy", title: "TikTok Ad Strategy", category: "marketing" },
  { keyword: "tiktok-viral-marketing", title: "TikTok Viral Marketing", category: "marketing" },

  // Niche Content
  { keyword: "tiktok-food-trends", title: "TikTok Food Trends", category: "niche" },
  { keyword: "tiktok-fashion-trends", title: "TikTok Fashion Trends", category: "niche" },
  { keyword: "tiktok-beauty-trends", title: "TikTok Beauty Trends", category: "niche" },
  { keyword: "tiktok-gaming-trends", title: "TikTok Gaming Trends", category: "niche" },
  { keyword: "tiktok-fitness-trends", title: "TikTok Fitness Trends", category: "niche" },
  { keyword: "tiktok-education-trends", title: "TikTok Education Trends", category: "niche" },
  { keyword: "tiktok-comedy-trends", title: "TikTok Comedy Trends", category: "niche" },
  { keyword: "tiktok-travel-trends", title: "TikTok Travel Trends", category: "niche" },
];

interface TopicPageProps {
  params: Promise<{ keyword: string }>;
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { keyword } = await params;
  const topic = SEO_KEYWORDS.find(t => t.keyword === keyword);

  if (!topic) {
    return { title: "Topic Not Found | TikTok Intelligence" };
  }

  return {
    title: `${topic.title} — TikTok Intelligence`,
    description: `Discover ${topic.title.toLowerCase()} analytics, trending data, and AI-powered insights. Track viral content and optimize your TikTok strategy.`,
    keywords: [topic.title, "TikTok", topic.category, "analytics", "trends", "viral"],
    openGraph: {
      title: topic.title,
      description: `AI-powered ${topic.title.toLowerCase()} analytics and insights`,
      type: "article",
    },
  };
}

export async function generateStaticParams() {
  return SEO_KEYWORDS.map((topic) => ({
    keyword: topic.keyword,
  }));
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { keyword } = await params;
  const topic = SEO_KEYWORDS.find(t => t.keyword === keyword);

  if (!topic) {
    notFound();
  }

  // Fetch related trends based on category
  const relatedTrends = await prisma.trend.findMany({
    where: {
      OR: [
        { category: topic.category },
        { title: { contains: topic.title.split(" ")[0], mode: "insensitive" } },
      ],
    },
    take: 6,
    orderBy: { viralScore: "desc" },
  });

  // Fetch related hashtags
  const relatedHashtags = await prisma.hashtag.findMany({
    where: {
      OR: [
        { category: topic.category },
        { name: { contains: topic.title.split(" ")[0].toLowerCase(), mode: "insensitive" } },
      ],
    },
    take: 8,
    orderBy: { views: "desc" },
  });

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-12">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-zinc-900 text-zinc-400 border-zinc-700">
            {topic.category.toUpperCase()}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {topic.title}
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Discover the latest {topic.title.toLowerCase()} analytics, trending data,
            and AI-powered insights to optimize your TikTok strategy.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
          <Card className="bg-zinc-900 border-zinc-800 p-4 text-center">
            <TrendingUp className="w-5 h-5 text-[#00f2ea] mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{relatedTrends.length}</div>
            <div className="text-xs text-zinc-500">Active Trends</div>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 p-4 text-center">
            <Hash className="w-5 h-5 text-[#ff0050] mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{relatedHashtags.length}</div>
            <div className="text-xs text-zinc-500">Related Tags</div>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 p-4 text-center">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {relatedTrends.filter(t => t.isViral).length}
            </div>
            <div className="text-xs text-zinc-500">Viral Now</div>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 p-4 text-center">
            <Sparkles className="w-5 h-5 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">AI</div>
            <div className="text-xs text-zinc-500">Powered</div>
          </Card>
        </div>

        {/* Trending in this category */}
        {relatedTrends.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-[#ff0050]" />
                Trending {topic.title}
              </h2>
              <Link href="/trending">
                <Button variant="ghost" className="text-zinc-400 hover:text-white">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedTrends.map((trend) => (
                <Link key={trend.id} href={`/trend/${trend.slug}`}>
                  <Card className="bg-zinc-900 border-zinc-800 overflow-hidden hover:border-zinc-700 transition-colors group">
                    <div className="aspect-video bg-zinc-800 relative">
                      {trend.thumbnail ? (
                        <img src={trend.thumbnail} alt={trend.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <TrendingUp className="w-8 h-8 text-zinc-600" />
                        </div>
                      )}
                      {trend.isViral && (
                        <div className="absolute top-2 right-2 bg-[#ff0050] text-white text-xs font-bold px-2 py-1 rounded">
                          VIRAL
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-white mb-1 group-hover:text-[#ff0050] transition-colors">
                        {trend.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span className="text-[#00f2ea]">+{trend.growthRate.toFixed(1)}%</span>
                        <span>{trend.views} views</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Hashtags */}
        {relatedHashtags.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Hash className="w-5 h-5 text-[#00f2ea]" />
              Popular Hashtags
            </h2>
            <div className="flex flex-wrap gap-2">
              {relatedHashtags.map((hashtag) => (
                <Link key={hashtag.id} href={`/hashtag/${hashtag.name}`}>
                  <Badge
                    variant="outline"
                    className="bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white px-3 py-1.5 text-sm cursor-pointer"
                  >
                    #{hashtag.name}
                    <span className="ml-2 text-zinc-500">{hashtag.views}</span>
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-[#ff0050]/10 to-[#00f2ea]/10 border-zinc-800 p-8 text-center">
          <BarChart3 className="w-12 h-12 text-[#ff0050] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Track {topic.title} in Real-Time
          </h2>
          <p className="text-zinc-400 mb-6 max-w-lg mx-auto">
            Get AI-powered alerts when new trends emerge. Stay ahead of the competition
            with TikTok Intelligence.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/explore">
              <Button className="bg-gradient-to-r from-[#ff0050] to-[#ff4080] hover:from-[#ff0040] hover:to-[#ff3070] text-white">
                Explore Trends
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800">
                View Analytics
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
