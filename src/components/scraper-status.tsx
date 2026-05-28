"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

interface ScrapeLog {
  id: string;
  type: string;
  status: string;
  count: number;
  error: string | null;
  startedAt: string;
  endedAt: string | null;
  metadata: unknown;
}

interface Stats {
  total: number;
  successful: number;
  failed: number;
  successRate: string;
  last24h: {
    runs: number;
    successful: number;
  };
}

export function ScraperStatus() {
  const [logs, setLogs] = useState<ScrapeLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Note: In production, you'd need to authenticate this request
      const res = await fetch("/api/cron/logs?key=demo-key");
      const json = await res.json();
      if (json.logs) {
        setLogs(json.logs);
        setStats(json.stats);
      }
    } catch {
      setError("Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchLogs, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-center justify-center gap-2 text-white/60">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading scraper status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6">
        <p className="text-white/60 text-sm">{error}</p>
      </div>
    );
  }

  const lastRun = logs[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-tiktok-cyan" />
          <h3 className="text-lg font-bold text-white">Scraper Status</h3>
        </div>
        <button
          onClick={fetchLogs}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-white/40" />
        </button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Success Rate</p>
            <p className={`text-xl font-bold ${stats.successRate === "100.0%" ? "text-green-400" : "text-yellow-400"}`}>
              {stats.successRate}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Total Runs</p>
            <p className="text-xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Last 24h</p>
            <p className="text-xl font-bold text-tiktok-cyan">{stats.last24h.runs}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Failed</p>
            <p className={`text-xl font-bold ${stats.failed === 0 ? "text-white" : "text-tiktok-red"}`}>
              {stats.failed}
            </p>
          </div>
        </div>
      )}

      {/* Last Run */}
      {lastRun && (
        <div className="mb-6">
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Last Run</p>
          <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
            <div className="flex items-center gap-3">
              {lastRun.status === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-tiktok-red" />
              )}
              <div>
                <p className="text-sm font-medium text-white capitalize">{lastRun.type}</p>
                <p className="text-xs text-white/40">
                  {new Date(lastRun.startedAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-white">{lastRun.count}</p>
              <p className="text-[10px] text-white/40">items</p>
            </div>
          </div>
          {lastRun.error && (
            <p className="text-xs text-tiktok-red mt-2 px-1">{lastRun.error}</p>
          )}
        </div>
      )}

      {/* Recent Logs */}
      <div>
        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-3">Recent Activity</p>
        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
          {logs.slice(1, 10).map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
            >
              <div className="flex items-center gap-2">
                {log.status === "success" ? (
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-tiktok-red" />
                )}
                <span className="text-xs text-white/70 capitalize">{log.type}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40">{log.count} items</span>
                <span className="text-[10px] text-white/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(log.startedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Info */}
      <div className="mt-6 pt-4 border-t border-white/5">
        <p className="text-[10px] text-white/40 uppercase tracking-wighter mb-2">Schedule</p>
        <div className="space-y-1">
          <p className="text-xs text-white/60">
            <span className="text-tiktok-cyan">Discover Scrape:</span> Every 6 hours
          </p>
          <p className="text-xs text-white/60">
            <span className="text-tiktok-cyan">Hashtag Update:</span> Every 12 hours
          </p>
        </div>
      </div>
    </motion.div>
  );
}
