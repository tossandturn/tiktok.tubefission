"use client";

import { SaaSHero } from "@/components/saas-hero";
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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* 1. Hero Section */}
      <SaaSHero />

      {/* 2. Social Proof */}
      <SocialProof />

      {/* 3. Trend Dashboard Preview */}
      <DashboardPreview />

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

      {/* 9. Testimonials */}
      <Testimonials />

      {/* 10. FAQ */}
      <FAQ />

      {/* 11. Final CTA */}
      <FinalCTA />
    </div>
  );
}
