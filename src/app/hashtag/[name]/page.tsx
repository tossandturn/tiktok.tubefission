"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, Hash, TrendingUp, Video } from "lucide-react";
import Link from "next/link";

interface Hashtag {
  id: string;
  name: string;
  views: string;
  videos: number;
  growthRate: number;
  category: string | null;
  isRising: boolean;
}

export default function HashtagPage() {
  const params = useParams();
  const name = params.name as string;
  const [hashtag, setHashtag] = useState<Hashtag | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchHashtag() {
      if (!name) return;

      setLoading(true);
      setError("");

      try {
        // Call our API which will fetch from Apify if not in DB
        const response = await fetch(`/api/hashtags/${encodeURIComponent(name)}/`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch hashtag");
        }

        if (data.success && data.hashtag) {
          setHashtag(data.hashtag);
        } else {
          throw new Error("Hashtag not found");
        }
      } catch (err) {
        console.error("Error fetching hashtag:", err);
        setError(err instanceof Error ? err.message : "Failed to load hashtag");
      } finally {
        setLoading(false);
      }
    }

    fetchHashtag();
  }, [name]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#00f2ea] animate-spin" />
          <p className="text-zinc-400">Loading hashtag...</p>
        </div>
      </div>
    );
  }

  if (error || !hashtag) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Hashtag Not Found</h1>
          <p className="text-zinc-400 mb-6">{error || "This hashtag doesn't exist or couldn't be loaded."}</p>
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

      {/* Hashtag Profile */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Icon */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00f2ea] to-[#ff0050] flex items-center justify-center">
              <Hash className="w-12 h-12 text-white" />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                #{hashtag.name}
              </h1>
              {hashtag.category && (
                <span className="inline-block px-3 py-1 bg-zinc-900 text-zinc-300 text-sm rounded-full mb-4">
                  {hashtag.category}
                </span>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>Views</span>
                  </div>
                  <p className="text-xl font-bold text-white">{hashtag.views}</p>
                </div>
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                    <Video className="w-4 h-4" />
                    <span>Videos</span>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {hashtag.videos.toLocaleString()}
                  </p>
                </div>
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>Growth</span>
                  </div>
                  <p className="text-xl font-bold text-[#00f2ea]">
                    +{hashtag.growthRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trending Status */}
        {hashtag.isRising && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-[#ff0050]/10 to-[#00f2ea]/10 border border-[#ff0050]/20 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ff0050] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Rising Hashtag</h3>
                <p className="text-zinc-400">
                  This hashtag is currently trending and gaining popularity
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
