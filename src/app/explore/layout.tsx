import type { Metadata } from "next";

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

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
