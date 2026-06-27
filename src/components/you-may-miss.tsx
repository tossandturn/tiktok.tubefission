"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { TrendingUp, Eye, Clock, Sparkles, Users, Hash, Music, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCountry } from "@/components/country-context";
import { trends as staticTrends, featuredCreators } from "@/lib/data";

interface MissedItem {
  id: string;
  type: "trend" | "creator" | "hashtag" | "sound";
  title: string;
  subtitle: string;
  growthRate: number;
  views?: string;
  reason: string;
  thumbnail?: string;
  slug?: string;
}

interface TrendData {
  id: string;
  title: string;
  category?: string;
  growthRate: number;
  views?: string;
  isNew?: boolean;
  thumbnail?: string;
  slug?: string;
}

interface CreatorData {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  niche?: string;
  predictedGrowth7d?: number;
  momentumScore?: number;
}

interface HashtagData {
  id: string;
  name: string;
  videos?: number;
  views?: string;
  growthRate: number;
  isRising?: boolean;
}

interface ApiResponse<T> {
  data: T[];
  meta?: { total: number; limit: number; offset: number };
}

export function YouMayMiss() {
  const { selected } = useCountry();
  const [items, setItems] = useState<MissedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMissedContent() {
      setLoading(true);
      try {
        // Fetch data from API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const [trendsRes, creatorsRes, hashtagsRes] = await Promise.all([
          fetch(`/api/trends/?country=${selected.code}&limit=3&rising=true`, {
            signal: controller.signal,
          }),
          fetch(`/api/creators/?country=${selected.code}&limit=2&rising=true`, {
            signal: controller.signal,
          }),
          fetch(`/api/hashtags/?country=${selected.code}&limit=3&rising=true`, {
            signal: controller.signal,
          }),
        ]);
        clearTimeout(timeoutId);

        // Check if responses are OK
        if (!trendsRes.ok || !creatorsRes.ok || !hashtagsRes.ok) {
          throw new Error("One or more API requests failed");
        }

        const trendsData: ApiResponse<TrendData> = await trendsRes.json();
        const creatorsData: ApiResponse<CreatorData> = await creatorsRes.json();
        const hashtagsData: ApiResponse<HashtagData> = await hashtagsRes.json();

        const missedItems: MissedItem[] = [
          // Rising trends with high potential
          ...(trendsData.data || []).slice(0, 3).map((t) => ({
            id: t.id,
            type: "trend" as const,
            title: t.title,
            subtitle: t.category || "Trending",
            growthRate: t.growthRate,
            views: t.views,
            reason: t.isNew ? "Just started trending" : "Rising fast",
            thumbnail: t.thumbnail,
            slug: t.slug,
          })),
          // Rising creators
          ...(creatorsData.data || []).slice(0, 2).map((c) => ({
            id: c.id,
            type: "creator" as const,
            title: c.displayName || c.username,
            subtitle: c.niche || "Creator",
            growthRate: c.predictedGrowth7d || c.momentumScore || 0,
            reason: "Momentum rising",
            thumbnail: c.avatar,
            slug: c.username,
          })),
          // Rising hashtags
          ...(hashtagsData.data || []).slice(0, 3).map((h) => ({
            id: h.id,
            type: "hashtag" as const,
            title: `#${h.name}`,
            subtitle: `${h.videos?.toLocaleString() || 0} videos`,
            growthRate: h.growthRate,
            views: h.views,
            reason: h.isRising ? "Exploding now" : "Steady growth",
            slug: h.name,
          })),
        ];

        // Sort by growth rate
        missedItems.sort((a, b) => b.growthRate - a.growthRate);
        setItems(missedItems.slice(0, 6));
      } catch (error) {
        console.error("Failed to fetch missed content:", error);
        // Fallback to static data
        const staticItems: MissedItem[] = [
          ...staticTrends.slice(0, 4).map((t) => ({
            id: t.id,
            type: "trend" as const,
            title: t.title,
            subtitle: t.category || "Trending",
            growthRate: t.growthRate,
            views: t.views,
            reason: t.isNew ? "Just started trending" : "Rising fast",
            thumbnail: t.thumbnail,
            slug: t.id,
          })),
          ...featuredCreators.slice(0, 2).map((c) => ({
            id: c.id,
            type: "creator" as const,
            title: c.name,
            subtitle: c.niche || "Creator",
            growthRate: 15,
            reason: "Momentum rising",
            thumbnail: c.avatar,
            slug: c.name.toLowerCase().replace(/\s+/g, ""),
          })),
        ];
        setItems(staticItems);
      } finally {
        setLoading(false);
      }
    }

    fetchMissedContent();
  }, [selected.code]);

  const getIcon = (type: string) => {
    switch (type) {
      case "trend":
        return <TrendingUp className="w-4 h-4" />;
      case "creator":
        return <Users className="w-4 h-4" />;
      case "hashtag":
        return <Hash className="w-4 h-4" />;
      case "sound":
        return <Music className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getLink = (item: MissedItem) => {
    switch (item.type) {
      case "trend":
        return `/trend/${item.slug}`;
      case "creator":
        return `/creator/${item.slug}`;
      case "hashtag":
        return `/hashtag/${encodeURIComponent(item.slug || item.title.replace("#", ""))}`;
      default:
        return "#";
    }
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-b from-black via-zinc-950 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">You May Miss</h2>
              <p className="text-white/50 text-sm">Trends you might have overlooked today</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 h-32 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-black via-zinc-950 to-black">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">You May Miss</h2>
              <p className="text-white/50 text-sm flex items-center gap-2">
                <Clock className="w-3 h-3" />
                {selected.flag} {selected.name} — Updated just now
              </p>
            </div>
          </div>
          <Link
            href="/explore"
            className="text-sm text-tiktok-cyan hover:text-tiktok-pink transition-colors flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={getLink(item)}>
                <div className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-tiktok-cyan/30 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-tiktok-cyan/10">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-tiktok-cyan/5 to-tiktok-pink/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative flex items-start gap-4">
                    {/* Thumbnail or Icon */}
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-900">
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 text-white/60">
                          {getIcon(item.type)}
                        </div>
                      )}
                      {/* Type Badge */}
                      <div className="absolute top-0 right-0 p-1">
                        <div className="w-5 h-5 rounded-full bg-black/60 backdrop-blur flex items-center justify-center">
                          {getIcon(item.type)}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm truncate group-hover:text-tiktok-cyan transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-white/40 text-xs mt-0.5">{item.subtitle}</p>

                      {/* Growth & Reason */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-green-400 text-xs font-medium">
                          +{item.growthRate.toFixed(1)}%
                        </span>
                        <span className="text-white/30 text-xs">•</span>
                        <span className="text-amber-400 text-xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {item.reason}
                        </span>
                      </div>

                      {item.views && (
                        <p className="text-white/30 text-xs mt-1">{item.views} views</p>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4 text-tiktok-cyan" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <p className="text-white/40 text-sm">
            Don&apos;t miss tomorrow&apos;s viral trends —
            <Link href="/analytics" className="text-tiktok-cyan hover:underline ml-1">
              check AI predictions
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
