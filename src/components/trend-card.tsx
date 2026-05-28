"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp, Eye, Users, ArrowUpRight, Flame, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FloatingTags } from "./floating-tags";
import type { Trend } from "@/lib/data";

interface TrendCardProps {
  trend: Trend;
  index: number;
  layout?: "vertical" | "horizontal";
}

export function TrendCard({ trend, index, layout = "vertical" }: TrendCardProps) {
  const isVertical = layout === "vertical";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Link href={`/trend/${trend.id}`} className="block group">
        <div
          className={`relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl overflow-hidden hover:bg-white/[0.05] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${
            isVertical ? "" : "flex gap-4 p-3"
          }`}
        >
          {/* Thumbnail */}
          <div
            className={`relative overflow-hidden ${
              isVertical ? "aspect-[3/4] w-full" : "aspect-square w-24 h-24 rounded-xl flex-shrink-0"
            }`}
          >
            <Image
              src={trend.thumbnail}
              alt={trend.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes={isVertical ? "(max-width: 768px) 100vw, 400px" : "96px"}
            />

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {trend.isViral && (
              <div className="absolute top-3 left-3 flex items-center gap-1 bg-tiktok-red/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                <Flame className="w-3 h-3" />
                Viral
              </div>
            )}
            {trend.isNew && !trend.isViral && (
              <div className="absolute top-3 left-3 flex items-center gap-1 bg-tiktok-cyan/90 backdrop-blur-sm text-tiktok-black text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                <Sparkles className="w-3 h-3" />
                New
              </div>
            )}

            {/* Growth badge on image */}
            {isVertical && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-tiktok-cyan text-xs font-bold px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" />
                +{trend.growthRate}%
              </div>
            )}
          </div>

          {/* Content */}
          <div className={`${isVertical ? "p-4 space-y-3" : "flex flex-col justify-center py-1 space-y-2 flex-1 min-w-0"}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <Badge
                  variant="outline"
                  className="border-white/10 text-white/50 text-[10px] mb-2"
                >
                  {trend.category}
                </Badge>
                <h3 className="text-base font-bold text-white leading-tight group-hover:text-tiktok-cyan transition-colors line-clamp-2">
                  {trend.title}
                </h3>
              </div>
              {!isVertical && (
                <div className="flex items-center gap-1 bg-tiktok-cyan/10 text-tiktok-cyan text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">
                  <TrendingUp className="w-3 h-3" />
                  +{trend.growthRate}%
                </div>
              )}
            </div>

            <p className={`text-sm text-white/40 leading-relaxed ${isVertical ? "line-clamp-2" : "line-clamp-1"}`}>
              {trend.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-white/30">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {trend.views}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {trend.creators.toLocaleString()}
                </span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-tiktok-cyan transition-colors" />
            </div>

            {isVertical && <FloatingTags tags={trend.tags} />}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
