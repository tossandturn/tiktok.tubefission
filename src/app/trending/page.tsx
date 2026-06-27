"use client";

import { useMemo, useState, useEffect } from "react";
import { TrendCard } from "@/components/trend-card";
import { useCountry } from "@/components/country-context";
import { Flame, ArrowUpRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { trends as staticTrends } from "@/lib/data";

interface Trend {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  country: string;
  growthRate: number;
  views: string;
  creators: number;
  thumbnail: string;
  isViral: boolean;
  isNew: boolean;
  velocity: number;
  saturation: number;
  creatorFit: number;
  engagement: number;
  avgViews: string;
  competition: string;
  viralScore: number;
  opportunityScore: number;
  whyItBlowsUp?: string;
  actionTime?: string;
  aiPrediction?: string;
  tags: { tag: { name: string } }[];
}

export default function TrendingPage() {
  const { selected: selectedCountry } = useCountry();
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrends() {
      setLoading(true);
      try {
        const res = await fetch(`/api/trends?country=${selectedCountry.code}&limit=50`);
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setTrends(json.data);
        } else {
          // Fallback to static data
          setTrends(staticTrends.map(t => ({
            ...t,
            slug: t.id,
            tags: t.tags?.map((tag: string) => ({ tag: { name: tag.replace('#', '') } })) || [],
          })));
        }
      } catch {
        // API unavailable — use static data
        setTrends(staticTrends.map(t => ({
          ...t,
          slug: t.id,
          tags: t.tags?.map((tag: string) => ({ tag: { name: tag.replace('#', '') } })) || [],
        })));
      } finally {
        setLoading(false);
      }
    }

    fetchTrends();
  }, [selectedCountry.code]);

  const viralTrends = useMemo(() =>
    [...trends]
      .filter((t) => t.isViral)
      .sort((a, b) => (b.viralScore || 0) - (a.viralScore || 0)),
    [trends]
  );

  const newTrends = useMemo(() =>
    [...trends]
      .filter((t) => t.isNew)
      .sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0)),
    [trends]
  );

  const topOpportunities = useMemo(() =>
    [...trends]
      .sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0))
      .slice(0, 10),
    [trends]
  );

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6 pb-12 min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-tiktok-cyan animate-spin" />
        <p className="text-white/60 text-sm">Loading trending...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-12">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Flame className="w-6 h-6 text-tiktok-red" />
          Trending Now
        </h1>
        <p className="text-sm text-white/40 mt-1">
          {selectedCountry.flag} {selectedCountry.name} — {trends.length} signals
        </p>
      </div>

      {/* Today's Keyword */}
      {trends.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🔥</span>
            <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider">Today&apos;s Keyword</h2>
          </div>
          <div className="bg-gradient-to-r from-tiktok-cyan/20 via-tiktok-pink/20 to-tiktok-red/20 border border-white/10 rounded-2xl p-5">
            {(() => {
              // Extract trending keywords from trend titles
              const keywordCounts = new Map<string, { count: number; totalViews: number; velocity: number }>()
              const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now'])

              trends.forEach((t: Trend) => {
                const title = t.title?.toLowerCase() || ''
                const words = title.split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w) && !/^\d+$/.test(w))
                const views = parseInt(t.views) || 0
                const velocity = t.velocity || 0

                words.forEach(word => {
                  const cleanWord = word.replace(/[^a-z]/g, '')
                  if (cleanWord.length > 3) {
                    const existing = keywordCounts.get(cleanWord)
                    if (existing) {
                      existing.count += 1
                      existing.totalViews += views
                      existing.velocity += velocity
                    } else {
                      keywordCounts.set(cleanWord, { count: 1, totalViews: views, velocity })
                    }
                  }
                })
              })

              // Get top keyword by weighted score
              const topKeyword = Array.from(keywordCounts.entries())
                .sort((a, b) => (b[1].velocity + b[1].count * 10000) - (a[1].velocity + a[1].count * 10000))
                .slice(0, 1)[0]

              if (!topKeyword) return <div className="text-white/40 text-sm py-2">No trending keywords detected</div>

              const [keyword, data] = topKeyword
              const avgVelocity = data.velocity / data.count

              return (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <Link
                      href={`/hashtag/${keyword}`}
                      className="group inline-flex items-center gap-2"
                    >
                      <span className="text-2xl font-black bg-gradient-to-r from-tiktok-cyan to-tiktok-pink bg-clip-text text-transparent">
                        #{keyword.charAt(0).toUpperCase() + keyword.slice(1)}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-tiktok-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full">
                        {data.count} trends
                      </span>
                      <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full">
                        {(parseInt(data.totalViews.toString()) / 1000000).toFixed(1)}M views
                      </span>
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                        ⚡ {avgVelocity >= 1000 ? (avgVelocity / 1000).toFixed(1) + 'K' : Math.round(avgVelocity)}/day
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/hashtag/${keyword}`}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-black text-sm font-semibold rounded-xl hover:opacity-90 transition whitespace-nowrap"
                  >
                    Explore
                  </Link>
                </div>
              )
            })()}
          </div>
        </section>
      )}

      {/* Viral section */}
      {viralTrends.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-tiktok-red" />
              Going Viral
            </h2>
            <span className="text-[10px] font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
              {viralTrends.length}
            </span>
          </div>
          <div className="space-y-4">
            {viralTrends.map((trend, i) => (
              <TrendCard
                key={trend.slug}
                trend={{
                  ...trend,
                  id: trend.slug,
                  tags: trend.tags.map((t) => `#${t.tag.name}`),
                  publishedAt: new Date().toISOString().split("T")[0],
                }}
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      {/* New signals */}
      {newTrends.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Fresh Signals</h2>
            <span className="text-[10px] font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
              {newTrends.length}
            </span>
          </div>
          <div className="space-y-4">
            {newTrends.map((trend, i) => (
              <TrendCard
                key={trend.slug}
                trend={{
                  ...trend,
                  id: trend.slug,
                  tags: trend.tags.map((t) => `#${t.tag.name}`),
                  publishedAt: new Date().toISOString().split("T")[0],
                }}
                index={i}
                layout="horizontal"
              />
            ))}
          </div>
        </section>
      )}

      {/* Top opportunities */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Top Opportunities</h2>
          <Link
            href="/explore"
            className="text-xs text-tiktok-cyan hover:underline flex items-center gap-0.5"
          >
            Explore all <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-4">
          {topOpportunities.map((trend, i) => (
            <TrendCard
              key={trend.slug}
              trend={{
                ...trend,
                id: trend.slug,
                tags: trend.tags.map((t) => `#${t.tag.name}`),
                publishedAt: new Date().toISOString().split("T")[0],
              }}
              index={i}
              layout="horizontal"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
