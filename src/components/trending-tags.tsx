"use client";

import { motion } from "framer-motion";
import { Hash } from "lucide-react";

interface TagBubble {
  name: string;
  count: number;
  growth: number;
}

interface TrendingTagsProps {
  tags: TagBubble[];
}

export function TrendingTags({ tags }: TrendingTagsProps) {
  const maxCount = Math.max(...tags.map((t) => t.count));

  return (
    <section className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Hash className="w-5 h-5 text-tiktok-cyan" />
          Trending Tags
        </h2>
        <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Live</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => {
          const size = 0.75 + (tag.count / maxCount) * 0.5;
          const isHot = tag.growth > 200;

          return (
            <motion.button
              key={tag.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors ${
                isHot
                  ? "bg-tiktok-red/10 border-tiktok-red/30 text-tiktok-red hover:bg-tiktok-red/20"
                  : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
              style={{ fontSize: `${size}rem` }}
            >
              <span className="text-xs">#{tag.name}</span>
              <span className={`text-[10px] font-mono ${isHot ? "text-tiktok-red/70" : "text-white/30"}`}>
                +{tag.growth}%
              </span>
              {isHot && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-tiktok-red animate-pulse" />
              )}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
