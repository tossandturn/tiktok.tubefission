"use client";

import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, Eye, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Trend } from "@/lib/data";

interface MissedTrendsProps {
  trends: Trend[];
}

export function MissedTrends({ trends }: MissedTrendsProps) {
  return (
    <section className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-tiktok-red" />
          You Missed
        </h2>
        <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
          Peaked
        </span>
      </div>

      <div className="space-y-3">
        {trends.map((trend, i) => (
          <motion.div
            key={trend.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <Link href={`/trend/${trend.id}`} className="block group">
              <div className="relative flex gap-3 p-3 bg-gradient-to-r from-tiktok-red/5 to-transparent rounded-xl border border-white/5 hover:border-tiktok-red/20 transition-colors">
                {/* Thumbnail */}
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={trend.thumbnail}
                    alt={trend.title}
                    fill
                    className="object-cover grayscale-[30%] group-hover:grayscale-0 transition-all"
                    sizes="80px"
                  />
                  <div className="absolute inset-0 bg-tiktok-red/10" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-tiktok-red uppercase tracking-wider bg-tiktok-red/10 px-1.5 py-0.5 rounded">
                      Saturated
                    </span>
                    {trend.peakExpected && (
                      <span className="text-[10px] text-white/30 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        Peaked {trend.peakExpected}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-white truncate group-hover:text-tiktok-red transition-colors">
                    {trend.title}
                  </h3>

                  <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{trend.description}</p>

                  <div className="flex items-center gap-3 mt-2 text-[10px] text-white/30">
                    <span className="flex items-center gap-0.5 text-tiktok-red">
                      <TrendingUp className="w-3 h-3" />
                      +{trend.growthRate}%
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Eye className="w-3 h-3" />
                      {trend.views}
                    </span>
                    <span>{trend.creators.toLocaleString()} creators</span>
                  </div>
                </div>

                {/* Saturation indicator */}
                <div className="absolute right-3 top-3 w-8 h-8 rounded-full border-2 border-tiktok-red/20 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-tiktok-red">{trend.saturation || 0}%</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
