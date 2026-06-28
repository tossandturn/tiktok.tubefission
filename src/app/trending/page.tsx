import type { Metadata } from "next";
import { TrendingPageContent } from "./trending-content";
import { TrendingBreadcrumb } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Trending Now | Real-Time TikTok Trends",
  description:
    "See what's trending on TikTok right now. Real-time viral trends, hot hashtags, and popular sounds updated hourly with AI-powered predictions.",
  keywords: [
    "trending now",
    "TikTok trending",
    "viral now",
    "hot trends",
    "TikTok viral",
    "real-time trends",
  ],
  openGraph: {
    title: "Trending Now | TikTok Intelligence",
    description: "See what's trending on TikTok right now",
    images: ["/og-trending.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trending Now | TikTok Intelligence",
    description: "Real-time TikTok trends and viral content",
  },
  alternates: {
    canonical: "https://tiktok.tubefission.com/trending/",
  },
};

export default function TrendingPage() {
  return (
    <div className="min-h-screen bg-black">
      <TrendingBreadcrumb />
      <TrendingPageContent />
    </div>
  );
}
