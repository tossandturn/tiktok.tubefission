"use client";

import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyInsightCardProps {
  insight: string;
  index: number;
}

export function DailyInsightCard({ insight, index }: DailyInsightCardProps) {
  // Parse insight type based on content
  const getInsightType = (text: string) => {
    if (text.includes("engagement") || text.includes("rate"))
      return { icon: TrendingUp, color: "text-green-400", bg: "bg-green-400/10" };
    if (text.includes("time") || text.includes("posted") || text.includes("PM"))
      return { icon: Clock, color: "text-tiktok-cyan", bg: "bg-tiktok-cyan/10" };
    if (text.includes("reach") || text.includes("views"))
      return { icon: Users, color: "text-purple-400", bg: "bg-purple-400/10" };
    return { icon: Lightbulb, color: "text-yellow-400", bg: "bg-yellow-400/10" };
  };

  const type = getInsightType(insight);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-zinc-950 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors group"
    >
      <div className="flex items-start gap-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", type.bg)}>
          <type.icon className={cn("w-5 h-5", type.color)} />
        </div>
        <p className="text-sm text-white/70 leading-relaxed group-hover:text-white transition-colors">
          {insight}
        </p>
      </div>
    </motion.div>
  );
}
