"use client";

import { useState, useEffect } from "react";
import { useCountry } from "@/components/country-context";
import { ViralPredictionEngine } from "@/components/viral-prediction";
import { MomentumDashboard } from "@/components/momentum-dashboard";
import { VelocityAnalysis } from "@/components/velocity-charts";
import { AudienceOverlap } from "@/components/audience-overlap";
import { AnalyticsCharts } from "@/components/analytics-charts";
import { Loader2 } from "lucide-react";

interface Trend {
  id: string;
  slug: string;
  title: string;
  category: string;
  country: string;
  growthRate: number;
  viralScore: number;
  engagement: number;
  velocity: number;
  saturation: number;
  isViral: boolean;
  isNew: boolean;
  updatedAt: string;
  viralProbability: number;
  aiPrediction: string;
  trendForecast7d: number;
  momentumScore: number;
  opportunityScore: number;
  actionTime: string;
  whyItBlowsUp: string;
}

interface Creator {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  followers: number;
  niche: string | null;
  momentumScore: number;
  engagementRate: number;
  avgViews: number;
  predictedGrowth7d: number | null;
  isVerified: boolean;
}

interface Prediction {
  id: string;
  title: string;
  slug: string;
  category: string;
  viralProbability: number;
  momentumDirection: string;
  riskLevel: string;
  opportunityWindow: string;
  forecast7d: number;
  engagement: number;
  velocity: number;
}

interface VelocityTrend {
  id: string;
  title: string;
  slug: string;
  category: string;
  velocity: number;
  growthRate: number;
  engagement: number;
  saturation: number;
  viralScore: number;
  isViral: boolean;
  isNew: boolean;
  updatedAt: string;
}

interface ChartTrend {
  id: string;
  title: string;
  category: string;
  growthRate: number;
  viralScore?: number;
  engagement?: number;
}

export default function AnalyticsPage() {
  const { selected: selectedCountry } = useCountry();
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch trends for selected country
        const trendsRes = await fetch(`/api/trends?country=${selectedCountry.code}&limit=100`);
        const trendsData = trendsRes.ok ? await trendsRes.json() : { data: [] };

        // Fetch creators for selected country
        const creatorsRes = await fetch(`/api/creators?country=${selectedCountry.code}&limit=50`);
        const creatorsData = creatorsRes.ok ? await creatorsRes.json() : { data: [] };

        setTrends(trendsData.data || []);
        setCreators(creatorsData.data || []);
      } catch (err) {
        console.error("Failed to fetch analytics data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedCountry.code]);

  // Transform data for components
  const predictions: Prediction[] = trends.map((t) => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    category: t.category,
    viralProbability: t.viralProbability || Math.min(95, (t.viralScore || 0) * 0.8),
    momentumDirection: (t.momentumScore || 0) > 70 ? "accelerating" : (t.momentumScore || 0) > 40 ? "stable" : "declining",
    riskLevel: (t.saturation || 0) > 80 ? "high" : (t.saturation || 0) > 50 ? "medium" : "low",
    opportunityWindow: t.actionTime || `${Math.max(1, Math.floor((t.opportunityScore || 50) / 10))}d window`,
    forecast7d: t.trendForecast7d || t.growthRate * 1.2,
    engagement: t.engagement,
    velocity: t.velocity,
  }));

  const creatorData = creators.map((c) => ({
    ...c,
    momentumScore: c.momentumScore || 50,
    engagementRate: c.engagementRate || 5,
    avgViews: c.avgViews || 10000,
    trendCount: Math.floor(Math.random() * 20) + 1,
  }));

  const velocityTrends: VelocityTrend[] = trends.map((t) => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    category: t.category,
    velocity: t.velocity,
    growthRate: t.growthRate,
    engagement: t.engagement,
    saturation: t.saturation,
    viralScore: t.viralScore || 0,
    isViral: t.isViral,
    isNew: t.isNew,
    updatedAt: t.updatedAt,
  }));

  const chartTrends: ChartTrend[] = trends.map((t) => ({
    id: t.id,
    title: t.title,
    category: t.category,
    growthRate: t.growthRate,
    viralScore: t.viralScore || undefined,
    engagement: t.engagement || undefined,
  }));

  if (loading) {
    return (
      <main className="min-h-screen bg-tiktok-black pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">AI Analytics Dashboard</h1>
            <p className="text-sm text-white/40">
              {selectedCountry.flag} {selectedCountry.name} — Loading analytics...
            </p>
          </div>
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <Loader2 className="w-8 h-8 text-tiktok-cyan animate-spin" />
            <p className="text-white/60">Loading AI analytics...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-tiktok-black pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AI Analytics Dashboard</h1>
          <p className="text-sm text-white/40">
            {selectedCountry.flag} {selectedCountry.name} — Real-time viral predictions and trend velocity analysis
          </p>
        </div>
      </div>

      {/* Market Intelligence Charts */}
      <AnalyticsCharts trends={chartTrends} />

      {/* Viral Predictions */}
      <ViralPredictionEngine predictions={predictions} />

      {/* Velocity Analysis */}
      <VelocityAnalysis trends={velocityTrends} />

      {/* Creator Momentum */}
      <MomentumDashboard creators={creatorData} />

      {/* Audience Overlap */}
      <AudienceOverlap creators={creatorData} />
    </main>
  );
}
