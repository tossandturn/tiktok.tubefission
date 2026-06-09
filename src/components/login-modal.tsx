"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Lock, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  remainingAnalyzes?: number;
}

export function LoginModal({ isOpen, onClose, remainingAnalyzes = 0 }: LoginModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-tiktok-cyan/20 to-tiktok-pink/20 flex items-center justify-center border border-tiktok-cyan/30">
              <Lock className="w-8 h-8 text-tiktok-cyan" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center mb-3">
            Unlock Unlimited Analysis
          </h2>

          {/* Description */}
          <p className="text-white/60 text-center mb-6">
            You&apos;ve used your free analyze. Sign up for free to continue
            analyzing TikTok videos with AI-powered insights.
          </p>

          {/* Benefits */}
          <div className="space-y-3 mb-8">
            {[
              { icon: "✨", text: "Unlimited video analysis" },
              { icon: "📊", text: "AI-powered viral predictions" },
              { icon: "🔔", text: "Trend alerts & notifications" },
              { icon: "📈", text: "Competitor tracking" },
            ].map((benefit, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-white/80"
              >
                <span className="text-lg">{benefit.icon}</span>
                <span className="text-sm">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Link href="/register" className="block w-full">
              <Button
                className="w-full bg-gradient-to-r from-tiktok-cyan to-tiktok-cyan/80 hover:from-tiktok-cyan/90 hover:to-tiktok-cyan/70 text-black font-semibold py-6 rounded-xl group"
              >
                <Sparkles className="mr-2 w-5 h-5" />
                Sign Up Free
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login" className="block w-full">
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10 py-6 rounded-xl"
              >
                Already have an account? Sign In
              </Button>
            </Link>
          </div>

          {/* Remaining analyzes hint */}
          {remainingAnalyzes > 0 && (
            <p className="text-center text-white/40 text-sm mt-4">
              You have {remainingAnalyzes} free analyze remaining today.
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
