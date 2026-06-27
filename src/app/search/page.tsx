"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, TrendingUp, Hash, User, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";

interface SearchResult {
  trends: Array<{
    id: string;
    slug: string;
    title: string;
    description: string;
    category: string;
    growthRate: number;
    views: string;
    thumbnail: string;
    isViral: boolean;
    viralScore?: number;
  }>;
  hashtags: Array<{
    id: string;
    name: string;
    views: string;
    growthRate: number;
  }>;
  creators: Array<{
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
    followers: number;
    niche?: string;
  }>;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "trends" | "hashtags" | "creators">("all");

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=20`);
      if (res.ok) {
        const json = await res.json();
        setResults(json.data);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      performSearch(query);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, performSearch]);

  const hasResults = results && (
    results.trends.length > 0 ||
    results.hashtags.length > 0 ||
    results.creators.length > 0
  );

  const filteredTrends = activeTab === "all" || activeTab === "trends" ? results?.trends : [];
  const filteredHashtags = activeTab === "all" || activeTab === "hashtags" ? results?.hashtags : [];
  const filteredCreators = activeTab === "all" || activeTab === "creators" ? results?.creators : [];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white mb-4"
          >
            Search TikTok Intelligence
          </motion.h1>

          {/* Search Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-white/40" />
              <Input
                type="text"
                placeholder="Search trends, hashtags, or creators..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-6 text-lg bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-full focus:border-tiktok-cyan focus:ring-tiktok-cyan/20"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-4 text-white/40 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section className="pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Tabs */}
          {hasResults && (
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
              {[
                { id: "all", label: "All", count: (results?.trends.length || 0) + (results?.hashtags.length || 0) + (results?.creators.length || 0) },
                { id: "trends", label: "Trends", count: results?.trends.length || 0 },
                { id: "hashtags", label: "Hashtags", count: results?.hashtags.length || 0 },
                { id: "creators", label: "Creators", count: results?.creators.length || 0 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-tiktok-cyan text-black"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-tiktok-cyan animate-spin mb-4" />
              <p className="text-white/40">Searching...</p>
            </div>
          )}

          {/* No Results */}
          {!loading && query.length >= 2 && !hasResults && (
            <div className="text-center py-12">
              <p className="text-white/40">No results found for &quot;{query}&quot;</p>
              <p className="text-white/20 text-sm mt-2">Try different keywords</p>
            </div>
          )}

          {/* Results Grid */}
          {!loading && hasResults && (
            <div className="space-y-8">
              {/* Trends */}
              {filteredTrends && filteredTrends.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-tiktok-cyan" />
                    Trends ({filteredTrends.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTrends.map((trend) => (
                      <Link
                        key={trend.id}
                        href={`/trend/${trend.slug}`}
                        className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/[0.07] transition-colors"
                      >
                        <div className="relative aspect-video">
                          <Image
                            src={trend.thumbnail || "/placeholder-trend.png"}
                            alt={trend.title}
                            fill
                            className="object-cover"
                          />
                          {trend.isViral && (
                            <span className="absolute top-2 right-2 px-2 py-1 bg-tiktok-red text-white text-xs font-bold rounded">
                              VIRAL
                            </span>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-white truncate group-hover:text-tiktok-cyan transition-colors">
                            {trend.title}
                          </h3>
                          <p className="text-sm text-white/40 mt-1 line-clamp-2">
                            {trend.description}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-white/40">
                            <span>{trend.views} views</span>
                            <span className="text-tiktok-cyan">+{trend.growthRate}%</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Hashtags */}
              {filteredHashtags && filteredHashtags.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Hash className="w-5 h-5 text-tiktok-pink" />
                    Hashtags ({filteredHashtags.length})
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {filteredHashtags.map((hashtag) => (
                      <Link
                        key={hashtag.id}
                        href={`/hashtag/${hashtag.name}`}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white/10 hover:text-tiktok-cyan transition-colors"
                      >
                        #{hashtag.name}
                        <span className="text-white/40 ml-2 text-sm">{hashtag.views}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Creators */}
              {filteredCreators && filteredCreators.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-400" />
                    Creators ({filteredCreators.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCreators.map((creator) => (
                      <Link
                        key={creator.id}
                        href={`/creator/${creator.username}`}
                        className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/[0.07] transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                          {creator.avatar ? (
                            <Image
                              src={creator.avatar}
                              alt={creator.displayName}
                              width={48}
                              height={48}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-white/40" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{creator.displayName}</h3>
                          <p className="text-sm text-white/40">@{creator.username}</p>
                          {creator.niche && (
                            <span className="text-xs text-tiktok-cyan">{creator.niche}</span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-white/60">
                            {(creator.followers / 1000000).toFixed(1)}M
                          </span>
                          <span className="text-xs text-white/40 block">followers</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State - No query */}
          {!query && !loading && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/40">Enter a keyword to search</p>
              <p className="text-white/20 text-sm mt-2">
                Try: dance, cooking, fitness, gaming, etc.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
