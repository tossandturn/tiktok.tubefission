"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, Hash, Target, Zap, BarChart3, Sparkles } from "lucide-react";
import Link from "next/link";

interface NicheAnalysis {
  keyword: string;
  opportunityScore: number;
  competitionLevel: "low" | "medium" | "high";
  trending: boolean;
  topHashtags: string[];
  estimatedViews: string;
  creatorCount: number;
  growthRate: number;
}

export default function NicheFinderPage() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<NicheAnalysis | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAnalysis({
        keyword: keyword,
        opportunityScore: Math.floor(Math.random() * 40) + 60,
        competitionLevel: Math.random() > 0.6 ? "low" : Math.random() > 0.3 ? "medium" : "high",
        trending: Math.random() > 0.5,
        topHashtags: [
          `#${keyword}`,
          `#${keyword}tok`,
          `#viral${keyword}`,
          `#${keyword}trend`,
          `#${keyword}community`,
        ],
        estimatedViews: `${Math.floor(Math.random() * 500)}M`,
        creatorCount: Math.floor(Math.random() * 50000) + 1000,
        growthRate: Math.floor(Math.random() * 200) + 50,
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-tiktok-cyan/10 via-transparent to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <Sparkles className="w-4 h-4 text-tiktok-cyan" />
            <span className="text-sm text-white/80">AI-Powered Niche Discovery</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            TikTok
            <span className="bg-gradient-to-r from-tiktok-cyan to-tiktok-pink bg-clip-text text-transparent">
              {" "}Niche Finder
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/60 max-w-2xl mx-auto mb-8"
          >
            Discover untapped niches, analyze competition, and find the perfect
            content category to grow your TikTok presence.
          </motion.p>

          {/* Search Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleAnalyze}
            className="relative max-w-xl mx-auto"
          >
            <div className="relative flex items-center">
              <div className="absolute left-4 text-white/40">
                <Search className="w-5 h-5" />
              </div>
              <Input
                type="text"
                placeholder="Enter a keyword (e.g., cooking, fitness, gaming)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-12 pr-32 py-6 text-base bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-full focus:border-tiktok-cyan focus:ring-tiktok-cyan/20"
                disabled={loading}
              />
              <Button
                type="submit"
                disabled={loading || !keyword.trim()}
                className="absolute right-2 bg-gradient-to-r from-tiktok-cyan to-tiktok-cyan/80 hover:from-tiktok-cyan/90 hover:to-tiktok-cyan/70 text-black font-semibold px-6 py-3 rounded-full"
              >
                {loading ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
          </motion.form>
        </div>
      </section>

      {/* Analysis Results */}
      {analysis && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-12 px-4"
        >
          <div className="max-w-6xl mx-auto">
            {/* Score Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <div className="text-sm text-white/60 mb-2">Opportunity Score</div>
                <div className={`text-5xl font-bold ${
                  analysis.opportunityScore >= 80 ? "text-green-400" :
                  analysis.opportunityScore >= 60 ? "text-yellow-400" : "text-red-400"
                }`}>
                  {analysis.opportunityScore}
                </div>
                <div className="text-sm text-white/40 mt-2">/ 100</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <div className="text-sm text-white/60 mb-2">Competition Level</div>
                <div className={`text-2xl font-semibold capitalize ${
                  analysis.competitionLevel === "low" ? "text-green-400" :
                  analysis.competitionLevel === "medium" ? "text-yellow-400" : "text-red-400"
                }`}>
                  {analysis.competitionLevel}
                </div>
                <div className="text-sm text-white/40 mt-2">
                  {analysis.competitionLevel === "low" ? "Great opportunity!" :
                   analysis.competitionLevel === "medium" ? "Moderate competition" : "Highly competitive"}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <div className="text-sm text-white/60 mb-2">Trend Status</div>
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className={`w-6 h-6 ${analysis.trending ? "text-green-400" : "text-white/40"}`} />
                  <span className={`text-2xl font-semibold ${analysis.trending ? "text-green-400" : "text-white/60"}`}>
                    {analysis.trending ? "Trending" : "Stable"}
                  </span>
                </div>
                <div className="text-sm text-white/40 mt-2">
                  Growth: +{analysis.growthRate}%
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-5 h-5 text-tiktok-cyan" />
                  <h3 className="text-lg font-semibold text-white">Market Size</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-white">{analysis.estimatedViews}</div>
                    <div className="text-sm text-white/60">Monthly Views</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{analysis.creatorCount.toLocaleString()}</div>
                    <div className="text-sm text-white/60">Active Creators</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Hash className="w-5 h-5 text-tiktok-pink" />
                  <h3 className="text-lg font-semibold text-white">Top Hashtags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.topHashtags.map((tag, i) => (
                    <Link
                      key={i}
                      href={`/hashtag/${tag.replace("#", "")}`}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-sm text-white/80 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-tiktok-cyan/20 to-tiktok-pink/20 border border-white/10 rounded-2xl p-8 text-center">
              <Zap className="w-12 h-12 text-tiktok-cyan mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Ready to dominate this niche?
              </h3>
              <p className="text-white/60 mb-6">
                Get AI-powered content ideas and viral predictions for {analysis.keyword}
              </p>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-tiktok-cyan to-tiktok-cyan/80 hover:from-tiktok-cyan/90 hover:to-tiktok-cyan/70 text-black font-semibold px-8 py-6 rounded-xl">
                  Start Creating Content
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>
      )}

      {/* Features Section */}
      {!analysis && (
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-12">
              How Niche Finder Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Search className="w-8 h-8 text-tiktok-cyan" />,
                  title: "Enter a Keyword",
                  description: "Type any topic or niche you're interested in exploring",
                },
                {
                  icon: <BarChart3 className="w-8 h-8 text-tiktok-pink" />,
                  title: "Get AI Analysis",
                  description: "Our AI analyzes competition, opportunity, and trending status",
                },
                {
                  icon: <Target className="w-8 h-8 text-purple-400" />,
                  title: "Start Creating",
                  description: "Use insights to create content that stands out in your niche",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="p-6 bg-white/5 border border-white/10 rounded-xl text-center"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/60 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
