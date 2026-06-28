"use client";

import { useMemo, useState, useEffect } from "react";
import { TrendCard } from "@/components/trend-card";
import { useCountry } from "@/components/country-context";
import { Flame, ArrowUpRight, Loader2, ChevronDown, Sparkles, Target, Filter, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { trends as staticTrends } from "@/lib/data";
import { motion, AnimatePresence } from "framer-motion";

interface Trend {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  country?: string;
  growthRate: number;
  views: string;
  creators: number;
  thumbnail: string;
  isViral: boolean;
  isNew: boolean;
  velocity?: number;
  saturation?: number;
  creatorFit?: number;
  engagement?: number;
  avgViews?: string;
  competition?: string;
  viralScore?: number;
  opportunityScore?: number;
  whyItBlowsUp?: string;
  actionTime?: string;
  aiPrediction?: string;
  tags: string[];
}

const categories = ["All", "Dance", "Music", "Comedy", "Education", "Lifestyle", "Tech"];

export function TrendingPageContent() {
  const { selected: selectedCountry } = useCountry();
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"viralScore" | "opportunityScore" | "growthRate" | "velocity">("viralScore");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    async function fetchTrends() {
      setLoading(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(`/api/trends/?country=${selectedCountry.code}&limit=50`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setTrends(json.data);
        } else {
          setTrends(staticTrends.map(t => ({
            ...t,
            slug: t.id,
          })));
        }
      } catch (err) {
        console.error("Failed to fetch trends:", err);
        setTrends(staticTrends.map(t => ({
          ...t,
          slug: t.id,
        })));
      } finally {
        setLoading(false);
      }
    }

    fetchTrends();
  }, [selectedCountry.code]);

  const filteredTrends = useMemo(() => {
    let filtered = [...trends];
    if (selectedCategory !== "All") {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }
    return filtered.sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));
  }, [trends, sortBy, selectedCategory]);

  const viralTrends = useMemo(() =>
    filteredTrends.filter((t) => t.isViral).slice(0, 6),
    [filteredTrends]
  );

  const newTrends = useMemo(() =>
    filteredTrends.filter((t) => t.isNew).slice(0, 6),
    [filteredTrends]
  );

  const topOpportunities = useMemo(() =>
    filteredTrends
      .sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0))
      .slice(0, 8),
    [filteredTrends]
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Flame className="w-6 h-6 text-tiktok-red" />
              Trending Now
            </h1>
            <p className="text-sm text-white/40 mt-1">
              {selectedCountry.flag} {selectedCountry.name} — {trends.length} signals
            </p>
          </div>
          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="appearance-none bg-white/5 border border-white/10 text-white text-sm px-3 py-2 pr-8 rounded-xl focus:outline-none focus:border-tiktok-cyan cursor-pointer"
            >
              <option value="viralScore">Viral Score</option>
              <option value="opportunityScore">Opportunity</option>
              <option value="growthRate">Growth Rate</option>
              <option value="velocity">Velocity</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide"
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              selectedCategory === cat
                ? "bg-white text-black"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* AI Daily Insight */}
      <AnimatePresence mode="wait">
        {trends.length > 0 && (
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-tiktok-cyan" />
              <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider">AI Daily Insight</h2>
            </div>
            <div className="bg-gradient-to-r from-tiktok-cyan/20 via-tiktok-pink/20 to-tiktok-red/20 border border-white/10 rounded-2xl p-5">
              {(() => {
                const keywordCounts = new Map<string, { count: number; totalViews: number; velocity: number }>();
                const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now']);

                trends.forEach((t: Trend) => {
                  const title = t.title?.toLowerCase() || '';
                  const words = title.split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w) && !/^\d+$/.test(w));
                  const views = parseInt(t.views) || 0;
                  const velocity = t.velocity || 0;

                  words.forEach(word => {
                    const cleanWord = word.replace(/[^a-z]/g, '');
                    if (cleanWord.length > 3) {
                      const existing = keywordCounts.get(cleanWord);
                      if (existing) {
                        existing.count += 1;
                        existing.totalViews += views;
                        existing.velocity += velocity;
                      } else {
                        keywordCounts.set(cleanWord, { count: 1, totalViews: views, velocity });
                      }
                    }
                  });
                });

                const topKeyword = Array.from(keywordCounts.entries())
                  .sort((a, b) => (b[1].velocity + b[1].count * 10000) - (a[1].velocity + a[1].count * 10000))
                  .slice(0, 1)[0];

                if (!topKeyword) return <div className="text-white/40 text-sm py-2">No trending keywords detected</div>;

                const [keyword, data] = topKeyword;
                const avgVelocity = data.velocity / data.count;

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
                          {(data.totalViews / 1000000).toFixed(1)}M views
                        </span>
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {avgVelocity >= 1000 ? (avgVelocity / 1000).toFixed(1) + 'K' : Math.round(avgVelocity)}/day
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/hashtag/${keyword}`}
                      className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-black text-sm font-semibold rounded-xl hover:opacity-90 transition whitespace-nowrap"
                    >
                      <Target className="w-4 h-4" />
                      Explore Trend
                    </Link>
                  </div>
                );
              })()}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Viral section */}
      {viralTrends.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
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
                  publishedAt: new Date().toISOString().split("T")[0],
                }}
                index={i}
              />
            ))}
          </div>
        </motion.section>
      )}

      {/* New signals */}
      {newTrends.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-tiktok-cyan" />
              Fresh Signals
            </h2>
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
                  publishedAt: new Date().toISOString().split("T")[0],
                }}
                index={i}
                layout="horizontal"
              />
            ))}
          </div>
        </motion.section>
      )}

      {/* Top opportunities */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-green-400" />
            Top Opportunities
          </h2>
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
                publishedAt: new Date().toISOString().split("T")[0],
              }}
              index={i}
              layout="horizontal"
            />
          ))}
        </div>
      </motion.section>
    </div>
  );
}
