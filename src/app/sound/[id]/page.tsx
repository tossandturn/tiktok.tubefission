import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SoundProfile } from "@/components/sound-profile";
import { TrendingGrid } from "@/components/trending-grid";

interface SoundPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: SoundPageProps): Promise<Metadata> {
  const { id } = await params;
  const sound = await prisma.sound.findUnique({
    where: { id },
    select: {
      title: true,
      author: true,
      uses: true,
      growthRate: true,
      isViral: true,
      viralScore: true,
    },
  });

  if (!sound) {
    return {
      title: "Sound Not Found | TikTok Intelligence",
    };
  }

  return {
    title: `${sound.title} - TikTok Sound Analytics | ${sound.uses.toLocaleString()} Uses | TikTok Intelligence`,
    description: `Analyze "${sound.title}" by ${sound.author || 'Unknown'}. ${sound.uses.toLocaleString()} uses, ${sound.growthRate.toFixed(1)}% growth rate. ${sound.isViral ? 'Viral sound trending now!' : 'Track this sound\'s performance'}`,
    keywords: [
      sound.title,
      sound.author || "TikTok",
      "TikTok sound",
      "viral sound",
      "trending audio",
      "TikTok music",
      "sound analytics",
      "audio trends",
    ],
    openGraph: {
      title: `${sound.title} - TikTok Sound Analytics`,
      description: `${sound.uses.toLocaleString()} uses · ${sound.growthRate.toFixed(1)}% growth`,
      type: "music.song",
    },
  };
}

export async function generateStaticParams() {
  // Return empty - pages will be generated on-demand via ISR
  return [];
}

export const dynamicParams = true;

export const revalidate = 3600;

export default async function SoundPage({ params }: SoundPageProps) {
  const { id } = await params;

  const sound = await prisma.sound.findUnique({
    where: { id },
  });

  if (!sound) {
    notFound();
  }

  // Find trends using this sound
  const relatedTrends = await prisma.trend.findMany({
    where: {
      OR: [
        { title: { contains: sound.title, mode: "insensitive" } },
        { description: { contains: sound.title, mode: "insensitive" } },
      ],
    },
    take: 6,
    orderBy: { viralScore: "desc" },
  });

  return (
    <div className="min-h-screen bg-black">
      <SoundProfile sound={sound} />

      {relatedTrends.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8">
              Trends Using This Sound
            </h2>
            <TrendingGrid trends={relatedTrends} />
          </div>
        </section>
      )}
    </div>
  );
}
