"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { StructuredData } from "./structured-data";

interface BreadcrumbItem {
  name: string;
  url?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const structuredData = {
    items: [
      { name: "Home", url: "https://tiktok.tubefission.com" },
      ...items.map((item) => ({
        name: item.name,
        url: item.url ? `https://tiktok.tubefission.com${item.url}` : undefined,
      })),
    ].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <>
      <StructuredData type="breadcrumb" data={structuredData} />
      <nav
        aria-label="Breadcrumb"
        className="py-4 px-4 max-w-7xl mx-auto"
      >
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link
              href="/"
              className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-zinc-600" />
              {item.url ? (
                <Link
                  href={item.url}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  {item.name}
                </Link>
              ) : (
                <span className="text-zinc-300" aria-current="page">
                  {item.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

// Predefined breadcrumb sets
export const TrendBreadcrumb = ({ title }: { title: string }) => (
  <Breadcrumbs items={[{ name: "Explore", url: "/explore" }, { name: title }]} />
);

export const CreatorBreadcrumb = ({ username }: { username: string }) => (
  <Breadcrumbs items={[{ name: "Explore", url: "/explore" }, { name: `@${username}` }]} />
);

export const HashtagBreadcrumb = ({ name }: { name: string }) => (
  <Breadcrumbs items={[{ name: "Explore", url: "/explore" }, { name: `#${name}` }]} />
);

export const AnalyticsBreadcrumb = () => (
  <Breadcrumbs items={[{ name: "Analytics" }]} />
);

export const TrendingBreadcrumb = () => (
  <Breadcrumbs items={[{ name: "Trending" }]} />
);

export const ExploreBreadcrumb = () => (
  <Breadcrumbs items={[{ name: "Explore" }]} />
);
