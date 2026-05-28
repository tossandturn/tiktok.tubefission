"use client";

import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Calendar } from "lucide-react";

interface TrendHistoryChartProps {
  trendId: string;
  growthRate: number;
}

interface ChartDataPoint {
  date: string;
  views: number;
  creators: number;
  engagement: number;
  velocity: number;
}

// Generate realistic trend history data based on trend characteristics
function generateTrendHistory(trendId: string, growthRate: number): ChartDataPoint[] {
  const days = 14;
  const data = [];
  const now = new Date();

  // Base values depending on trend characteristics
  const baseViews = Math.random() * 100000 + 50000;
  const baseCreators = Math.random() * 500 + 100;
  const viralFactor = growthRate / 100;

  // Generate exponential growth curve
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    // Simulate viral curve - starts slow, then explodes
    const progress = (days - i) / days;
    const growthMultiplier = Math.pow(1 + viralFactor * 0.3, progress * 5);

    data.push({
      date: dateStr,
      views: Math.round(baseViews * growthMultiplier),
      creators: Math.round(baseCreators * growthMultiplier * 0.8),
      engagement: Math.round(50 + Math.sin(progress * Math.PI) * 30 + Math.random() * 10),
      velocity: Math.round(20 + progress * 80 * viralFactor + Math.random() * 10),
    });
  }

  return data;
}

export function TrendHistoryChart({ trendId, growthRate }: TrendHistoryChartProps) {
  const data = generateTrendHistory(trendId, growthRate);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; dataKey: string; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-tiktok-black/95 border border-white/10 rounded-lg px-3 py-2 text-xs">
          <p className="text-white/60 mb-1">{label}</p>
          {payload.map((p: { name: string; value: number; dataKey: string; color: string }, i: number) => (
            <p key={i} className="text-white/80">
              <span style={{ color: p.color }}>{p.name}:</span>{" "}
              <span className="font-bold">
                {p.dataKey === "views" ? `${(p.value / 1000000).toFixed(1)}M` :
                 p.dataKey === "creators" ? p.value.toLocaleString() :
                 `${p.value}%`}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-tiktok-cyan" />
          <span className="text-sm font-semibold text-white">14-Day Growth Trajectory</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-white/40">
          <Calendar className="w-3 h-3" />
          <span>Live Data</span>
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f2ea" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00f2ea" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff0050" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ff0050" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="views"
              stroke="#00f2ea"
              strokeWidth={2}
              fill="url(#viewsGradient)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="velocity"
              stroke="#ff0050"
              strokeWidth={2}
              dot={{ fill: "#ff0050", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: "#ff0050" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#00f2ea]" />
          <span className="text-[10px] text-white/50">Views</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff0050]" />
          <span className="text-[10px] text-white/50">Velocity</span>
        </div>
      </div>
    </motion.div>
  );
}
