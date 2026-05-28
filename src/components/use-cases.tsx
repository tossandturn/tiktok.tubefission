"use client";

import { motion } from "framer-motion";
import { Target, Users, BarChart3, Clock, Sparkles, Shield } from "lucide-react";

const useCases = [
  {
    icon: Target,
    title: "Predict Virality",
    description: "Get 7-day advance warning on trends before they explode. Our AI analyzes engagement patterns to forecast viral content with 94% accuracy.",
    color: "from-tiktok-cyan/20 to-tiktok-cyan/5",
  },
  {
    icon: Users,
    title: "Creator Discovery",
    description: "Find rising creators in your niche before they blow up. Analyze audience overlap and collaboration opportunities.",
    color: "from-tiktok-pink/20 to-tiktok-pink/5",
  },
  {
    icon: BarChart3,
    title: "Competitor Analysis",
    description: "Track what works for your competitors. See their trending content, posting patterns, and engagement strategies in real-time.",
    color: "from-purple-500/20 to-purple-500/5",
  },
  {
    icon: Clock,
    title: "Optimal Posting Times",
    description: "AI determines the best time to post for maximum engagement based on your audience activity and trend velocity.",
    color: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    icon: Sparkles,
    title: "Content Optimization",
    description: "Get AI-powered suggestions for titles, hashtags, and content formats that are trending in your niche.",
    color: "from-amber-500/20 to-amber-500/5",
  },
  {
    icon: Shield,
    title: "Trend Risk Assessment",
    description: "Know which trends are worth pursuing. Our saturation analysis shows opportunity vs. competition levels.",
    color: "from-rose-500/20 to-rose-500/5",
  },
];

export function UseCases() {
  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What You Can Do
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            From trend prediction to competitor analysis — everything you need to dominate TikTok.
          </p>
        </motion.div>

        {/* Use Cases Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, i) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${useCase.color} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative p-6 bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl hover:border-white/20 transition-colors h-full">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <useCase.icon className="w-6 h-6 text-tiktok-cyan" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{useCase.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{useCase.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
