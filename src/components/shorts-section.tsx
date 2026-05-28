"use client";

import { motion } from "framer-motion";
import { Play, Zap, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Short {
  id: string;
  thumbnail: string;
  views: string;
  likes: string;
  duration: string;
  shortsScore: number;
  curiosityGap?: string;
  videoId?: string;
  trendId?: string;
}

interface ShortsSectionProps {
  shorts: Short[];
}

export function ShortsSection({ shorts }: ShortsSectionProps) {
  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Shorts Gold
        </h2>
        <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
          0-60s
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scrollbar-hide">
        {shorts.map((short, i) => (
          <motion.div
            key={short.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="flex-shrink-0 w-[140px] snap-start"
          >
            <Link
              href={short.trendId ? `/trend/${short.trendId}` : "#"}
              className="block group"
            >
              <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-white/5 group cursor-pointer">
                <Image
                  src={short.thumbnail}
                  alt="Short thumbnail"
                  fill
                  className="object-cover"
                  sizes="140px"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

                {/* Shorts badge */}
                <div className="absolute top-2 left-2 bg-yellow-400/90 text-tiktok-black text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                  Short
                </div>

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                  </div>
                </div>

                {/* Duration */}
                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  {short.duration}
                </div>

                {/* Stats overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center gap-2 text-[10px] text-white/80">
                    <span className="flex items-center gap-0.5">
                      <Play className="w-3 h-3" />
                      {short.views}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      {short.likes}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shorts score bar */}
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-white/40">Shorts Score</span>
                  <span className="font-bold text-yellow-400">{short.shortsScore}</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${short.shortsScore}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                  />
                </div>
                {short.curiosityGap && (
                  <p className="text-[10px] text-white/30 leading-tight mt-1">{short.curiosityGap}</p>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
