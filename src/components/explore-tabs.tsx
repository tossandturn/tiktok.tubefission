"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Users, Hash, Music, Verified, Play } from "lucide-react";

interface Creator {
  id: string;
  username: string;
  displayName: string;
  avatar?: string | null;
  followers: number;
  niche?: string | null;
  momentumScore?: number | null;
  isVerified?: boolean;
}

interface HashtagItem {
  id: string;
  name: string;
  views: string;
  videos: number;
  growthRate: number;
  category?: string | null;
  isRising?: boolean;
  viralScore?: number | null;
}

interface SoundItem {
  id: string;
  title: string;
  author?: string | null;
  thumbnail?: string | null;
  uses: number;
  growthRate: number;
  isViral?: boolean;
  viralScore?: number | null;
  trendingSince?: Date | null;
}

interface ExploreTabsProps {
  creators: Creator[];
  hashtags: HashtagItem[];
  sounds: SoundItem[];
  activeTab?: string;
}

const tabs = [
  { id: "creators", label: "Creators", icon: Users },
  { id: "hashtags", label: "Hashtags", icon: Hash },
  { id: "sounds", label: "Sounds", icon: Music },
];

export function ExploreTabs({ creators, hashtags, sounds, activeTab: controlledActiveTab }: ExploreTabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState("creators");
  const activeTab = controlledActiveTab ?? internalActiveTab;
  const setActiveTab = controlledActiveTab ? () => {} : setInternalActiveTab;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatViews = (views: string) => {
    const num = parseInt(views.replace(/[^0-9]/g, ""));
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return views;
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.id ? "text-white" : "text-white/50 hover:text-white/70"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-tiktok-cyan"
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "creators" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {creators.map((creator) => (
              <Link
                key={creator.id}
                href={`/creator/${creator.username}`}
                className="group p-4 bg-white/[0.02] border border-white/10 rounded-xl hover:border-tiktok-cyan/30 transition-all"
              >
                <div className="relative w-16 h-16 mx-auto mb-3">
                  <Image
                    src={creator.avatar || "/placeholder-avatar.png"}
                    alt={creator.displayName}
                    fill
                    className="rounded-full object-cover"
                  />
                  {creator.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-tiktok-cyan rounded-full flex items-center justify-center">
                      <Verified className="w-3 h-3 text-black" />
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-white text-center truncate">
                  {creator.displayName}
                </h3>
                <p className="text-xs text-white/50 text-center mb-2">@{creator.username}</p>
                <div className="flex items-center justify-center gap-1 text-xs text-tiktok-cyan">
                  <Users className="w-3 h-3" />
                  {formatNumber(creator.followers)}
                </div>
                {creator.niche && (
                  <span className="block text-center text-[10px] text-white/40 mt-2 uppercase tracking-wider">
                    {creator.niche}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}

        {activeTab === "hashtags" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {hashtags.map((hashtag) => (
              <Link
                key={hashtag.id}
                href={`/hashtag/${encodeURIComponent(hashtag.name)}`}
                className="group p-4 bg-white/[0.02] border border-white/10 rounded-xl hover:border-tiktok-cyan/30 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-tiktok-cyan/20 to-tiktok-pink/20 flex items-center justify-center">
                    <Hash className="w-5 h-5 text-tiktok-cyan" />
                  </div>
                  {hashtag.isRising && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-medium rounded-full">
                      Rising
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-white mb-1 truncate">
                  #{hashtag.name}
                </h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-white/60">
                    <span>Views:</span>
                    <span className="text-white">{formatViews(hashtag.views)}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Videos:</span>
                    <span className="text-white">{formatNumber(hashtag.videos)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Growth:</span>
                    <span className={`${hashtag.growthRate > 0 ? "text-green-400" : "text-red-400"}`}>
                      {hashtag.growthRate > 0 ? "+" : ""}{hashtag.growthRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {activeTab === "sounds" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sounds.map((sound) => (
              <Link
                key={sound.id}
                href={`/sound/${sound.id}`}
                className="group p-4 bg-white/[0.02] border border-white/10 rounded-xl hover:border-tiktok-cyan/30 transition-all"
              >
                <div className="relative aspect-square w-full mb-3 group/image">
                  <Image
                    src={sound.thumbnail || "/placeholder-sound.png"}
                    alt={sound.title}
                    fill
                    className="rounded-lg object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover/image:bg-black/20 transition-colors flex items-center justify-center rounded-lg opacity-0 group-hover/image:opacity-100">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </div>
                  {sound.isViral && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-tiktok-pink/80 text-white text-[10px] font-medium rounded-full">
                      Viral
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-white mb-1 truncate">
                  {sound.title}
                </h3>
                {sound.author && (
                  <p className="text-xs text-white/50 truncate mb-2">by {sound.author}</p>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60">{formatNumber(sound.uses)} uses</span>
                  <span className={`${sound.growthRate > 0 ? "text-green-400" : "text-red-400"}`}>
                    {sound.growthRate > 0 ? "+" : ""}{sound.growthRate.toFixed(0)}%
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
