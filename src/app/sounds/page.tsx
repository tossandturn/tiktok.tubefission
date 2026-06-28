"use client";

import { useMemo, useState, useEffect } from "react";
import { useCountry } from "@/components/country-context";
import { Music, Loader2, ChevronDown, TrendingUp, Play, ArrowUpRight, Disc } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

interface Sound {
  id: string;
  title: string;
  author: string | null;
  thumbnail: string | null;
  uses: number;
  growthRate: number;
  isViral: boolean;
  viralScore: number | null;
  trendingSince: string | null;
}

export default function SoundsPage() {
  const { selected: selectedCountry } = useCountry();
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"viral" | "uses" | "growth">("viral");
  const [filterViral, setFilterViral] = useState(false);

  useEffect(() => {
    async function fetchSounds() {
      setLoading(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const viralParam = filterViral ? "&viral=true" : "";
        const res = await fetch(`/api/sounds/?country=${selectedCountry.code}&limit=50${viralParam}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setSounds(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch sounds:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSounds();
  }, [selectedCountry.code, filterViral]);

  const sortedSounds = useMemo(() => {
    const sorted = [...sounds];
    switch (sortBy) {
      case "uses":
        return sorted.sort((a, b) => b.uses - a.uses);
      case "growth":
        return sorted.sort((a, b) => b.growthRate - a.growthRate);
      case "viral":
      default:
        return sorted.sort((a, b) => {
          if (a.isViral && !b.isViral) return -1;
          if (!a.isViral && b.isViral) return 1;
          return (b.viralScore || 0) - (a.viralScore || 0);
        });
    }
  }, [sounds, sortBy]);

  const formatUses = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Unknown";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-12 min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-tiktok-cyan animate-spin" />
        <p className="text-white/60 text-sm">Loading sounds...</p>
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
                <Music className="w-8 h-8 text-tiktok-pink" />
                Trending Sounds
              </h1>
              <p className="text-sm text-white/40 mt-2">
                {selectedCountry.flag} {selectedCountry.name} — {sounds.length} sounds
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Viral filter */}
              <button
                onClick={() => setFilterViral(!filterViral)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  filterViral
                    ? "bg-tiktok-red text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                Viral Only
              </button>
              {/* Sort dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="appearance-none bg-white/5 border border-white/10 text-white text-sm px-4 py-2 pr-10 rounded-xl focus:outline-none focus:border-tiktok-cyan cursor-pointer"
                >
                  <option value="viral">Viral Score</option>
                  <option value="uses">Most Used</option>
                  <option value="growth">Growth Rate</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sounds Grid */}
        {sortedSounds.length === 0 ? (
          <div className="text-center py-20">
            <Disc className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/40">No sounds found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedSounds.map((sound, index) => (
              <motion.div
                key={sound.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/sound/${sound.id}`}
                  className="group block p-5 bg-white/[0.02] border border-white/10 rounded-2xl hover:border-tiktok-pink/50 hover:bg-white/[0.04] transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-tiktok-cyan/20 to-tiktok-pink/20 flex-shrink-0">
                      {sound.thumbnail ? (
                        <Image
                          src={sound.thumbnail}
                          alt={sound.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-8 h-8 text-white/40" />
                        </div>
                      )}
                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-8 h-8 text-white fill-white" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white truncate group-hover:text-tiktok-pink transition-colors">
                          {sound.title}
                        </h3>
                        {sound.isViral && (
                          <span className="text-[10px] bg-tiktok-red text-white px-1.5 py-0.5 rounded-full flex-shrink-0">
                            VIRAL
                          </span>
                        )}
                      </div>
                      {sound.author && (
                        <p className="text-sm text-white/40">by {sound.author}</p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-3">
                        <div>
                          <p className="text-lg font-bold text-white">{formatUses(sound.uses)}</p>
                          <p className="text-xs text-white/40">uses</p>
                        </div>
                        {sound.viralScore && (
                          <div>
                            <p className="text-lg font-bold text-tiktok-cyan">{sound.viralScore.toFixed(0)}</p>
                            <p className="text-xs text-white/40">score</p>
                          </div>
                        )}
                        <div>
                          <p className={`text-lg font-bold flex items-center gap-1 ${sound.growthRate > 0 ? "text-green-400" : "text-red-400"}`}>
                            <TrendingUp className="w-3 h-3" />
                            {sound.growthRate > 0 ? "+" : ""}{sound.growthRate.toFixed(1)}%
                          </p>
                          <p className="text-xs text-white/40">growth</p>
                        </div>
                      </div>

                      {/* Trending since */}
                      {sound.trendingSince && (
                        <p className="text-xs text-white/30 mt-3">
                          Trending since {formatDate(sound.trendingSince)}
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <ArrowUpRight className="w-5 h-5 text-white/20 group-hover:text-tiktok-pink transition-colors flex-shrink-0" />
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
