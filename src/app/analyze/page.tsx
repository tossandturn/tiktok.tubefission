"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, ArrowRight, Video, Lock } from "lucide-react";
import { LoginModal } from "@/components/login-modal";

interface AnalyzeLimit {
  isAuthenticated: boolean;
  usedAnalyzes: number;
  remainingAnalyzes: number;
  maxAnalyzes: number;
  hasReachedLimit: boolean;
  needsLogin: boolean;
}

export default function AnalyzePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [limit, setLimit] = useState<AnalyzeLimit>({
    isAuthenticated: false,
    usedAnalyzes: 0,
    remainingAnalyzes: 1,
    maxAnalyzes: 1,
    hasReachedLimit: false,
    needsLogin: false,
  });

  // Check analyze limit on mount
  useEffect(() => {
    checkAnalyzeLimit();
  }, []);

  const checkAnalyzeLimit = async () => {
    try {
      const response = await fetch("/api/analyze/limit");
      if (response.ok) {
        const data = await response.json();
        setLimit(data);
      }
    } catch (err) {
      console.error("Failed to check analyze limit:", err);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    // Check if user has reached limit
    if (limit.hasReachedLimit && !limit.isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // First increment the analyze count
      await fetch("/api/analyze/limit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "video",
          targetUrl: url.trim(),
        }),
      });

      // Start the analysis
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Analysis failed");
      }

      if (data.success && data.video?.id) {
        // Redirect to video page after successful analysis
        window.location.href = `/video/${data.video.id}`;
        return;
      }

      // If we get here without a video ID, show error
      throw new Error(data.error || "Analysis failed. Please check the URL and try again.");

    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Failed to analyze video");
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-black">
          <div className="absolute inset-0 bg-gradient-to-b from-tiktok-cyan/10 via-transparent to-tiktok-pink/5" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-tiktok-cyan/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-tiktok-pink/15 rounded-full blur-[120px] animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <Sparkles className="w-4 h-4 text-tiktok-cyan" />
            <span className="text-sm text-white/80">AI-Powered Video Analysis</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6"
          >
            Analyze Any
            <span className="bg-gradient-to-r from-tiktok-cyan to-tiktok-pink bg-clip-text text-transparent">
              {" "}TikTok Video
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-white/60 max-w-xl mx-auto mb-6"
          >
            Paste a TikTok video URL to get instant AI-powered analytics,
            engagement insights, and viral potential scoring.
          </motion.p>

          {/* Analyze Limit Indicator */}
          {!limit.isAuthenticated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                {limit.hasReachedLimit ? (
                  <>
                    <Lock className="w-4 h-4 text-tiktok-pink" />
                    <span className="text-sm text-white/60">
                      Free limit reached. Sign up for unlimited analyzes.
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-white/60">
                      Free analyzes remaining today:
                      <span className="text-tiktok-cyan font-semibold ml-1">
                        {limit.remainingAnalyzes}/{limit.maxAnalyzes}
                      </span>
                    </span>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Search Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onSubmit={handleAnalyze}
            className="relative max-w-2xl mx-auto"
          >
            <div className="relative flex items-center">
              <div className="absolute left-4 text-white/40">
                <Video className="w-5 h-5" />
              </div>
              <Input
                type="url"
                placeholder="https://www.tiktok.com/@username/video/1234567890"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-12 pr-32 py-6 text-base bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-full focus:border-tiktok-cyan focus:ring-tiktok-cyan/20"
                disabled={loading}
              />
              <Button
                type="submit"
                disabled={loading || !url.trim()}
                className="absolute right-2 bg-gradient-to-r from-tiktok-cyan to-tiktok-cyan/80 hover:from-tiktok-cyan/90 hover:to-tiktok-cyan/70 text-black font-semibold px-6 py-3 rounded-full"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Analyze
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.form>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400"
            >
              {error}
            </motion.div>
          )}

          {/* URL Format Help */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-white/40 text-sm"
          >
            <p className="mb-2">Supported URL formats:</p>
            <div className="flex flex-wrap justify-center gap-2">
              <code className="px-2 py-1 bg-white/5 rounded text-xs">
                https://www.tiktok.com/@user/video/1234567890
              </code>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-12">
            What You&apos;ll Get
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "📊",
                title: "Engagement Metrics",
                desc: "Views, likes, comments, shares, and engagement rate analysis",
              },
              {
                icon: "🤖",
                title: "AI Insights",
                desc: "AI-powered viral potential scoring and content recommendations",
              },
              {
                icon: "📈",
                title: "Trend Analysis",
                desc: "Compare performance against trending videos in your niche",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="p-6 bg-white/5 border border-white/10 rounded-xl"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/60 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        remainingAnalyzes={limit.remainingAnalyzes}
      />
    </div>
  );
}
