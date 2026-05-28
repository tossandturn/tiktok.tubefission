"use client";

import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { Flame, Clock, Activity, Zap } from "lucide-react";

const trendData = [
  { time: "00:00", velocity: 20, prediction: 20 },
  { time: "04:00", velocity: 35, prediction: 32 },
  { time: "08:00", velocity: 45, prediction: 48 },
  { time: "12:00", velocity: 65, prediction: 62 },
  { time: "16:00", velocity: 85, prediction: 88 },
  { time: "20:00", velocity: 92, prediction: 95 },
  { time: "24:00", velocity: 88, prediction: 92 },
];

const activeTrends = [
  { name: "Phantom Step", growth: "+340%", score: 92, isViral: true },
  { name: "AI Voice Clone", growth: "+520%", score: 96, isViral: true },
  { name: "Seamless Transitions", growth: "+210%", score: 74, isViral: false },
  { name: "Food Deconstruction", growth: "+290%", score: 85, isViral: true },
];

export function DashboardPreview() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Real-Time Trend Intelligence
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            See what&apos;s trending before your competitors. Our AI analyzes millions of data points
            to predict viral content 7 days in advance.
          </p>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Glassmorphism Card */}
          <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-tiktok-red" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="text-white/40 text-sm">Live Dashboard</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-xs">LIVE</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 p-6">
              {/* Chart Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-tiktok-cyan" />
                    Trend Velocity
                  </h3>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-white/40">Actual</span>
                    <div className="w-3 h-1 bg-tiktok-cyan rounded-full" />
                    <span className="text-white/40 ml-2">AI Prediction</span>
                    <div className="w-3 h-1 bg-tiktok-pink rounded-full" />
                  </div>
                </div>

                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <defs>
                        <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00f2ea" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#00f2ea" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0,0,0,0.8)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                        itemStyle={{ color: "#fff" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="velocity"
                        stroke="#00f2ea"
                        strokeWidth={2}
                        dot={{ fill: "#00f2ea", strokeWidth: 0, r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="prediction"
                        stroke="#ff0050"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: "#ff0050", strokeWidth: 0, r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-white">94%</div>
                    <div className="text-xs text-white/50">Accuracy</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-tiktok-cyan">7d</div>
                    <div className="text-xs text-white/50">Forecast</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-tiktok-pink">2.4h</div>
                    <div className="text-xs text-white/50">Early Access</div>
                  </div>
                </div>
              </div>

              {/* Trending List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Flame className="w-4 h-4 text-tiktok-red" />
                    Hot Trends
                  </h3>
                  <button className="text-xs text-tiktok-cyan hover:underline">View All</button>
                </div>

                <div className="space-y-2">
                  {activeTrends.map((trend, i) => (
                    <motion.div
                      key={trend.name}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="group flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-tiktok-cyan/20 to-tiktok-pink/20 flex items-center justify-center text-white font-bold text-sm">
                          {i + 1}
                        </div>
                        <div>
                          <div className="text-white font-medium text-sm">{trend.name}</div>
                          <div className="flex items-center gap-2 text-xs text-white/50">
                            <Zap className="w-3 h-3" />
                            Score: {trend.score}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-medium text-sm">{trend.growth}</div>
                        {trend.isViral && (
                          <span className="text-[10px] text-tiktok-red bg-tiktok-red/10 px-2 py-0.5 rounded-full">
                            VIRAL
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center gap-2 p-3 bg-tiktok-cyan/10 rounded-xl border border-tiktok-cyan/20">
                  <Clock className="w-4 h-4 text-tiktok-cyan" />
                  <span className="text-sm text-white/80">
                    Next trend prediction in <span className="text-tiktok-cyan font-semibold">2.4 hours</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-tiktok-cyan/20 via-transparent to-tiktok-pink/20 rounded-3xl blur-2xl opacity-50 -z-10" />
        </motion.div>
      </div>
    </section>
  );
}
