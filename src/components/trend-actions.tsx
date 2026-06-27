"use client";

import { useState } from "react";
import { Share2, Bookmark, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrendActionsProps {
  trendId: string;
  trendTitle: string;
}

export function TrendActions({ trendId, trendTitle }: TrendActionsProps) {
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    const url = `https://tiktok.tubefission.com/trend/${trendId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: trendTitle,
          url: url,
        });
      } catch {
        // User cancelled share
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch {
        // Clipboard failed
      }
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "trend",
          id: trendId,
        }),
      });

      if (res.ok) {
        setSaved(true);
      }
    } catch {
      // API failed — show visual feedback anyway
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="px-4 py-3 flex gap-2">
      <Button
        variant="outline"
        onClick={handleShare}
        className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
      >
        {shared ? (
          <>
            <Check className="w-4 h-4 mr-2 text-green-400" />
            Copied!
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </>
        )}
      </Button>
      <Button
        variant="outline"
        onClick={handleSave}
        className={`flex-1 border-white/10 hover:text-white ${
          saved
            ? "bg-tiktok-cyan/20 text-tiktok-cyan border-tiktok-cyan/50"
            : "bg-white/5 text-white hover:bg-white/10"
        }`}
      >
        {saved ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Saved
          </>
        ) : (
          <>
            <Bookmark className="w-4 h-4 mr-2" />
            Save
          </>
        )}
      </Button>
    </div>
  );
}
