"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { TrendCard } from "@/components/trend-card";
import { useCountry } from "@/components/country-context";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
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

const categories = [
  "All",
  "Dance",
  "Tech",
  "Editing",
  "Lifestyle",
  "Food",
  "Social",
  "DIY",
  "Entertainment",
];

export default function ExploreContent() {
  const { selected: selectedCountry } = useCountry();
  const searchParams = useSearchParams();
  const tagFilter = searchParams.get("tag");
  const categoryFilter = searchParams.get("category");
  const [searchQuery, setSearchQuery] = useState("");
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrends() {
      setLoading(true);
      try {
        let url = `/api/trends?country=${selectedCountry.code}&limit=100`;
        if (categoryFilter && categoryFilter !== "All") {
          url += `&category=${categoryFilter}`;
        }
        const res = await fetch(url);
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
  }, [selectedCountry.code, categoryFilter]);

  const filteredTrends = useMemo(() => {
    let result = [...trends];

    if (tagFilter) {
      const tagLower = tagFilter.toLowerCase();
      result = result.filter((t) =>
        t.tags.some((tag) => tag.tag.name.toLowerCase().includes(tagLower)) ||
        t.title.toLowerCase().includes(tagLower)
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.tag.name.toLowerCase().includes(q)) ||
        t.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [trends, tagFilter, searchQuery]);

  const activeFilters = [
    tagFilter && { type: "tag", value: tagFilter, label: `#${tagFilter}` },
    categoryFilter && categoryFilter !== "All" && { type: "category", value: categoryFilter, label: categoryFilter },
  ].filter(Boolean) as { type: string; value: string; label: string }[];

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6 pb-12 min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-tiktok-cyan animate-spin" />
        <p className="text-white/60 text-sm">Loading trends...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-12">
      {/* Header */}
      <div className="space-y-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Explore</h1>
          <p className="text-sm text-white/40 mt-1">
            {selectedCountry.flag} {selectedCountry.name} — {filteredTrends.length} signals
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trends, creators, hashtags..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-tiktok-cyan/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Active filters */}
        {(activeFilters.length > 0 || searchQuery) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Filtered by:</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center gap-1 bg-white/10 text-white text-xs font-medium px-2.5 py-1 rounded-full hover:bg-white/15 transition-colors"
              >
                &quot;{searchQuery}&quot;
                <X className="w-3 h-3" />
              </button>
            )}
            {activeFilters.map((filter) => (
              <Link
                key={filter.type + filter.value}
                href="/explore"
                className="inline-flex items-center gap-1 bg-tiktok-cyan/10 text-tiktok-cyan text-xs font-medium px-2.5 py-1 rounded-full hover:bg-tiktok-cyan/20 transition-colors"
              >
                {filter.label}
                <X className="w-3 h-3" />
              </Link>
            ))}
          </div>
        )}

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button className="flex items-center gap-1.5 bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap">
            <SlidersHorizontal className="w-3 h-3" />
            Filters
          </button>
          {categories.map((cat) => {
            const isActive = categoryFilter?.toLowerCase() === cat.toLowerCase();
            return (
              <Link
                key={cat}
                href={isActive ? "/explore" : `/explore?category=${encodeURIComponent(cat)}`}
                className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-white text-tiktok-black"
                    : cat === "All" && !categoryFilter
                    ? "bg-white text-tiktok-black"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Trend Grid */}
      {filteredTrends.length > 0 ? (
        <div className="space-y-4">
          {filteredTrends.map((trend, i) => (
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
      ) : (
        <div className="text-center py-12">
          <p className="text-white/40 text-sm">No trends match your filters.</p>
          <button
            onClick={() => setSearchQuery("")}
            className="text-tiktok-cyan text-sm hover:underline mt-2 inline-block"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
