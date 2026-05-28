"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-tiktok-cyan/10 via-transparent to-transparent" />
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-tiktok-cyan/10 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tiktok-cyan/10 border border-tiktok-cyan/20 mb-6">
            <Sparkles className="w-4 h-4 text-tiktok-cyan" />
            <span className="text-sm text-tiktok-cyan">Start Free Today</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Predict
            <br />
            <span className="bg-gradient-to-r from-tiktok-cyan to-tiktok-pink bg-clip-text text-transparent">
              The Next Viral Trend?
            </span>
          </h2>

          {/* Subheadline */}
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
            Join 10,000+ creators using AI to stay ahead. Get your first prediction in 60 seconds — no credit card required.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/explore">
              <Button
                size="lg"
                className="bg-gradient-to-r from-tiktok-cyan to-tiktok-cyan/80 hover:from-tiktok-cyan/90 hover:to-tiktok-cyan/70 text-black font-semibold px-8 py-6 text-lg rounded-full group"
              >
                Start Free Analysis
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/40 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-white/10 border border-white/20" />
                ))}
              </div>
              <span>10,000+ creators</span>
            </div>
            <span>✓ No credit card required</span>
            <span>✓ Cancel anytime</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
