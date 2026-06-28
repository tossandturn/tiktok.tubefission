"use client";

import { motion } from "framer-motion";

export function PageLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center">
      <motion.div
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Outer ring */}
        <motion.div
          className="w-16 h-16 rounded-full border-4 border-cyan-500/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500"
            style={{ borderRadius: "50%" }}
          />
        </motion.div>

        {/* Inner ring */}
        <motion.div
          className="absolute inset-2 rounded-full border-4 border-pink-500/20"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent border-b-pink-500"
            style={{ borderRadius: "50%" }}
          />
        </motion.div>

        {/* Center dot */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-2 h-2 bg-white rounded-full" />
        </motion.div>
      </motion.div>

      <motion.p
        className="mt-6 text-sm text-white/60"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Loading...
      </motion.p>
    </div>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-white/10 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-white/5 rounded animate-pulse w-1/2" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 bg-white/5 rounded animate-pulse" />
            <div className="h-3 bg-white/5 rounded animate-pulse w-5/6" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-white/10 bg-white/5">
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 bg-white/10 rounded animate-pulse flex-1" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex gap-4 items-center">
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
            <div className="flex-1 h-4 bg-white/5 rounded animate-pulse" />
            <div className="w-24 h-4 bg-white/5 rounded animate-pulse" />
            <div className="w-16 h-4 bg-white/5 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={i}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="h-3 bg-white/10 rounded animate-pulse w-20 mb-3" />
          <div className="h-8 bg-white/20 rounded animate-pulse w-24" />
          <div className="h-3 bg-white/5 rounded animate-pulse w-16 mt-2" />
        </motion.div>
      ))}
    </div>
  );
}
