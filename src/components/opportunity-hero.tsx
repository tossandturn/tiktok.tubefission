"use client";

import { motion } from "framer-motion";
import { TrendingUp, Zap, Clock, Target, ArrowRight, Globe } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Trend } from "@/lib/data";

interface OpportunityHeroProps {
  trend: Trend;
}

export function OpportunityHero({ trend }: OpportunityHeroProps) {
  return (
    <section className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-tiktok-cyan" />
          Today&apos;s Biggest Opportunity
        </h2>
        <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider flex items-center gap-1">
          <Globe className="w-3 h-3" />
          {trend.country || "US"}
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link href={`/trend/${trend.id}`} className="block group">
          <div className="relative bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-sm border border-white/[0.08] rounded-2xl overflow-hidden">
            {/* Top image */}
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              <Image
                src={trend.thumbnail}
                alt={trend.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 512px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-tiktok-black via-tiktok-black/40 to-transparent" />

              {/* Opportunity badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-tiktok-cyan/90 backdrop-blur-sm text-tiktok-black text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                <Zap className="w-3.5 h-3.5" />
                Top Opportunity
              </div>

              {/* Urgency badge */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-tiktok-red/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                {trend.urgency || "MEDIUM"} urgency
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-xl font-bold text-white leading-tight group-hover:text-tiktok-cyan transition-colors">
                  {trend.title}
                </h3>
                <p className="text-sm text-white/50 mt-1.5 leading-relaxed">
                  {trend.description}
                </p>
              </div>

              {/* Analytics bars */}
              <div className="space-y-2.5 py-2">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider w-20">Viral Score</span>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${trend.viralScore || 0}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full bg-gradient-to-r from-tiktok-cyan to-tiktok-red rounded-full"
                    />
                  </div>
                  <span className="text-xs font-bold text-white w-8 text-right">{trend.viralScore || 0}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider w-20">Opportunity</span>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${trend.opportunityScore || 0}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-green-400 to-tiktok-cyan rounded-full"
                    />
                  </div>
                  <span className="text-xs font-bold text-white w-8 text-right">{trend.opportunityScore || 0}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider w-20">Engagement</span>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${trend.engagement || 0}%` }}
                      transition={{ duration: 1, delay: 0.7 }}
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                    />
                  </div>
                  <span className="text-xs font-bold text-white w-8 text-right">{trend.engagement || 0}</span>
                </div>
              </div>

              {/* Why it blows up + Action time */}
              {(trend.whyItBlowsUp || trend.actionTime) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {trend.whyItBlowsUp && (
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <span className="text-[10px] font-medium text-tiktok-cyan uppercase tracking-wider">Why it blows up</span>
                      <p className="text-xs text-white/60 mt-1 leading-relaxed">{trend.whyItBlowsUp}</p>
                    </div>
                  )}
                  {trend.actionTime && (
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <span className="text-[10px] font-medium text-tiktok-red uppercase tracking-wider">Act before</span>
                      <p className="text-xs text-white/60 mt-1 leading-relaxed">{trend.actionTime}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom stats */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4 text-xs text-white/40">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-tiktok-cyan" />
                    +{trend.growthRate}%
                  </span>
                  <span>{trend.views} views</span>
                  <span>{trend.creators.toLocaleString()} creators</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-tiktok-cyan group-hover:translate-x-0.5 transition-transform">
                  Analyze <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    </section>
  );
}
