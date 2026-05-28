"use client";

import { motion } from "framer-motion";
import { Brain, Activity, LineChart, Target, Sparkles } from "lucide-react";

const aiFeatures = [
  {
    icon: Brain,
    title: "Viral Prediction Engine",
    description: "Machine learning models trained on 10M+ viral videos predict which content will trend 7 days before it explodes.",
    stat: "94%",
    statLabel: "Accuracy Rate",
  },
  {
    icon: Activity,
    title: "Momentum Scoring",
    description: "Real-time momentum analysis shows which trends are accelerating, stable, or declining — so you know exactly when to act.",
    stat: "Real-time",
    statLabel: "Updates",
  },
  {
    icon: LineChart,
    title: "Trend Velocity Graphs",
    description: "Visualize trend growth over time with velocity curves showing acceleration patterns and peak predictions.",
    stat: "7-day",
    statLabel: "Forecast",
  },
  {
    icon: Target,
    title: "Audience Overlap",
    description: "Discover untapped audiences by analyzing crossover between trending niches and your existing followers.",
    stat: "360°",
    statLabel: "Analysis",
  },
];

export function AIFeatures() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-tiktok-cyan/5 via-transparent to-transparent" />

      <div className="max-w-6xl mx-auto relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tiktok-cyan/10 border border-tiktok-cyan/20 mb-6">
            <Sparkles className="w-4 h-4 text-tiktok-cyan" />
            <span className="text-sm text-tiktok-cyan">AI-Powered Intelligence</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Intelligence That Predicts
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Our proprietary AI models analyze millions of data points to give you the edge before anyone else knows what&apos;s trending.
          </p>
        </motion.div>

        {/* AI Features Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {aiFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative p-6 bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl hover:border-tiktok-cyan/30 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tiktok-cyan/20 to-tiktok-pink/20 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-tiktok-cyan" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/60 text-sm mb-4">{feature.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-tiktok-cyan">{feature.stat}</div>
                      <div className="text-xs text-white/40">{feature.statLabel}</div>
                    </div>
                    <div className="w-24">
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: "85%" }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                          className="h-full bg-gradient-to-r from-tiktok-cyan to-tiktok-pink rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Demo Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-8 bg-gradient-to-br from-tiktok-cyan/10 to-tiktok-pink/5 border border-tiktok-cyan/20 rounded-2xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-tiktok-cyan/20 flex items-center justify-center">
                <Brain className="w-8 h-8 text-tiktok-cyan" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">AI Prediction in Action</h3>
                <p className="text-white/60 text-sm">See how our AI predicted the &quot;Phantom Step&quot; trend 5 days early</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-tiktok-cyan">5.2x</div>
                <div className="text-xs text-white/40">Engagement Boost</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-tiktok-pink">2.4M</div>
                <div className="text-xs text-white/40">Early Views</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">48h</div>
                <div className="text-xs text-white/40">Before Peak</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
