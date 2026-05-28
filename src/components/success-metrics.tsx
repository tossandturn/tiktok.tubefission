"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, Clock, Zap, Eye, Heart } from "lucide-react";

const metrics = [
  { icon: TrendingUp, value: "3.2x", label: "Average engagement boost", sublabel: "Within first week" },
  { icon: Clock, value: "8hrs", label: "Time saved weekly", sublabel: "Per creator" },
  { icon: Zap, value: "94%", label: "Prediction accuracy", sublabel: "For viral trends" },
  { icon: Users, value: "10K+", label: "Active creators", sublabel: "Growing daily" },
  { icon: Eye, value: "2.4M", label: "Avg early views", sublabel: "Before saturation" },
  { icon: Heart, value: "4.9/5", label: "Creator satisfaction", sublabel: "Based on 2,000+ reviews" },
];

const successStories = [
  {
    name: "Sarah Chen",
    handle: "@sarahcreates",
    followers: "2.4M",
    growth: "+340%",
    quote: "TikTok Intelligence helped me predict the AI Voice trend 5 days early. My video hit 12M views while others were still catching up.",
    avatar: "SC",
  },
  {
    name: "Marcus Johnson",
    handle: "@marcusdance",
    followers: "890K",
    growth: "+520%",
    quote: "The momentum scoring is game-changing. I know exactly when to jump on a trend vs when it's too late.",
    avatar: "MJ",
  },
  {
    name: "Emma Rodriguez",
    handle: "@emmaeats",
    followers: "1.8M",
    growth: "+280%",
    quote: "As a food creator, timing is everything. This tool predicted the deconstructed food trend before anyone else.",
    avatar: "ER",
  },
];

export function SuccessMetrics() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Creator Success Metrics
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Real results from creators who use TikTok Intelligence to stay ahead of trends.
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group p-6 bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl hover:border-tiktok-cyan/30 transition-all text-center"
            >
              <metric.icon className="w-6 h-6 text-tiktok-cyan mx-auto mb-3" />
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">{metric.value}</div>
              <div className="text-sm text-white/70 mb-1">{metric.label}</div>
              <div className="text-xs text-white/40">{metric.sublabel}</div>
            </motion.div>
          ))}
        </div>

        {/* Success Stories */}
        <div className="grid md:grid-cols-3 gap-6">
          {successStories.map((story, i) => (
            <motion.div
              key={story.handle}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative p-6 bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl hover:border-white/20 transition-all"
            >
              {/* Growth Badge */}
              <div className="absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-xs font-bold text-black">
                {story.growth}
              </div>

              {/* Quote */}
              <p className="text-white/80 text-sm mb-6 leading-relaxed">
                &ldquo;{story.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center text-white font-bold text-sm">
                  {story.avatar}
                </div>
                <div>
                  <div className="text-white font-medium text-sm">{story.name}</div>
                  <div className="text-white/50 text-xs">{story.handle} · {story.followers} followers</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
