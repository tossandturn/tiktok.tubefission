"use client";

import { useState, useEffect } from "react";
import { WordCloud, WordCloudSkeleton } from "@/components/word-cloud";
import { BoomingKeywords, BoomingKeywordsSkeleton } from "@/components/booming-keywords";
import { TrendingUp, Hash, Globe } from "lucide-react";

interface DailyInsightsSectionProps {
  defaultCountry?: string;
}

const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "Korea", flag: "🇰🇷" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼" },
];

interface WordCloudData {
  name: string;
  weight: number;
  viralScore?: number;
  trendDirection?: "up" | "down" | "stable";
}

interface BoomingKeywordData {
  name: string;
  growthRate: number;
  views: string;
  rank: number;
  previousRank?: number;
  category?: string;
}

export function DailyInsightsSection({ defaultCountry = "US" }: DailyInsightsSectionProps) {
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [wordCloudData, setWordCloudData] = useState<WordCloudData[]>([]);
  const [boomingKeywords, setBoomingKeywords] = useState<BoomingKeywordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/hashtags/rankings?country=${selectedCountry}&limit=50`);
        const data = await response.json();

        if (data.success) {
          interface HashtagData {
  name: string;
  viralScore?: number;
  isRising?: boolean;
  growthRate: number;
  views: string;
  category?: string;
}

// Transform hashtag data for word cloud
const wordCloud: WordCloudData[] = data.hashtags.map((h: HashtagData) => ({
            name: h.name,
            weight: Math.min(Math.floor((h.viralScore || 50) / 10), 10) + 1,
            viralScore: h.viralScore || 50,
            trendDirection: h.isRising ? "up" : h.growthRate > 0 ? "stable" : "down",
          }));

          // Transform for booming keywords (sorted by growth rate)
          const booming: BoomingKeywordData[] = data.hashtags
            .sort((a: HashtagData, b: HashtagData) => b.growthRate - a.growthRate)
            .slice(0, 10)
            .map((h: HashtagData, index: number) => ({
              name: h.name,
              growthRate: h.growthRate,
              views: h.views,
              rank: index + 1,
              category: h.category,
            }));

          setWordCloudData(wordCloud);
          setBoomingKeywords(booming);
        } else {
          setError(data.error || "Failed to load data");
        }
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedCountry]);

  return (
    <section className="w-full py-12 bg-black">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 mb-4">
            <Globe className="w-4 h-4 text-[#00f2ea]" />
            <span className="text-sm text-zinc-400">Daily Insights by Region</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Discover What&apos;s Trending Today
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto">
            Real-time trending hashtags and booming keywords updated daily for each region
          </p>
        </div>

        {/* Country Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {COUNTRIES.map((country) => (
            <button
              key={country.code}
              onClick={() => setSelectedCountry(country.code)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-200
                ${selectedCountry === country.code
                  ? "bg-[#ff0050] text-white"
                  : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800"
                }
              `}
            >
              <span>{country.flag}</span>
              <span className="hidden sm:inline">{country.name}</span>
              <span className="sm:hidden">{country.code}</span>
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Word Cloud */}
          <div className="bg-zinc-950 rounded-2xl p-6 border border-zinc-900">
            <div className="flex items-center gap-2 mb-6">
              <Hash className="w-5 h-5 text-[#00f2ea]" />
              <h3 className="text-lg font-bold text-white">Trending Hashtags</h3>
            </div>
            {loading ? (
              <WordCloudSkeleton />
            ) : error ? (
              <div className="text-center py-8 text-zinc-500">{error}</div>
            ) : (
              <WordCloud data={wordCloudData} country={selectedCountry} />
            )}
          </div>

          {/* Booming Keywords */}
          <div className="bg-zinc-950 rounded-2xl p-6 border border-zinc-900">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-[#ff0050]" />
              <h3 className="text-lg font-bold text-white">Booming Keywords</h3>
            </div>
            {loading ? (
              <BoomingKeywordsSkeleton />
            ) : error ? (
              <div className="text-center py-8 text-zinc-500">{error}</div>
            ) : (
              <BoomingKeywords keywords={boomingKeywords} country={selectedCountry} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
