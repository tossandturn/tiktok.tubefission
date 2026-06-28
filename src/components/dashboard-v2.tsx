"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  TrendingUp,
  Users,
  Eye,
  Heart,
  Zap,
  Target,
  ArrowRight,
  Sparkles,
  Clock,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendCardV2 } from "./trend-card-v2";
import { AccountHealthCard } from "./account-health-card";
import { QuickActions } from "./quick-actions";
import { DailyInsightCard } from "./daily-insight-card";

// Types
interface Trend {
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
}

interface DashboardData {
  accountHealth: {
    score: number;
    change: number;
    metrics: {
      followers: { value: number; change: number };
      engagement: { value: number; change: number };
      contentQuality: { value: number; change: number };
    };
  };
  todayTrends: Trend[];
  opportunities: Trend[];
  insights: string[];
}

// Mock data - replace with API call
const mockData: DashboardData = {
  accountHealth: {
    score: 78,
    change: 5,
    metrics: {
      followers: { value: 85, change: 12 },
      engagement: { value: 72, change: 8 },
      contentQuality: { value: 76, change: -2 },
    },
  },
  todayTrends: [
    {
      id: "1",
      title: "AI-generated song covers trending",
      thumbnail: "/placeholder-trend.png",
      viralScore: 89,
      opportunityScore: 92,
      growthRate: 45,
      views: "12.5M",
      category: "Music",
      aiInsight: "Perfect for creators in music niche. Low competition, high engagement.",
      timeRemaining: "2 days",
    },
    {
      id: "2",
      title: "Day in the life: Remote worker edition",
      thumbnail: "/placeholder-trend.png",
      viralScore: 85,
      opportunityScore: 88,
      growthRate: 38,
      views: "8.2M",
      category: "Lifestyle",
      aiInsight: "Relatable content with strong audience retention. Good for B2B creators.",
      timeRemaining: "3 days",
    },
    {
      id: "3",
      title: "Before/After fitness transformations",
      thumbnail: "/placeholder-trend.png",
      viralScore: 82,
      opportunityScore: 90,
      growthRate: 42,
      views: "6.8M",
      category: "Fitness",
      aiInsight: "High emotional connection. Best performing in fitness vertical.",
      timeRemaining: "1 day",
    },
  ],
  opportunities: [
    {
      id: "4",
      title: "Quiet luxury aesthetic unboxing",
      thumbnail: "/placeholder-trend.png",
      viralScore: 76,
      opportunityScore: 95,
      growthRate: 28,
      views: "2.1M",
      category: "Fashion",
      aiInsight: "Emerging trend with huge potential. Early mover advantage.",
      timeRemaining: "5 days",
    },
  ],
  insights: [
    "Your engagement rate is 23% higher than last week",
    "Videos posted at 8PM get 2x more views",
    "Trending audio usage increased your reach by 45%",
  ],
};

export function DashboardV2() {
  const { accountHealth, todayTrends, opportunities, insights } = mockData;

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <header className="px-4 py-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl font-bold text-white">
                Good morning, Creator 👋
              </h1>
              <p className="text-white/50 text-sm mt-1">
                Today&apos;s trends updated 15 mins ago
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-tiktok-cyan/30 text-tiktok-cyan bg-tiktok-cyan/10"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Free Plan
            </Badge>
          </motion.div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        {/* Quick Actions */}
        <QuickActions />

        {/* Account Health Card */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-tiktok-cyan" />
              Account Health
            </h2>
            <Link
              href="/analytics"
              className="text-sm text-tiktok-cyan hover:underline"
            >
              View details →
            </Link>
          </div>
          <AccountHealthCard data={accountHealth} />
        </section>

        {/* Today's Must-Watch Trends */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              AI-Recommended Today
            </h2>
            <Link
              href="/opportunities"
              className="text-sm text-tiktok-cyan hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {todayTrends.map((trend, index) => (
              <TrendCardV2 key={trend.id} trend={trend} index={index} />
            ))}
          </div>
        </section>

        {/* Daily Insights */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-tiktok-red" />
            Insights for You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <DailyInsightCard key={index} insight={insight} index={index} />
            ))}
          </div>
        </section>

        {/* Hidden Opportunities */}
        {opportunities.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-400" />
                Hidden Opportunities
              </h2>
              <Badge className="bg-purple-500/20 text-purple-400">
                Early Access
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {opportunities.map((trend) => (
                <motion.div
                  key={trend.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-purple-500/5 to-transparent border border-purple-500/20 rounded-2xl p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-xl bg-zinc-900 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-purple-500/20 text-purple-400">
                          {trend.category}
                        </Badge>
                        <span className="text-sm text-white/50">
                          Opportunity Score: {trend.opportunityScore}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {trend.title}
                      </h3>
                      <p className="text-sm text-white/60 mb-4">
                        {trend.aiInsight}
                      </p>
                      <div className="flex items-center gap-3">
                        <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                          Analyze Now
                        </Button>
                        <span className="text-xs text-white/40">
                          ⏰ {trend.timeRemaining} remaining
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Upgrade CTA */}
        <section className="pt-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-tiktok-cyan/10 to-tiktok-red/10 border border-white/10 rounded-2xl p-8 text-center"
          >
            <h3 className="text-xl font-bold text-white mb-2">
              Unlock Full Potential
            </h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              Get unlimited trend predictions, advanced analytics, and early
              access to viral content.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-tiktok-cyan to-tiktok-red text-white font-semibold"
              >
                Upgrade to Pro
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" size="lg">
                View Pricing
              </Button>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

// Sub-components would be in separate files
