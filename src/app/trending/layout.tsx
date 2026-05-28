import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trending",
  description: "The fastest-growing viral trends on TikTok right now, ranked by opportunity score.",
  openGraph: {
    title: "Trending | TikTok Intelligence",
    description: "The fastest-growing viral trends on TikTok right now, ranked by opportunity score.",
  },
  alternates: {
    canonical: "https://tiktok-intelligence.com/trending",
  },
};

export default function TrendingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
