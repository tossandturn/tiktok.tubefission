"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const competitors = [
  { name: "Manual Research", price: "$0", features: [false, false, false, false, false, false] },
  { name: "Basic Analytics", price: "$49/mo", features: [true, false, false, false, false, false] },
  { name: "TikTok Intelligence", price: "Freemium", features: [true, true, true, true, true, true], isUs: true },
  { name: "Enterprise Tools", price: "$299/mo", features: [true, true, true, false, false, true] },
];

const features = [
  "Real-time trend detection",
  "AI viral prediction (7-day)",
  "Momentum scoring",
  "Audience overlap analysis",
  "Optimal posting times",
  "Competitor tracking",
];

export function CompetitorComparison() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why Choose Us
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Compare TikTok Intelligence with other solutions on the market.
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-2xl border border-white/10"
        >
          {/* Header */}
          <div className="grid grid-cols-5 gap-4 p-4 bg-white/5 border-b border-white/10">
            <div className="text-white/60 text-sm font-medium">Feature</div>
            {competitors.map((comp) => (
              <div key={comp.name} className={`text-center ${comp.isUs ? "text-tiktok-cyan" : "text-white/60"} text-sm font-medium`}>
                {comp.name}
              </div>
            ))}
          </div>

          {/* Features */}
          {features.map((feature, i) => (
            <div key={feature} className="grid grid-cols-5 gap-4 p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <div className="text-white/80 text-sm">{feature}</div>
              {competitors.map((comp) => (
                <div key={comp.name} className="flex items-center justify-center">
                  {comp.features[i] ? (
                    <Check className={`w-5 h-5 ${comp.isUs ? "text-tiktok-cyan" : "text-white/40"}`} />
                  ) : (
                    <X className="w-5 h-5 text-white/20" />
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* Pricing */}
          <div className="grid grid-cols-5 gap-4 p-4 bg-white/5">
            <div className="text-white/60 text-sm font-medium">Starting Price</div>
            {competitors.map((comp) => (
              <div key={comp.name} className={`text-center ${comp.isUs ? "text-tiktok-cyan font-bold" : "text-white/60"} text-sm`}>
                {comp.price}
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <p className="text-white/60 text-sm mb-4">
            Join 10,000+ creators who switched to TikTok Intelligence
          </p>
        </motion.div>
      </div>
    </section>
  );
}
