"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp,
  Target,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TrendCardV2Props {
  trend: {
    id: string;
    title: string;
    thumbnail: string;
    viralScore: number;
    opportunityScore: number;
    growthRate: number;
    views: string;
    category: string;
    aiInsight: string;
    timeRemaining: string;
  };
  index: number;
}

export function TrendCardV2({ trend, index }: TrendCardV2Props) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    return "text-white/60";
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return "bg-green-400";
    if (score >= 70) return "bg-yellow-400";
    return "bg-white/60";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden hover:border-tiktok-cyan/30 transition-all"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={trend.thumbnail}
          alt={trend.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Score Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <Badge className="bg-black/60 backdrop-blur-sm text-white border-0">
            <Target className="w-3 h-3 mr-1" />
            {trend.viralScore}
          </Badge>
          {trend.opportunityScore >= 90 && (
            <Badge className="bg-green-500/80 text-white border-0">
              <Sparkles className="w-3 h-3 mr-1" />
              Hot
            </Badge>
          )}
        </div>

        {/* Category */}
        <div className="absolute bottom-3 left-3">
          <Badge
            variant="outline"
            className="border-white/20 text-white/80 bg-black/40 backdrop-blur-sm"
          >
            {trend.category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-white line-clamp-2 group-hover:text-tiktok-cyan transition-colors">
          {trend.title}
        </h3>

        <p className="text-xs text-white/50 line-clamp-2">{trend.aiInsight}</p>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-green-400">
            <TrendingUp className="w-3 h-3" />
            +{trend.growthRate}%
          </div>
          <div className="text-white/40">{trend.views} views</div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-1 text-xs text-white/40">
            <Clock className="w-3 h-3" />
            {trend.timeRemaining} left
          </div>
          <Link href={`/trend/${trend.id}`}>
            <Button
              size="sm"
              variant="ghost"
              className="text-tiktok-cyan hover:text-tiktok-cyan hover:bg-tiktok-cyan/10"
            >
              Analyze
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
