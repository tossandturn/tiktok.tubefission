import type { Metadata } from "next";
import { TrendCard } from "@/components/trend-card";
import { trends, categories } from "@/lib/data";
import { Search, SlidersHorizontal } from "lucide-react";

export const metadata: Metadata = {
  title: "Explore Trends",
  description: "Browse all trending signals and viral patterns across TikTok categories.",
  openGraph: {
    title: "Explore Trends | TikTok Intelligence",
    description: "Browse all trending signals and viral patterns across TikTok categories.",
  },
  alternates: {
    canonical: "https://tiktok-intelligence.com/explore",
  },
};

export default function ExplorePage() {
  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-12">
      {/* Header */}
      <div className="space-y-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Explore</h1>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search trends, creators, hashtags..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-tiktok-cyan/50 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button className="flex items-center gap-1.5 bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap">
            <SlidersHorizontal className="w-3 h-3" />
            Filters
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                cat === "All"
                  ? "bg-white text-tiktok-black"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Trend Grid */}
      <div className="space-y-4">
        {trends.map((trend, i) => (
          <TrendCard key={trend.id} trend={trend} index={i} layout="horizontal" />
        ))}
      </div>
    </div>
  );
}
