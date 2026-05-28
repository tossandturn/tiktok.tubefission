"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Check } from "lucide-react";

interface RefreshIndicatorProps {
  lastUpdated?: Date;
}

export function RefreshIndicator({ lastUpdated }: RefreshIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const update = () => {
      const date = lastUpdated || new Date();
      const now = new Date();
      const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diff < 60) setTimeAgo("Just now");
      else if (diff < 3600) setTimeAgo(`${Math.floor(diff / 60)}m ago`);
      else if (diff < 86400) setTimeAgo(`${Math.floor(diff / 3600)}h ago`);
      else setTimeAgo(`${Math.floor(diff / 86400)}d ago`);
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex items-center gap-1.5 text-[10px] text-white/30">
        <Check className="w-3 h-3 text-green-400" />
        <span className="font-mono uppercase tracking-wider">Data refreshed {timeAgo}</span>
      </div>
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="p-1.5 rounded-md hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors disabled:opacity-50"
      >
        <motion.div animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}>
          <RefreshCw className="w-3 h-3" />
        </motion.div>
      </button>
    </div>
  );
}
