"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, User, TrendingUp, Heart, Users } from "lucide-react";
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
  videos: Video[];
}

interface Video {
  id: string;
  thumbnail: string | null;
  views: string;
  likes: string;
  comments: string;
  url: string | null;
}

export default function CreatorPage() {
  const params = useParams();
  const username = params.username as string;
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCreator() {
      if (!username) return;

      setLoading(true);
      setError("");

      try {
        // First try to get from our API (which will fetch from Apify if not in DB)
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
          <p className="text-zinc-400">Loading creator...</p>
        </div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Creator Not Found</h1>
          <p className="text-zinc-400 mb-6">{error || "This creator doesn't exist or couldn't be loaded."}</p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ff0050] to-[#ff4080] text-white rounded-xl font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

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

      {/* Creator Profile */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-zinc-900 border-2 border-[#00f2ea]">
              {creator.avatar ? (
                <Image
                  src={creator.avatar}
                  alt={creator.displayName}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-10 h-10 text-zinc-600" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">{creator.displayName}</h1>
                {creator.isVerified && (
                  <span className="text-[#00f2ea] text-lg">✓</span>
                )}
              </div>
              <p className="text-zinc-400 mb-1">@{creator.username}</p>
              {creator.niche && (
                <span className="inline-block px-3 py-1 bg-zinc-900 text-zinc-300 text-sm rounded-full mb-4">
                  {creator.niche}
                </span>
              )}
              {creator.bio && (
                <p className="text-zinc-300 text-sm max-w-xl">{creator.bio}</p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                    <Users className="w-4 h-4" />
                    <span>Followers</span>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {creator.followers >= 1000000
                      ? (creator.followers / 1000000).toFixed(1) + "M"
                      : creator.followers >= 1000
                      ? (creator.followers / 1000).toFixed(1) + "K"
                      : creator.followers}
                  </p>
                </div>
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                    <User className="w-4 h-4" />
                    <span>Following</span>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {creator.following >= 1000000
                      ? (creator.following / 1000000).toFixed(1) + "M"
                      : creator.following >= 1000
                      ? (creator.following / 1000).toFixed(1) + "K"
                      : creator.following}
                  </p>
                </div>
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                    <Heart className="w-4 h-4" />
                    <span>Likes</span>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {creator.likes >= 1000000
                      ? (creator.likes / 1000000).toFixed(1) + "M"
                      : creator.likes >= 1000
                      ? (creator.likes / 1000).toFixed(1) + "K"
                      : creator.likes}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Videos Section */}
        {creator.videos && creator.videos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#ff0050]" />
              Recent Videos
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {creator.videos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors"
                >
                  {video.url ? (
                    <a href={video.url} target="_blank" rel="noopener noreferrer">
                      <div className="aspect-[9/16] bg-zinc-900 relative">
                        {video.thumbnail ? (
                          <Image
                            src={video.thumbnail}
                            alt="Video thumbnail"
                            width={300}
                            height={533}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <TrendingUp className="w-8 h-8 text-zinc-600" />
                          </div>
                        )}
                      </div>
                    </a>
                  ) : (
                    <div className="aspect-[9/16] bg-zinc-900 relative">
                      {video.thumbnail ? (
                        <Image
                          src={video.thumbnail}
                          alt="Video thumbnail"
                          width={300}
                          height={533}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <TrendingUp className="w-8 h-8 text-zinc-600" />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {parseInt(video.views) >= 1000000
                          ? (parseInt(video.views) / 1000000).toFixed(1) + "M"
                          : parseInt(video.views) >= 1000
                          ? (parseInt(video.views) / 1000).toFixed(1) + "K"
                          : video.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {parseInt(video.likes) >= 1000000
                          ? (parseInt(video.likes) / 1000000).toFixed(1) + "M"
                          : parseInt(video.likes) >= 1000
                          ? (parseInt(video.likes) / 1000).toFixed(1) + "K"
                          : video.likes}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
