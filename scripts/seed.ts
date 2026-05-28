import { prisma } from "../src/lib/db";

const seedTrends = [
  {
    slug: "phantom-step-challenge",
    title: "Phantom Step Challenge",
    description: "A footwork illusion creating the effect of gliding backward while moving forward. 340% growth in 72 hours among 18-24 demographic.",
    category: "Dance",
    growthRate: 340,
    views: "48M",
    creators: 12500,
    thumbnail: "https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=600&h=800&fit=crop",
    isViral: true,
    isNew: true,
    velocity: 92,
    saturation: 22,
    creatorFit: 78,
    aiScore: 88,
    aiPrediction: "Will peak in 48-72 hours, then rapidly saturate. Dance niche should adopt immediately.",
    tags: ["#PhantomStep", "#DanceChallenge", "#Viral"],
  },
  {
    slug: "ai-voice-clone-filter",
    title: "AI Voice Clone Filter",
    description: "Creators are using real-time voice cloning to duet themselves as celebrities. Audio engagement up 520% on videos using this technique.",
    category: "Tech",
    growthRate: 520,
    views: "92M",
    creators: 8400,
    thumbnail: "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=600&h=800&fit=crop",
    isViral: true,
    isNew: true,
    velocity: 96,
    saturation: 15,
    creatorFit: 65,
    aiScore: 94,
    aiPrediction: "High barrier to entry limits saturation. Tech and comedy niches have 5-7 day window.",
    tags: ["#AIVoice", "#VoiceClone", "#TechTrend"],
  },
  {
    slug: "seamless-object-transitions",
    title: "Seamless Object Transitions",
    description: "Throw any object at the camera and cut to a completely different scene. The smoother the catch, the more viral the video.",
    category: "Editing",
    growthRate: 210,
    views: "31M",
    creators: 6700,
    thumbnail: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&h=800&fit=crop",
    isViral: false,
    isNew: true,
    velocity: 74,
    saturation: 35,
    creatorFit: 82,
    aiScore: 76,
    aiPrediction: "Steady growth for 2 weeks. Editing-heavy format favors established creators.",
    tags: ["#Transitions", "#Editing", "#Cinematic"],
  },
  {
    slug: "5am-routine-aesthetic",
    title: "5AM Routine Aesthetic",
    description: "Hyper-stylized morning routines with ASMR levels of audio production. Watch time 3.2x higher than standard vlogs.",
    category: "Lifestyle",
    growthRate: 180,
    views: "27M",
    creators: 4100,
    thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=800&fit=crop",
    isViral: false,
    isNew: false,
    velocity: 58,
    saturation: 68,
    creatorFit: 90,
    aiScore: 62,
    aiPrediction: "Saturated but stable. Differentiation through unique location or profession is key.",
    tags: ["#5AMRoutine", "#Productivity", "#Aesthetic"],
  },
  {
    slug: "deconstructed-food-asmr",
    title: "Deconstructed Food ASMR",
    description: "Breaking down food into its molecular components with satisfying audio. New sub-niche exploding in Japan and Korea.",
    category: "Food",
    growthRate: 290,
    views: "56M",
    creators: 3200,
    thumbnail: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=800&fit=crop",
    isViral: true,
    isNew: false,
    velocity: 85,
    saturation: 18,
    creatorFit: 55,
    aiScore: 84,
    aiPrediction: "Crossing into Western markets now. Food and science creators have 10-day first-mover advantage.",
    tags: ["#FoodASMR", "#Deconstructed", "#Satisfying"],
  },
];

const seedCreators = [
  { username: "mayachen", displayName: "Maya Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", followers: 4200000, niche: "Dance" },
  { username: "alexrivera", displayName: "Alex Rivera", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", followers: 2800000, niche: "Tech" },
  { username: "yukitanaka", displayName: "Yuki Tanaka", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", followers: 6100000, niche: "Lifestyle" },
  { username: "jordansmith", displayName: "Jordan Smith", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop", followers: 1900000, niche: "Food" },
];

async function main() {
  console.log("[SEED] Starting...");

  for (const t of seedTrends) {
    const { tags, ...trendData } = t;

    const trend = await prisma.trend.upsert({
      where: { slug: trendData.slug },
      update: trendData,
      create: trendData,
    });

    for (const tagName of tags) {
      const tag = await prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName },
      });

      await prisma.trendTag.upsert({
        where: { trendId_tagId: { trendId: trend.id, tagId: tag.id } },
        update: {},
        create: { trendId: trend.id, tagId: tag.id },
      });
    }

    console.log(`[SEED] Trend: ${trend.title}`);
  }

  for (const c of seedCreators) {
    await prisma.creator.upsert({
      where: { username: c.username },
      update: c,
      create: c,
    });
    console.log(`[SEED] Creator: ${c.displayName}`);
  }

  console.log("[SEED] Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
