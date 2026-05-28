"use client";

import { motion } from "framer-motion";
import { Brain, LineChart, Users, Clock, Target, Zap } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Prediction Engine",
    description: "Proprietary ML models analyze engagement patterns, sound adoption rates, and creator behavior to predict viral content 7 days before it peaks.",
    details: [
      "Trained on 10M+ viral videos",
      "94% prediction accuracy",
      "Real-time model updates",
      "Multi-factor analysis",
    ],
  },
  {
    icon: LineChart,
    title: "Trend Velocity Tracking",
    description: "Monitor how fast trends are growing with velocity curves and acceleration indicators.",
    details: [
      "Growth velocity scoring",
      "Peak time prediction",
      "Saturation monitoring",
      "Cross-platform tracking",
    ],
  },
  {
    icon: Users,
    title: "Audience Intelligence",
    description: "Understand your audience and discover untapped segments through overlap analysis.",
    details: [
      "Audience overlap mapping",
      "Demographics insights",
      "Interest clustering",
      "Growth opportunity scoring",
    ],
  },
  {
    icon: Clock,
    title: "Optimal Timing",
    description: "AI determines the best posting times based on your audience activity and trend cycles.",
    details: [
      "Personalized recommendations",
      "Timezone optimization",
      "Trend cycle alignment",
      "Competitor gap analysis",
    ],
  },
  {
    icon: Target,
    title: "Opportunity Scoring",
    description: "Each trend gets an opportunity score based on growth potential vs competition level.",
    details: [
      "Blue-ocean detection",
      "Competition analysis",
      "Niche fit scoring",
      "Risk assessment",
    ],
  },
  {
    icon: Zap,
    title: "Creator Discovery",
    description: "Find rising creators in your niche before they blow up.",
    details: [
      "Momentum tracking",
      "Early adopter detection",
      "Collaboration matching",
      "Influencer scoring",
    ],
  },
];

export function FeatureDeepDive() {
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
            Feature Deep Dive
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Everything you need to dominate TikTok, powered by AI.
          </p>
        </motion.div>

        {/* Features */}
        <div className="space-y-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-6 bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl hover:border-tiktok-cyan/30 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-tiktok-cyan/20 to-tiktok-pink/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-tiktok-cyan" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/60 mb-4">{feature.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {feature.details.map((detail) => (
                      <div key={detail} className="flex items-center gap-2 text-sm text-white/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-tiktok-cyan" />
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
