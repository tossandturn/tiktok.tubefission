"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Music, Users, TrendingUp, Clock, ArrowUpRight, Play } from "lucide-react";
import type { Sound } from "@prisma/client";

interface SoundProfileProps {
  sound: Sound;
}

export function SoundProfile({ sound }: SoundProfileProps) {
  const formatUses = (uses: number) => {
    if (uses >= 1000000) return `${(uses / 1000000).toFixed(1)}M`;
    if (uses >= 1000) return `${(uses / 1000).toFixed(1)}K`;
    return uses.toString();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <section className="pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-white/40 mb-6"
        >
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/explore" className="hover:text-white transition-colors">
            Sounds
          </Link>
          <span>/</span>
          <span className="text-white truncate max-w-[200px]">{sound.title}</span>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Sound Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-1"
          >
            <div className="p-6 bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl">
              <div className="relative aspect-square w-full mb-4 group cursor-pointer">
                <Image
                  src={sound.thumbnail || "/placeholder-sound.png"}
                  alt={sound.title}
                  fill
                  className="rounded-xl object-cover"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-tiktok-cyan/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-black fill-black" />
                  </div>
                </div>
              </div>

              <h1 className="text-xl font-bold text-white mb-1 truncate">
                {sound.title}
              </h1>
              {sound.author && (
                <p className="text-white/60 mb-4">by {sound.author}</p>
              )}

              <button className="w-full py-3 bg-tiktok-cyan text-black font-semibold rounded-xl hover:bg-tiktok-cyan/90 transition-colors flex items-center justify-center gap-2">
                <Music className="w-5 h-5" />
                Use This Sound
              </button>
            </div>
          </motion.div>

          {/* Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 space-y-6"
          >
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 bg-white/[0.02] border border-white/10 rounded-xl">
                <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                  <Users className="w-4 h-4" />
                  Uses
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatUses(sound.uses)}
                </div>
                <div className="text-xs text-white/40">Total videos</div>
              </div>

              <div className="p-5 bg-white/[0.02] border border-white/10 rounded-xl">
                <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                  <TrendingUp className="w-4 h-4" />
                  Growth
                </div>
                <div className={`text-2xl font-bold ${sound.growthRate > 0 ? "text-green-400" : "text-red-400"}`}>
                  {sound.growthRate > 0 ? "+" : ""}{sound.growthRate.toFixed(1)}%
                </div>
                <div className="text-xs text-white/40">Last 7 days</div>
              </div>

              <div className="p-5 bg-white/[0.02] border border-white/10 rounded-xl">
                <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                  <ArrowUpRight className="w-4 h-4" />
                  Growth
                </div>
                <div className="text-2xl font-bold text-tiktok-cyan">
                  {sound.growthRate?.toFixed(1) || "N/A"}%
                </div>
                <div className="text-xs text-white/40">Rate</div>
              </div>

              <div className="p-5 bg-white/[0.02] border border-white/10 rounded-xl">
                <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                  <Clock className="w-4 h-4" />
                  Trending Since
                </div>
                <div className="text-xl font-bold text-white">
                  {formatDate(sound.trendingSince)}
                </div>
                <div className="text-xs text-white/40">First seen</div>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="p-6 bg-white/[0.02] border border-white/10 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4">AI Analysis</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-white/60 text-sm">Viral Score</span>
                  <div className="text-2xl font-bold text-tiktok-pink">
                    {sound.viralScore?.toFixed(1) || "N/A"}
                    <span className="text-sm text-white/40">/100</span>
                  </div>
                </div>
                <div>
                  <span className="text-white/60 text-sm">Status</span>
                  <div className="flex items-center gap-2 mt-1">
                    {sound.isViral ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-green-400 font-semibold">Viral Now</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-yellow-400" />
                        <span className="text-yellow-400 font-semibold">Stable</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* TikTok Link */}
            {sound.tiktokId && (
              <a
                href={`https://www.tiktok.com/music/${sound.tiktokId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-gradient-to-r from-tiktok-cyan/10 to-tiktok-pink/10 border border-tiktok-cyan/20 rounded-xl hover:border-tiktok-cyan/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-semibold mb-1">View on TikTok</h4>
                    <p className="text-white/60 text-sm">See all videos using this sound</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-tiktok-cyan" />
                </div>
              </a>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
