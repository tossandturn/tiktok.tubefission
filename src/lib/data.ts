export interface Trend {
  id: string;
  title: string;
  description: string;
  category: string;
  growthRate: number;
  views: string;
  creators: number;
  thumbnail: string;
  tags: string[];
  publishedAt: string;
  isViral: boolean;
  isNew: boolean;
}

export interface Creator {
  id: string;
  name: string;
  avatar: string;
  followers: string;
  niche: string;
}

export const trends: Trend[] = [
  {
    id: "viral-dance-challenge-2026",
    title: "Phantom Step Challenge",
    description: "A footwork illusion creating the effect of gliding backward while moving forward. 340% growth in 72 hours among 18-24 demographic.",
    category: "Dance",
    growthRate: 340,
    views: "48M",
    creators: 12500,
    thumbnail: "https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=600&h=800&fit=crop",
    tags: ["#PhantomStep", "#DanceChallenge", "#Viral"],
    publishedAt: "2026-05-26",
    isViral: true,
    isNew: true,
  },
  {
    id: "ai-voice-filter-hack",
    title: "AI Voice Clone Filter",
    description: "Creators are using real-time voice cloning to duet themselves as celebrities. Audio engagement up 520% on videos using this technique.",
    category: "Tech",
    growthRate: 520,
    views: "92M",
    creators: 8400,
    thumbnail: "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=600&h=800&fit=crop",
    tags: ["#AIVoice", "#VoiceClone", "#TechTrend"],
    publishedAt: "2026-05-25",
    isViral: true,
    isNew: true,
  },
  {
    id: "cinematic-transition-pack",
    title: "Seamless Object Transitions",
    description: "Throw any object at the camera and cut to a completely different scene. The smoother the catch, the more viral the video.",
    category: "Editing",
    growthRate: 210,
    views: "31M",
    creators: 6700,
    thumbnail: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&h=800&fit=crop",
    tags: ["#Transitions", "#Editing", "#Cinematic"],
    publishedAt: "2026-05-24",
    isViral: false,
    isNew: true,
  },
  {
    id: "productivity-hack-morning",
    title: "5AM Routine Aesthetic",
    description: "Hyper-stylized morning routines with ASMR levels of audio production. Watch time 3.2x higher than standard vlogs.",
    category: "Lifestyle",
    growthRate: 180,
    views: "27M",
    creators: 4100,
    thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=800&fit=crop",
    tags: ["#5AMRoutine", "#Productivity", "#Aesthetic"],
    publishedAt: "2026-05-23",
    isViral: false,
    isNew: false,
  },
  {
    id: "food-asmr-evolution",
    title: "Deconstructed Food ASMR",
    description: "Breaking down food into its molecular components with satisfying audio. New sub-niche exploding in Japan and Korea.",
    category: "Food",
    growthRate: 290,
    views: "56M",
    creators: 3200,
    thumbnail: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=800&fit=crop",
    tags: ["#FoodASMR", "#Deconstructed", "#Satisfying"],
    publishedAt: "2026-05-22",
    isViral: true,
    isNew: false,
  },
  {
    id: "street-interview-tokyo",
    title: "Tokyo Street Interviews",
    description: "Asking strangers philosophical questions in neon-lit Tokyo streets. Authentic reactions driving 4.5% engagement rate.",
    category: "Social",
    growthRate: 155,
    views: "19M",
    creators: 890,
    thumbnail: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=800&fit=crop",
    tags: ["#StreetInterview", "#Tokyo", "#Philosophy"],
    publishedAt: "2026-05-21",
    isViral: false,
    isNew: false,
  },
  {
    id: "miniature-diy-crafting",
    title: "Miniature World Building",
    description: "Creating entire rooms and worlds at 1:12 scale. Average session duration 4m 32s — highest in DIY category.",
    category: "DIY",
    growthRate: 195,
    views: "33M",
    creators: 5600,
    thumbnail: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&h=800&fit=crop",
    tags: ["#Miniature", "#DIY", "#Crafting"],
    publishedAt: "2026-05-20",
    isViral: false,
    isNew: true,
  },
  {
    id: "reaction-duet-format",
    title: "Silent Reaction Duets",
    description: "Reacting to videos with only facial expressions — no audio commentary. Paradoxically driving higher completion rates.",
    category: "Entertainment",
    growthRate: 220,
    views: "41M",
    creators: 9800,
    thumbnail: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop",
    tags: ["#Reaction", "#Duet", "#Silent"],
    publishedAt: "2026-05-19",
    isViral: false,
    isNew: false,
  },
];

export const categories = [
  "All",
  "Dance",
  "Tech",
  "Editing",
  "Lifestyle",
  "Food",
  "Social",
  "DIY",
  "Entertainment",
];

export const featuredCreators: Creator[] = [
  { id: "1", name: "Maya Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", followers: "4.2M", niche: "Dance" },
  { id: "2", name: "Alex Rivera", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", followers: "2.8M", niche: "Tech" },
  { id: "3", name: "Yuki Tanaka", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", followers: "6.1M", niche: "Lifestyle" },
  { id: "4", name: "Jordan Smith", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop", followers: "1.9M", niche: "Food" },
];
