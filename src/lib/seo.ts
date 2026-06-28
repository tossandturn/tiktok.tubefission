import { Metadata } from "next";

interface SEOConfig {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: "website" | "article" | "profile";
  author?: string;
  publishedAt?: string;
  modifiedAt?: string;
  keywords?: string[];
}

const BASE_URL = "https://tiktok.tubefission.com";

/**
 * Generate comprehensive metadata for any page
 * Includes: title, description, canonical, Open Graph, Twitter Card
 */
export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    canonical,
    image = `${BASE_URL}/og-image.jpg`,
    type = "website",
    author,
    publishedAt,
    modifiedAt,
    keywords = [],
  } = config;

  const fullTitle = `${title} | TikTok Intelligence`;

  return {
    title: fullTitle,
    description,
    keywords,
    authors: author ? [{ name: author }] : undefined,
    alternates: {
      canonical: canonical || `${BASE_URL}`,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical || BASE_URL,
      siteName: "TikTok Intelligence",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
      type,
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
      creator: "@tiktokintelligence",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

/**
 * Generate JSON-LD structured data for creators
 */
export function generateCreatorSchema(
  username: string,
  displayName: string,
  followers: number,
  likes: number,
  avatar?: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: displayName,
      alternateName: username,
      image: avatar,
      interactionStatistic: [
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/FollowAction",
          userInteractionCount: followers,
        },
        {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/LikeAction",
          userInteractionCount: likes,
        },
      ],
    },
  };
}

/**
 * Generate JSON-LD for video pages
 */
export function generateVideoSchema(
  title: string,
  description: string,
  url: string,
  thumbnail: string,
  views: number,
  likes: number,
  publishedAt: string,
  creatorName: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: title,
    description,
    thumbnailUrl: thumbnail,
    contentUrl: url,
    uploadDate: publishedAt,
    author: {
      "@type": "Person",
      name: creatorName,
    },
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/WatchAction",
        userInteractionCount: views,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: likes,
      },
    ],
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}

/**
 * Generate hashtag/topic page schema
 */
export function generateTopicSchema(
  topic: string,
  description: string,
  relatedVideos: number,
  relatedCreators: number
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${topic} - TikTok Analytics`,
    description,
    about: topic,
    hasPart: [
      {
        "@type": "VideoGallery",
        video: relatedVideos,
      },
      {
        "@type": "ItemList",
        itemListElement: relatedCreators,
      },
    ],
  };
}

/**
 * Truncate description for SEO (max 160 chars for meta description)
 */
export function truncateDescription(text: string, maxLength = 155): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, "") + "...";
}

/**
 * Generate SEO-friendly slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 60);
}

/**
 * Calculate trend score based on growth metrics
 * Section 7: Trend Score Formula
 */
export function calculateTrendScore(
  viewsGrowth: number,
  likesGrowth: number,
  sharesGrowth: number,
  commentsGrowth: number
): number {
  // Formula: 0.35 * viewsGrowth + 0.25 * likesGrowth + 0.20 * sharesGrowth + 0.20 * commentsGrowth
  const score =
    0.35 * viewsGrowth +
    0.25 * likesGrowth +
    0.20 * sharesGrowth +
    0.20 * commentsGrowth;

  return Math.round(score * 100) / 100; // Round to 2 decimal places
}

/**
 * Generate FAQ structured data
 */
export interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate hashtag schema
 */
export function generateHashtagSchema(
  name: string,
  views: string,
  videos: number,
  url: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Thing",
    name: `#${name}`,
    description: `TikTok hashtag #${name} with ${views} views across ${videos} videos`,
    url,
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/ViewAction",
      userInteractionCount: views,
    },
  };
}

/**
 * Generate dataset schema for analytics pages
 */
export function generateDatasetSchema(
  name: string,
  description: string,
  url: string,
  variables: string[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name,
    description,
    url,
    variableMeasured: variables,
    creator: {
      "@type": "Organization",
      name: "TikTok Intelligence",
    },
  };
}

/**
 * Generate search action schema for site search
 */
export function generateSearchActionSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/explore?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
