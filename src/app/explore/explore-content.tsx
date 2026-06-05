"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { TrendCard } from "@/components/trend-card";
import { useCountry } from "@/components/country-context";
import { ExploreTabs } from "@/components/explore-tabs";
import { Search, SlidersHorizontal, X, Loader2, Flame, Users, Hash, Music } from "lucide-react";
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

interface CreatorData {
  id: string;
  username: string;
  displayName: string;
  avatar?: string | null;
  followers: number;
  niche?: string | null;
  momentumScore?: number | null;
  isVerified?: boolean;
}

interface HashtagData {
  id: string;
  name: string;
  views: string;
  videos: number;
  growthRate: number;
  category?: string | null;
  isRising?: boolean;
  viralScore?: number | null;
}

interface SoundData {
  id: string;
  title: string;
  author?: string | null;
  thumbnail?: string | null;
  uses: number;
  growthRate: number;
  isViral?: boolean;
  viralScore?: number | null;
  trendingSince?: Date | null;
}

const mainTabs = [
  { id: "trends", label: "Trends", icon: Flame },
  { id: "creators", label: "Creators", icon: Users },
  { id: "hashtags", label: "Hashtags", icon: Hash },
  { id: "sounds", label: "Sounds", icon: Music },
];

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
  const [activeTab, setActiveTab] = useState("trends");
  const [searchQuery, setSearchQuery] = useState("");
  const [trends, setTrends] = useState<Trend[]>([]);
  const [creators, setCreators] = useState<CreatorData[]>([]);
  const [hashtags, setHashtags] = useState<HashtagData[]>([]);
  const [sounds, setSounds] = useState<SoundData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch trends
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

    if (activeTab === "trends") {
      fetchTrends();
    }
  }, [selectedCountry.code, categoryFilter, activeTab]);

  // Fetch creators
  useEffect(() => {
    async function fetchCreators() {
      setLoading(true);
      try {
        const res = await fetch(`/api/creators?country=${selectedCountry.code}&limit=50`);
        const json = await res.json();
        if (json.data) {
          setCreators(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch creators:", err);
      } finally {
        setLoading(false);
      }
    }

    if (activeTab === "creators") {
      fetchCreators();
    }
  }, [selectedCountry.code, activeTab]);

  // Fetch hashtags
  useEffect(() => {
    async function fetchHashtags() {
      setLoading(true);
      try {
        const res = await fetch(`/api/hashtags?country=${selectedCountry.code}&limit=50`);
        const json = await res.json();
        if (json.data) {
          setHashtags(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch hashtags:", err);
      } finally {
        setLoading(false);
      }
    }

    if (activeTab === "hashtags") {
      fetchHashtags();
    }
  }, [selectedCountry.code, activeTab]);

  // Fetch sounds
  useEffect(() => {
    async function fetchSounds() {
      setLoading(true);
      try {
        const res = await fetch(`/api/sounds?country=${selectedCountry.code}&limit=50`);
        const json = await res.json();
        if (json.data) {
          setSounds(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch sounds:", err);
      } finally {
        setLoading(false);
      }
    }

    if (activeTab === "sounds") {
      fetchSounds();
    }
  }, [selectedCountry.code, activeTab]);

  const filteredTrends = trends.filter((t) => {
    if (tagFilter) {
      const tagLower = tagFilter.toLowerCase();
      if (!t.tags.some((tag) => tag.tag.name.toLowerCase().includes(tagLower)) &&
          !t.title.toLowerCase().includes(tagLower)) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.tag.name.toLowerCase().includes(q)) ||
        t.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeFilters = [
    tagFilter && { type: "tag", value: tagFilter, label: `#${tagFilter}` },
    categoryFilter && categoryFilter !== "All" && { type: "category", value: categoryFilter, label: categoryFilter },
  ].filter(Boolean) as { type: string; value: string; label: string }[];

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-12">
      {/* Header */}
      <div className="space-y-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Explore</h1>
          <p className="text-sm text-white/40 mt-1">
            Discover trends, creators, hashtags, and viral sounds
          </p>
        </div>

        {/* Main Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id ? "text-white" : "text-white/50 hover:text-white/70"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeMainTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-tiktok-cyan"
                />
              )}
            </button>
          ))}
        </div>

        {/* Search (only for trends tab) */}
        {activeTab === "trends" && (
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
        )}

        {/* Active filters */}
        {(activeFilters.length > 0 || searchQuery) && activeTab === "trends" && (
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

        {/* Category Filters (only for trends) */}
        {activeTab === "trends" && (
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
        )}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "trends" && (
          <>
            {loading ? (
              <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-tiktok-cyan animate-spin" />
                <p className="text-white/60 text-sm">Loading trends...</p>
              </div>
            ) : filteredTrends.length > 0 ? (
              <div className="space-y-4 max-w-lg mx-auto">
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
          </>
        )}

        {activeTab === "creators" && (
          <>
            {loading ? (
              <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-tiktok-cyan animate-spin" />
                <p className="text-white/60 text-sm">Loading creators...</p>
              </div>
            ) : creators.length > 0 ? (
              <ExploreTabs
                creators={creators}
                hashtags={[]}
                sounds={[]}
                activeTab="creators"
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-white/40 text-sm">No creators found for {selectedCountry.name}.</p>
              </div>
            )}
          </>
        )}

        {activeTab === "hashtags" && (
          <>
            {loading ? (
              <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-tiktok-cyan animate-spin" />
                <p className="text-white/60 text-sm">Loading hashtags...</p>
              </div>
            ) : hashtags.length > 0 ? (
              <ExploreTabs
                creators={[]}
                hashtags={hashtags}
                sounds={[]}
                activeTab="hashtags"
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-white/40 text-sm">No hashtags found for {selectedCountry.name}.</p>
              </div>
            )}
          </>
        )}

        {activeTab === "sounds" && (
          <>
            {loading ? (
              <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-tiktok-cyan animate-spin" />
                <p className="text-white/60 text-sm">Loading sounds...</p>
              </div>
            ) : sounds.length > 0 ? (
              <ExploreTabs
                creators={[]}
                hashtags={[]}
                sounds={sounds}
                activeTab="sounds"
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-white/40 text-sm">No sounds found for {selectedCountry.name}.</p>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
