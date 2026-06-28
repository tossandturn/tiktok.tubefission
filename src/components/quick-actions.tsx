"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Zap,
  BarChart3,
  Users,
  Target,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  {
    label: "Trend Radar",
    description: "Discover viral content",
    icon: Target,
    href: "/opportunities",
    color: "from-tiktok-cyan to-blue-500",
    priority: "high",
  },
  {
    label: "My Analytics",
    description: "Account performance",
    icon: BarChart3,
    href: "/analytics",
    color: "from-purple-500 to-pink-500",
    priority: "medium",
  },
  {
    label: "Find Creators",
    description: "Competitor research",
    icon: Users,
    href: "/explore",
    color: "from-orange-500 to-red-500",
    priority: "medium",
  },
];

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-3"
    >
      {actions.map((action, index) => (
        <Link key={action.label} href={action.href}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative overflow-hidden bg-zinc-950 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
          >
            {/* Gradient background on hover */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-5 transition-opacity`}
            />

            <div className="relative flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center`}
              >
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{action.label}</span>
                  {action.priority === "high" && (
                    <span className="text-[10px] bg-tiktok-cyan/20 text-tiktok-cyan px-1.5 py-0.5 rounded">
                      Hot
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/40">{action.description}</p>
              </div>
              <ArrowRight
                className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors"
              />
            </div>
          </motion.div>
        </Link>
      ))}
    </motion.div>
  );
}
