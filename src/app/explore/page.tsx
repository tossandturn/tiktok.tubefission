import type { Metadata } from "next";
import { Suspense } from "react";
import ExploreContent from "./explore-content";
import { DailyInsightsSection } from "@/components/daily-insights-section";
import { Loader2 } from "lucide-react";
import { ExploreBreadcrumb } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Explore TikTok Trends | Discover Viral Content",
  description:
    "Explore trending TikTok content across categories and countries. Find viral trends, popular creators, trending hashtags, and viral sounds with real-time analytics.",
  keywords: [
    "TikTok explore",
    "trend discovery",
    "viral content",
    "TikTok search",
    "trending hashtags",
    "popular creators",
  ],
  openGraph: {
    title: "Explore TikTok Trends | TikTok Intelligence",
    description: "Discover viral trends and trending content across categories",
    images: ["/og-explore.jpg"],
  },
};

function ExploreLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-12 min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 text-tiktok-cyan animate-spin" />
      <p className="text-white/60 text-sm">Loading explore...</p>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-black">
      <ExploreBreadcrumb />
      {/* Daily Insights Section */}
      <DailyInsightsSection />

      {/* Main Explore Content */}
      <div className="pt-20">
        <Suspense fallback={<ExploreLoading />}>
          <ExploreContent />
        </Suspense>
      </div>
    </div>
  );
}
