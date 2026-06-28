"use client";

import { useMemo, useState, useEffect } from "react";
import { useCountry } from "@/components/country-context";
import { Users, Loader2, ChevronDown, TrendingUp, Verified, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

interface Creator {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  followers: number;
  niche: string | null;
  momentumScore: number | null;
  predictedGrowth7d: number | null;
  isVerified: boolean;
}

export default function CreatorsPage() {
  const { selected: selectedCountry } = useCountry();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"momentum" | "followers" | "growth">("momentum");

  useEffect(() => {
    async function fetchCreators() {
      setLoading(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(`/api/creators/?country=${selectedCountry.code}&limit=50`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setCreators(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch creators:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCreators();
  }, [selectedCountry.code]);

  const sortedCreators = useMemo(() => {
    const sorted = [...creators];
    switch (sortBy) {
      case "followers":
        return sorted.sort((a, b) => b.followers - a.followers);
      case "growth":
        return sorted.sort((a, b) => (b.predictedGrowth7d || 0) - (a.predictedGrowth7d || 0));
      case "momentum":
      default:
        return sorted.sort((a, b) => (b.momentumScore || 0) - (a.momentumScore || 0));
    }
  }, [creators, sortBy]);

  const formatFollowers = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-12 min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-tiktok-cyan animate-spin" />
        <p className="text-white/60 text-sm">Loading creators...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Users className="w-8 h-8 text-tiktok-cyan" />
                Top Creators
              </h1>
              <p className="text-sm text-white/40 mt-2">
                {selectedCountry.flag} {selectedCountry.name} — {creators.length} creators
              </p>
            </div>
            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none bg-white/5 border border-white/10 text-white text-sm px-4 py-2 pr-10 rounded-xl focus:outline-none focus:border-tiktok-cyan cursor-pointer"
              >
                <option value="momentum">Momentum Score</option>
                <option value="followers">Followers</option>
                <option value="growth">Growth Rate</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Creators Grid */}
        {sortedCreators.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/40">No creators found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedCreators.map((creator, index) => (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/creator/${creator.username}`}
                  className="group block p-5 bg-white/[0.02] border border-white/10 rounded-2xl hover:border-tiktok-cyan/50 hover:bg-white/[0.04] transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white/5 flex-shrink-0">
                      {creator.avatar ? (
                        <Image
                          src={creator.avatar}
                          alt={creator.displayName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                          <Users className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white truncate group-hover:text-tiktok-cyan transition-colors">
                          {creator.displayName}
                        </h3>
                        {creator.isVerified && (
                          <Verified className="w-4 h-4 text-tiktok-cyan flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-white/40">@{creator.username}</p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-3">
                        <div>
                          <p className="text-lg font-bold text-white">{formatFollowers(creator.followers)}</p>
                          <p className="text-xs text-white/40">followers</p>
                        </div>
                        {creator.momentumScore && (
                          <div>
                            <p className="text-lg font-bold text-tiktok-pink">{creator.momentumScore.toFixed(0)}</p>
                            <p className="text-xs text-white/40">momentum</p>
                          </div>
                        )}
                        {creator.predictedGrowth7d && (
                          <div>
                            <p className="text-lg font-bold text-green-400 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              +{creator.predictedGrowth7d.toFixed(0)}%
                            </p>
                            <p className="text-xs text-white/40">7d growth</p>
                          </div>
                        )}
                      </div>

                      {/* Niche */}
                      {creator.niche && (
                        <span className="inline-block mt-3 text-xs bg-white/10 text-white/60 px-2 py-1 rounded-full">
                          {creator.niche}
                        </span>
                      )}
                    </div>

                    {/* Arrow */}
                    <ArrowUpRight className="w-5 h-5 text-white/20 group-hover:text-tiktok-cyan transition-colors flex-shrink-0" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
