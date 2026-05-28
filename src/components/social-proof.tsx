"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, Zap, Eye, BarChart3, Clock } from "lucide-react";

const stats = [
  { label: "Trends Predicted", value: "12,847", change: "+23%", icon: TrendingUp },
  { label: "Active Creators", value: "10,000+", change: "+18%", icon: Users },
  { label: "Avg Engagement Boost", value: "3.2x", change: "+15%", icon: Zap },
  { label: "Total Views Tracked", value: "256M+", change: "+42%", icon: Eye },
  { label: "Success Rate", value: "94%", change: "+7%", icon: BarChart3 },
  { label: "Time Saved", value: "8h/week", change: "per creator", icon: Clock },
];

const logos = [
  { name: "Creator One", color: "from-blue-500/20 to-blue-600/20" },
  { name: "Agency Pro", color: "from-purple-500/20 to-purple-600/20" },
  { name: "Brand Studio", color: "from-pink-500/20 to-pink-600/20" },
  { name: "Content House", color: "from-cyan-500/20 to-cyan-600/20" },
  { name: "Media Lab", color: "from-emerald-500/20 to-emerald-600/20" },
];

export function SocialProof() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-6 bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl">
                <div className="flex items-start justify-between mb-4">
                  <stat.icon className="w-6 h-6 text-tiktok-cyan" />
                  <span className="text-xs text-green-400 font-medium">{stat.change}</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trusted By */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-white/40 text-sm mb-8 uppercase tracking-widest">Trusted by leading creators & agencies</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {logos.map((logo, i) => (
              <motion.div
                key={logo.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`px-6 py-3 rounded-xl bg-gradient-to-r ${logo.color} border border-white/10`}
              >
                <span className="text-white/60 font-medium text-sm">{logo.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
