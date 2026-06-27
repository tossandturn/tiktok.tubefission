"use client";

import Script from "next/script";

interface StructuredDataProps {
  type: "website" | "article" | "organization" | "breadcrumb" | "softwareApplication" | "product";
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
          url: "https://tiktok.tubefission.com",
          description:
            "Daily intelligence terminal for TikTok creators. Discover trends before they explode.",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://tiktok.tubefission.com/explore?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        };
      case "organization":
        return {
          ...base,
          "@type": "Organization",
          name: "TikTok Intelligence",
          url: "https://tiktok.tubefission.com",
          logo: "https://tiktok.tubefission.com/logo.png",
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
              url: "https://tiktok.tubefission.com/logo.png",
            },
          },
        };
      case "breadcrumb":
        return {
          ...base,
          "@type": "BreadcrumbList",
          itemListElement: data?.items,
        };
      case "softwareApplication":
        return {
          ...base,
          "@type": "SoftwareApplication",
          name: "TikTok Intelligence",
          applicationCategory: "SocialMediaAnalytics",
          operatingSystem: "Web",
          url: "https://tiktok.tubefission.com",
          description:
            "AI-powered TikTok trend analytics and creator intelligence platform. Discover viral trends before they explode.",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            ratingCount: "2000",
          },
        };
      case "product":
        return {
          ...base,
          "@type": "Product",
          name: "TikTok Intelligence",
          image: "https://tiktok.tubefission.com/og-image.jpg",
          description:
            "Real-time viral analytics, AI-powered opportunity scores, and country-specific trend intelligence for TikTok creators.",
          brand: {
            "@type": "Brand",
            name: "TikTok Intelligence",
          },
          offers: {
            "@type": "Offer",
            url: "https://tiktok.tubefission.com",
            price: "0",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            ratingCount: "2000",
          },
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
