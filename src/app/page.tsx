"use client";

import { SaaSHero } from "@/components/saas-hero";
import { YouMayMiss } from "@/components/you-may-miss";
import { SocialProof } from "@/components/social-proof";
import { DashboardPreview } from "@/components/dashboard-preview";
import { UseCases } from "@/components/use-cases";
import { AIFeatures } from "@/components/ai-features";
import { SuccessMetrics } from "@/components/success-metrics";
import { CompetitorComparison } from "@/components/competitor-comparison";
import { FeatureDeepDive } from "@/components/feature-deep-dive";
import { Testimonials } from "@/components/testimonials";
import { FAQ } from "@/components/faq";
import { FinalCTA } from "@/components/final-cta";
import { AdBanner } from "@/components/google-ad";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* 1. Hero Section */}
      <SaaSHero />

      {/* You May Miss - Today's Missed Opportunities */}
      <YouMayMiss />

      {/* Ad Banner after Hero */}
      <div className="max-w-6xl mx-auto px-4">
        <AdBanner />
      </div>

      {/* 2. Social Proof */}
      <SocialProof />

      {/* 3. Trend Dashboard Preview */}
      <DashboardPreview />

      {/* Ad Banner after Dashboard */}
      <div className="max-w-6xl mx-auto px-4">
        <AdBanner />
      </div>

      {/* 4. Key Use Cases */}
      <UseCases />

      {/* 5. AI Intelligence Features */}
      <AIFeatures />

      {/* 6. Creator Success Metrics */}
      <SuccessMetrics />

      {/* 7. Competitor Comparison */}
      <CompetitorComparison />

      {/* 8. Feature Deep Dive */}
      <FeatureDeepDive />

      {/* Ad Banner mid-page */}
      <div className="max-w-6xl mx-auto px-4">
        <AdBanner />
      </div>

      {/* 9. Testimonials */}
      <Testimonials />

      {/* 10. FAQ */}
      <FAQ />

      {/* 11. Final CTA */}
      <FinalCTA />
    </div>
  );
}
