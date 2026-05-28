"use client";

import { useMemo, useState, useEffect } from "react";
import { TrendCard } from "@/components/trend-card";
import { useCountry } from "@/components/country-context";
import { Flame, ArrowUpRight, Loader2 } from "lucide-react";
import Link from "next/link";

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
        if (json.data) {
          setTrends(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch trends:", err);
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
