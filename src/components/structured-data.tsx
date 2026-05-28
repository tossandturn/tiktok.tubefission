"use client";

import Script from "next/script";

interface StructuredDataProps {
  type: "website" | "article" | "organization" | "breadcrumb";
  data?: Record<string, unknown>;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    const base = {
      "@context": "https://schema.org",
    };

    switch (type) {
      case "website":
        return {
          ...base,
          "@type": "WebSite",
          name: "TikTok Intelligence Terminal",
          url: "https://tiktok-intelligence.com",
          description:
            "Daily intelligence terminal for TikTok creators. Discover trends before they explode.",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://tiktok-intelligence.com/explore?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        };
      case "organization":
        return {
          ...base,
          "@type": "Organization",
          name: "TikTok Intelligence",
          url: "https://tiktok-intelligence.com",
          logo: "https://tiktok-intelligence.com/logo.png",
          sameAs: [
            "https://twitter.com/tiktokintel",
            "https://instagram.com/tiktokintel",
          ],
        };
      case "article":
        return {
          ...base,
          "@type": "Article",
          ...data,
          publisher: {
            "@type": "Organization",
            name: "TikTok Intelligence",
            logo: {
              "@type": "ImageObject",
              url: "https://tiktok-intelligence.com/logo.png",
            },
          },
        };
      case "breadcrumb":
        return {
          ...base,
          "@type": "BreadcrumbList",
          itemListElement: data?.items,
        };
      default:
        return base;
    }
  };

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData()),
      }}
    />
  );
}
