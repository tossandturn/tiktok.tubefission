"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Video } from "lucide-react";

export default function TikTokAnalyzerBar() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    try {
      // First increment the analyze count
      await fetch("/api/analyze/limit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "video",
          targetUrl: url.trim(),
        }),
      });

      // Start the analysis
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (data.success && data.video?.id) {
        router.push(`/video/${data.video.id}`);
      } else {
        // If not successful, redirect to analyze page
        router.push("/analyze");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      router.push("/analyze");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-tiktok-cyan/10 to-tiktok-pink/10 border-b border-white/10">
      <div className="max-w-lg mx-auto px-4 py-3">
        <form onSubmit={handleAnalyze} className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
            <Video className="w-4 h-4 text-tiktok-cyan" />
            <input
              type="url"
              placeholder="Paste TikTok video URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-4 py-2 bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-black text-sm font-semibold rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Analyze
          </button>
        </form>
      </div>
    </div>
  );
}
