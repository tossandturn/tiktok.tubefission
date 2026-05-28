"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { TrendingUp, PieChart as PieIcon, Activity } from "lucide-react";

interface ChartTrend {
  id: string;
  title: string;
  category: string;
  growthRate: number;
  viralScore?: number;
  engagement?: number;
}

interface AnalyticsChartsProps {
  trends: ChartTrend[];
}

const COLORS = ["#00f2ea", "#ff0050", "#25f4ee", "#fe2c55", "#ffffff", "#8884d8", "#82ca9d", "#ffc658"];

export function AnalyticsCharts({ trends }: AnalyticsChartsProps) {
  // Category distribution
  const categoryData = Object.entries(
    trends.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Top viral scores
  const viralScoreData = [...trends]
    .sort((a, b) => (b.viralScore || 0) - (a.viralScore || 0))
    .slice(0, 5)
    .map((t) => ({
      name: t.title.length > 12 ? t.title.slice(0, 12) + "..." : t.title,
      score: t.viralScore || 0,
    }));

  // Growth velocity area
  const growthData = [...trends]
    .sort((a, b) => (b.growthRate || 0) - (a.growthRate || 0))
    .slice(0, 6)
    .map((t) => ({
      name: t.category,
      growth: t.growthRate,
      engagement: t.engagement || 0,
    }));

  interface TooltipPayloadItem {
    name: string;
    value: number | string;
  }

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-tiktok-black/95 border border-white/10 rounded-lg px-3 py-2 text-xs">
          <p className="text-white font-medium">{label}</p>
          {payload.map((p: TooltipPayloadItem, i: number) => (
            <p key={i} className="text-white/70">
              {p.name}: <span className="text-tiktok-cyan font-bold">{p.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <section className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-tiktok-cyan" />
          Market Intelligence
        </h2>
        <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">Live Data</span>
      </div>

      <div className="space-y-4">
        {/* Viral Score Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-tiktok-cyan" />
            <span className="text-sm font-semibold text-white">Viral Score Ranking</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viralScoreData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={16}>
                  {viralScoreData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#00f2ea" : "#ff0050"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Pie + Growth Area */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <PieIcon className="w-4 h-4 text-tiktok-red" />
              <span className="text-sm font-semibold text-white">Category Distribution</span>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-1">
              {categoryData.map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-[10px] text-white/50">{cat.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-white">Growth vs Engagement</span>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f2ea" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00f2ea" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff0050" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ff0050" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="growth"
                    stroke="#00f2ea"
                    fillOpacity={1}
                    fill="url(#colorGrowth)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="engagement"
                    stroke="#ff0050"
                    fillOpacity={1}
                    fill="url(#colorEngagement)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
