import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Eye, Users, Clock, Share2, Bookmark, Flame, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdSlot } from "@/components/ad-slot";
import { FloatingTags } from "@/components/floating-tags";
import { StructuredData } from "@/components/structured-data";
import { trends } from "@/lib/data";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const trend = trends.find((t) => t.id === id);
  if (!trend) return {};

  return {
    title: trend.title,
    description: trend.description,
    openGraph: {
      title: `${trend.title} | TikTok Intelligence`,
      description: trend.description,
      images: [{ url: trend.thumbnail, width: 600, height: 800, alt: trend.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: trend.title,
      description: trend.description,
      images: [trend.thumbnail],
    },
    alternates: {
      canonical: `https://tiktok-intelligence.com/trend/${id}`,
    },
  };
}

export async function generateStaticParams() {
  return trends.map((t) => ({ id: t.id }));
}

export default async function TrendPage({ params }: Props) {
  const { id } = await params;
  const trend = trends.find((t) => t.id === id);
  if (!trend) notFound();

  const relatedTrends = trends.filter((t) => t.category === trend.category && t.id !== trend.id).slice(0, 3);

  const articleData = {
    headline: trend.title,
    description: trend.description,
    image: trend.thumbnail,
    datePublished: trend.publishedAt,
    dateModified: trend.publishedAt,
    author: {
      "@type": "Organization",
      name: "TikTok Intelligence",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://tiktok-intelligence.com/trend/${id}`,
    },
  };

  const breadcrumbData = {
    items: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://tiktok-intelligence.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: trend.category,
        item: `https://tiktok-intelligence.com/explore?category=${trend.category}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: trend.title,
        item: `https://tiktok-intelligence.com/trend/${id}`,
      },
    ],
  };

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
            {trend.isNew && !trend.isViral && (
              <span className="flex items-center gap-1 text-tiktok-cyan text-[10px] font-bold uppercase">
                <Sparkles className="w-3 h-3" /> New
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative aspect-[4/5] w-full">
        <Image
          src={trend.thumbnail}
          alt={trend.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 512px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-tiktok-black via-transparent to-transparent" />

        {/* Growth badge */}
        <div className="absolute top-4 right-4 bg-tiktok-cyan/90 backdrop-blur-sm text-tiktok-black text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          +{trend.growthRate}%
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h1 className="text-2xl font-bold text-white leading-tight mb-2">
            {trend.title}
          </h1>
          <FloatingTags tags={trend.tags} />
        </div>
      </div>

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
            <span className="text-xs">{trend.publishedAt}</span>
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

      {/* Analysis Section */}
      <div className="px-4 py-4 space-y-4">
        <h2 className="text-lg font-bold text-white">Signal Analysis</h2>
        <div className="space-y-3">
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Velocity</span>
              <span className="text-sm font-bold text-tiktok-cyan">High</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-[85%] bg-gradient-to-r from-tiktok-cyan to-tiktok-red rounded-full" />
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Saturation</span>
              <span className="text-sm font-bold text-tiktok-red">Low</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-[25%] bg-gradient-to-r from-tiktok-cyan to-tiktok-red rounded-full" />
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Creator Fit</span>
              <span className="text-sm font-bold text-green-400">Broad</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-[72%] bg-gradient-to-r from-tiktok-cyan to-green-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Related Trends */}
      {relatedTrends.length > 0 && (
        <div className="px-4 py-6">
          <h2 className="text-lg font-bold text-white mb-4">Related Signals</h2>
          <div className="space-y-3">
            {relatedTrends.map((t) => (
              <Link
                key={t.id}
                href={`/trend/${t.id}`}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/[0.07] transition-colors"
              >
                <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={t.thumbnail} alt={t.title} fill className="object-cover" sizes="56px" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">{t.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-white/40 mt-0.5">
                    <span className="text-tiktok-cyan">+{t.growthRate}%</span>
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
