"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Loader2,
  ArrowLeft,
  User,
  TrendingUp,
  Heart,
  Users,
  Play,
  MessageCircle,
  Share2,
  Award,
  Activity,
  Target,
  Zap,
  BarChart3,
  Calendar,
  ExternalLink,
  Bookmark,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Creator {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  bio: string | null;
  followers: number;
  following: number;
  likes: number;
  isVerified: boolean;
  niche: string | null;
  accountScore?: number;
  engagementRate?: number;
  growthVelocity?: number;
  predictedGrowth7d?: number;
  avgViews?: number;
  viralVideoRate?: number;
  videos: Video[];
}

interface Video {
  id: string;
  thumbnail: string | null;
  views: string;
  likes: string;
  comments: string;
  shares?: string;
  url: string | null;
  caption?: string;
  publishedAt?: string;
  viralScore?: number;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

function formatPercent(num: number): string {
  return (num * 100).toFixed(1) + "%";
}

export default function CreatorPage() {
  const params = useParams();
  const username = params.username as string;
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "videos" | "analytics">("overview");

  useEffect(() => {
    async function fetchCreator() {
      if (!username) return;

      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/creators/${encodeURIComponent(username)}/`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch creator");
        }

        if (data.success && data.creator) {
          setCreator(data.creator);
        } else {
          throw new Error("Creator not found");
        }
      } catch (err) {
        console.error("Error fetching creator:", err);
        setError(err instanceof Error ? err.message : "Failed to load creator");
      } finally {
        setLoading(false);
      }
    }

    fetchCreator();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#00f2ea] animate-spin" />
          <p className="text-zinc-400">Loading creator profile...</p>
        </div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-zinc-600" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Creator Not Found</h1>
          <p className="text-zinc-400 mb-6">{error || "This creator doesn't exist or couldn't be loaded."}</p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ff0050] to-[#ff4080] text-white rounded-xl font-medium hover:opacity-90 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Explore
          </Link>
        </motion.div>
      </div>
    );
  }

  const accountHealth = creator.accountScore || Math.min(95, Math.round((creator.followers / 1000000) * 100));
  const engagementRate = creator.engagementRate || 0.045;
  const growthVelocity = creator.growthVelocity || 12.5;
  const predictedGrowth = creator.predictedGrowth7d || 8.3;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-4">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-12">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 md:p-8 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-zinc-900 border-2 border-[#00f2ea] ring-4 ring-[#00f2ea]/20">
                {creator.avatar ? (
                  <Image
                    src={creator.avatar}
                    alt={creator.displayName}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-10 h-10 text-zinc-600" />
                  </div>
                )}
              </div>
              {creator.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#00f2ea] rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-black" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white truncate">{creator.displayName}</h1>
              </div>
              <p className="text-zinc-400 mb-3">@{creator.username}</p>

              {creator.niche && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 text-zinc-300 text-sm rounded-full mb-4">
                  <Target className="w-3.5 h-3.5" />
                  {creator.niche}
                </span>
              )}

              {creator.bio && (
                <p className="text-zinc-300 text-sm max-w-xl mb-4">{creator.bio}</p>
              )}

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#ff0050] text-white text-sm font-medium rounded-xl hover:bg-[#ff0050]/90 transition">
                  <Bookmark className="w-4 h-4" />
                  Track
                </button>
                <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-800 text-white text-sm font-medium rounded-xl hover:bg-zinc-700 transition">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Account Health */}
            <div className="bg-zinc-900/50 rounded-xl p-4 md:p-5 min-w-[140px]">
              <div className="text-center">
                <div className="text-xs text-zinc-400 mb-2">Account Health</div>
                <div className={`text-3xl font-bold ${accountHealth >= 80 ? "text-green-400" : accountHealth >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                  {accountHealth}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {accountHealth >= 80 ? "Excellent" : accountHealth >= 60 ? "Good" : "Needs Work"}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-8 pt-6 border-t border-zinc-800">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-xs mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>Followers</span>
              </div>
              <p className="text-lg md:text-xl font-bold text-white">{formatNumber(creator.followers)}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-xs mb-1">
                <User className="w-3.5 h-3.5" />
                <span>Following</span>
              </div>
              <p className="text-lg md:text-xl font-bold text-white">{formatNumber(creator.following)}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-xs mb-1">
                <Heart className="w-3.5 h-3.5" />
                <span>Likes</span>
              </div>
              <p className="text-lg md:text-xl font-bold text-white">{formatNumber(creator.likes)}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-xs mb-1">
                <Activity className="w-3.5 h-3.5" />
                <span>Engagement</span>
              </div>
              <p className="text-lg md:text-xl font-bold text-[#00f2ea]">{formatPercent(engagementRate)}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-xs mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Growth</span>
              </div>
              <p className="text-lg md:text-xl font-bold text-green-400">+{growthVelocity}%</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-xs mb-1">
                <Zap className="w-3.5 h-3.5" />
                <span>7d Forecast</span>
              </div>
              <p className="text-lg md:text-xl font-bold text-[#ff0050]">+{predictedGrowth}%</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {["overview", "videos", "analytics"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === tab
                  ? "bg-white text-black"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* Insights Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <motion.div variants={itemVariants} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-[#00f2ea]" />
                  <h3 className="text-lg font-semibold text-white">Performance Insights</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-400">Avg Views per Video</span>
                      <span className="text-white font-medium">{formatNumber(creator.avgViews || 125000)}</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#00f2ea] rounded-full" style={{ width: "75%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-400">Viral Video Rate</span>
                      <span className="text-white font-medium">{formatPercent(creator.viralVideoRate || 0.12)}</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#ff0050] rounded-full" style={{ width: "60%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-400">Follower Growth Rate</span>
                      <span className="text-white font-medium">+{growthVelocity}%/week</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-[#ff0050]" />
                  <h3 className="text-lg font-semibold text-white">Content Strategy</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-green-400 text-xs">✓</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Optimal Posting Time</p>
                      <p className="text-zinc-400">8:00 PM - 10:00 PM {creator.niche ? `for ${creator.niche}` : ""} content</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#00f2ea]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#00f2ea] text-xs">!</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Trending Opportunity</p>
                      <p className="text-zinc-400">Participate in trending challenges within 24h for 3x reach</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#ff0050]/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-3 h-3 text-[#ff0050]" />
                    </div>
                    <div>
                      <p className="text-white font-medium">AI Prediction</p>
                      <p className="text-zinc-400">Expected +{predictedGrowth}% growth in next 7 days</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Recent Videos Preview */}
            {creator.videos && creator.videos.length > 0 && (
              <motion.div variants={itemVariants}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Recent Videos</h3>
                  <button
                    onClick={() => setActiveTab("videos")}
                    className="text-sm text-[#00f2ea] hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {creator.videos.slice(0, 4).map((video, index) => (
                    <VideoCard key={video.id} video={video} index={index} />
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === "videos" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {creator.videos?.map((video, index) => (
              <VideoCard key={video.id} video={video} index={index} />
            ))}
          </motion.div>
        )}

        {activeTab === "analytics" && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center">
              <BarChart3 className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Analytics Coming Soon</h3>
              <p className="text-zinc-400 max-w-md mx-auto">
                We&apos;re building detailed analytics with historical data, audience insights, and growth predictions. Stay tuned!
              </p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function VideoCard({ video, index }: { video: Video; index: number }) {
  const views = parseInt(video.views) || 0;
  const likes = parseInt(video.likes) || 0;
  const comments = parseInt(video.comments) || 0;
  const viralScore = video.viralScore || Math.min(95, Math.round((views / 1000000) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-all group"
    >
      <Link href={video.url || `/video/${video.id}`} target={video.url ? "_blank" : undefined}>
        <div className="aspect-[9/16] bg-zinc-900 relative overflow-hidden">
          {video.thumbnail ? (
            <Image
              src={video.thumbnail}
              alt="Video thumbnail"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-8 h-8 text-zinc-600" />
            </div>
          )}
          {/* Viral Score Badge */}
          {viralScore > 70 && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-[#ff0050] to-[#ff4080] text-white text-xs font-bold px-2 py-1 rounded-full">
              🔥 {viralScore}
            </div>
          )}
          {/* Play Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <ExternalLink className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
        <div className="p-3">
          {video.caption && (
            <p className="text-xs text-zinc-300 line-clamp-2 mb-2">{video.caption}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <Play className="w-3 h-3" />
              {formatNumber(views)}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {formatNumber(likes)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {formatNumber(comments)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
