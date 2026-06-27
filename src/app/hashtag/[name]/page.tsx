import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { HashtagProfile } from "@/components/hashtag-profile";
import { TrendingGrid } from "@/components/trending-grid";
import { RelatedContent } from "@/components/related-content";
import Script from "next/script";
import { generateTopicSchema, generateBreadcrumbSchema, truncateDescription } from "@/lib/seo";

interface HashtagPageProps {
  params: Promise<{
    name: string;
  }>;
}

export async function generateMetadata({ params }: HashtagPageProps): Promise<Metadata> {
  try {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);
    const hashtag = await prisma.hashtag.findFirst({
      where: { name: decodedName },
      select: {
        name: true,
        views: true,
        videos: true,
        growthRate: true,
        category: true,
        velocity: true,
        viralScore: true,
      },
    });

    if (!hashtag) {
      return {
        title: "Hashtag Not Found | TikTok Intelligence",
      };
    }

    const title = `#${hashtag.name} TikTok Analytics & Trend Report`;
    const description = truncateDescription(
      `Analyze #${hashtag.name} TikTok hashtag performance. ${hashtag.views} views across ${hashtag.videos} videos. Growth rate: ${hashtag.growthRate.toFixed(1)}%. Discover trending content, viral potential and audience insights.`
    );

    return {
      title,
      description,
      keywords: [
        `#${hashtag.name}`,
        hashtag.name,
        "TikTok hashtag",
        "hashtag analytics",
        "viral hashtag",
        "trending hashtag",
        hashtag.category || "TikTok",
        "hashtag strategy",
        "content trends",
      ],
      alternates: {
        canonical: `https://tiktok.tubefission.com/hashtag/${encodeURIComponent(hashtag.name)}`,
      },
      openGraph: {
        title: `#${hashtag.name} - TikTok Hashtag Analytics`,
        description,
        url: `https://tiktok.tubefission.com/hashtag/${encodeURIComponent(hashtag.name)}`,
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: `#${hashtag.name} - TikTok Analytics`,
        description,
      },
    };
  } catch {
    return {
      title: "Hashtag | TikTok Intelligence",
    };
  }
}

export async function generateStaticParams() {
  try {
    const hashtags = await prisma.hashtag.findMany({
      take: 100,
      select: { name: true },
      orderBy: [
        { viralScore: "desc" },
        { views: "desc" },
      ],
    });

    return hashtags.map((hashtag) => ({
      name: encodeURIComponent(hashtag.name),
    }));
  } catch {
    // Database unavailable - skip static generation, use ISR
    return [];
  }
}

export const dynamicParams = true;

export default async function HashtagPage({ params }: HashtagPageProps) {
  try {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);

    const hashtag = await prisma.hashtag.findFirst({
      where: { name: decodedName },
    });

    if (!hashtag) {
      notFound();
    }

    // Find trends related to this hashtag
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let relatedTrends: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let relatedHashtags: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let topCreators: any[] = [];

    try {
      relatedTrends = await prisma.trend.findMany({
        where: {
          tags: {
            some: {
              tag: {
                name: decodedName,
              },
            },
          },
        },
        take: 6,
        orderBy: { viralScore: "desc" },
      });

      relatedHashtags = await prisma.hashtag.findMany({
        where: {
          category: hashtag.category,
          name: { not: decodedName },
        },
        take: 8,
        orderBy: { viralScore: "desc" },
      });

      topCreators = await prisma.creator.findMany({
        where: {
          niche: hashtag.category,
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
    } catch (dbError) {
      console.error("Database error fetching related content:", dbError);
      // Continue with empty arrays
    }

  // Generate JSON-LD
  const topicSchema = generateTopicSchema(
    hashtag.name,
    `TikTok hashtag analytics for #${hashtag.name}`,
    relatedTrends.length,
    topCreators.length
  );

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Hashtags", url: "/explore" },
    { name: `#${hashtag.name}`, url: `/hashtag/${encodeURIComponent(hashtag.name)}` },
  ]);

  return (
    <div className="min-h-screen bg-black">
      {/* JSON-LD */}
      <Script
        id="topic-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(topicSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <HashtagProfile hashtag={hashtag} />

      {relatedTrends.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8">
              Trends Using #{hashtag.name}
            </h2>
            <TrendingGrid trends={relatedTrends} />
          </div>
        </section>
      )}

      {/* Internal Linking */}
      <RelatedContent
        hashtags={relatedHashtags}
        creators={topCreators}
        currentName={`#${hashtag.name}`}
      />
    </div>
  );
  } catch {
    notFound();
  }
}
