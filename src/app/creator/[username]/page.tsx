import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CreatorProfile } from "@/components/creator-profile";
import { TrendingGrid } from "@/components/trending-grid";
import { RelatedContent } from "@/components/related-content";
import Script from "next/script";
import { generateCreatorSchema, generateBreadcrumbSchema, truncateDescription } from "@/lib/seo";

interface CreatorPageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({ params }: CreatorPageProps): Promise<Metadata> {
  const { username } = await params;
  const creator = await prisma.creator.findUnique({
    where: { username },
    select: {
      displayName: true,
      bio: true,
      niche: true,
      followers: true,
      likes: true,
      momentumScore: true,
      avatar: true,
    },
  });

  if (!creator) {
    return {
      title: "Creator Not Found | TikTok Intelligence",
    };
  }

  const title = `${creator.displayName} TikTok Analytics & Growth Report`;
  const description = truncateDescription(
    `Analyze ${creator.displayName}'s TikTok growth, engagement, trending videos and audience performance. ${creator.followers.toLocaleString()} followers, ${creator.likes.toLocaleString()} likes. Get data-driven insights and analytics.`
  );

  return {
    title,
    description,
    keywords: [
      username,
      creator.displayName,
      "TikTok creator",
      "creator analytics",
      "TikTok stats",
      creator.niche || "TikTok",
      "viral content",
      "engagement rate",
      "growth analysis",
    ],
    alternates: {
      canonical: `https://tiktok.tubefission.com/creator/${username}`,
    },
    openGraph: {
      title: `${creator.displayName} - TikTok Creator Analytics`,
      description,
      url: `https://tiktok.tubefission.com/creator/${username}`,
      type: "profile",
      images: creator.avatar ? [{
        url: creator.avatar,
        width: 400,
        height: 400,
        alt: creator.displayName,
      }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${creator.displayName} - TikTok Analytics`,
      description,
      images: creator.avatar ? [creator.avatar] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const creators = await prisma.creator.findMany({
    take: 100,
    select: { username: true },
    orderBy: { followers: "desc" },
  });

  return creators.map((creator) => ({
    username: creator.username,
  }));
}

export default async function CreatorPage({ params }: CreatorPageProps) {
  const { username } = await params;
  const creator = await prisma.creator.findUnique({
    where: { username },
    include: {
      trends: {
        include: {
          trend: true,
        },
        take: 6,
        orderBy: {
          trend: {
            publishedAt: "desc",
          },
        },
      },
    },
  });

  if (!creator) {
    notFound();
  }

  const relatedTrends = creator.trends.map((tc) => tc.trend);

  // Get related creators (same niche)
  const relatedCreators = await prisma.creator.findMany({
    where: {
      niche: creator.niche,
      username: { not: username },
    },
    take: 6,
    orderBy: { followers: "desc" },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
      followers: true,
      niche: true,
    },
  });

  // Get related hashtags
  const relatedHashtags = await prisma.hashtag.findMany({
    where: {
      category: creator.niche,
    },
    take: 8,
    orderBy: { viralScore: "desc" },
    select: {
      id: true,
      name: true,
      views: true,
      viralScore: true,
    },
  });

  // Generate JSON-LD schemas
  const creatorSchema = generateCreatorSchema(
    creator.username,
    creator.displayName,
    creator.followers,
    creator.likes,
    creator.avatar || undefined
  );

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Creators", url: "/explore" },
    { name: creator.displayName, url: `/creator/${username}` },
  ]);

  return (
    <div className="min-h-screen bg-black">
      {/* JSON-LD Structured Data */}
      <Script
        id="creator-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(creatorSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <CreatorProfile creator={creator} />

      {relatedTrends.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8">
              Trends by {creator.displayName}
            </h2>
            <TrendingGrid trends={relatedTrends} />
          </div>
        </section>
      )}

      {/* Internal Linking - Related Content */}
      <RelatedContent
        creators={relatedCreators}
        hashtags={relatedHashtags}
        currentName={creator.displayName}
      />
    </div>
  );
}
