"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Users, Heart, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccountHealthCardProps {
  data: {
    score: number;
    change: number;
    metrics: {
      followers: { value: number; change: number };
      engagement: { value: number; change: number };
      contentQuality: { value: number; change: number };
    };
  };
}

export function AccountHealthCard({ data }: AccountHealthCardProps) {
  const { score, change, metrics } = data;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-400";
    if (score >= 60) return "bg-yellow-400";
    return "bg-red-400";
  };

  const MetricItem = ({
    label,
    value,
    change,
    icon: Icon,
  }: {
    label: string;
    value: number;
    change: number;
    icon: React.ElementType;
  }) => (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-white/60" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-white/40">{label}</p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{value}</span>
          <span
            className={cn(
              "text-xs",
              change > 0 ? "text-green-400" : change < 0 ? "text-red-400" : "text-white/40"
            )}
          >
            {change > 0 ? "↑" : change < 0 ? "↓" : "→"} {Math.abs(change)}%
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-950 border border-white/10 rounded-2xl p-6"
    >
      {/* Overall Score */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
            <div className="text-center">
              <span className={cn("text-3xl font-bold", getScoreColor(score))}>
                {score}
              </span>
              <span className="text-xs text-white/40">/100</span>
            </div>
          </div>
          {/* Progress ring */}
          <svg
            className="absolute inset-0 w-24 h-24 -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 283} 283`}
              className={getScoreColor(score)}
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Health Score</h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={cn(
                "text-sm",
                change > 0 ? "text-green-400" : "text-red-400"
              )}
            >
              {change > 0 ? "↑" : "↓"} {Math.abs(change)} points
            </span>
            <span className="text-sm text-white/40">vs last week</span>
          </div>
          <p className="text-sm text-white/50 mt-2">
            {score >= 80
              ? "Excellent! Keep creating quality content."
              : score >= 60
              ? "Good progress. Focus on engagement."
              : "Needs attention. Check your content strategy."}
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        <MetricItem
          label="Followers"
          value={metrics.followers.value}
          change={metrics.followers.change}
          icon={Users}
        />
        <MetricItem
          label="Engagement"
          value={metrics.engagement.value}
          change={metrics.engagement.change}
          icon={Heart}
        />
        <MetricItem
          label="Content Quality"
          value={metrics.contentQuality.value}
          change={metrics.contentQuality.change}
          icon={Award}
        />
      </div>
    </motion.div>
  );
}
