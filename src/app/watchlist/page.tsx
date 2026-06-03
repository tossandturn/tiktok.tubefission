"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/components/session-provider";
import { AuthModal } from "@/components/auth-modal";
import { TrendingUp, Hash, User, Trash2, Bell, BellOff } from "lucide-react";

interface WatchlistItem {
  id: string;
  type: string;
  notes: string;
  alertEnabled: boolean;
  createdAt: string;
  trend?: { id: string; title: string; slug: string; views: string };
  hashtag?: { id: string; name: string; views: string };
  creator?: { id: string; username: string; displayName: string; followers: number };
}

export default function WatchlistPage() {
  const { user, isLoading } = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    } else if (!isLoading) {
      setAuthOpen(true);
    }
  }, [user, isLoading]);

  const fetchWatchlist = async () => {
    try {
      const token = localStorage.getItem("session_token");
      const response = await fetch("/api/watchlist", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setWatchlist(data.watchlist);
      }
    } catch (error) {
      console.error("Failed to fetch watchlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (id: string) => {
    try {
      const token = localStorage.getItem("session_token");
      const response = await fetch("/api/watchlist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setWatchlist(watchlist.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultTab="login" />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Your Watchlist</h1>
        <p className="text-zinc-400">Track trends, hashtags, and creators that matter to you.</p>
      </div>

      {watchlist.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/50 rounded-2xl border border-zinc-800">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Your watchlist is empty</h3>
          <p className="text-zinc-400 mb-6">Start tracking trends and creators to get alerts.</p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/trending"
              className="px-6 py-2 bg-gradient-to-r from-[#ff0050] to-[#ff4080] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Explore Trends
            </Link>
            <Link
              href="/explore"
              className="px-6 py-2 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-colors"
            >
              Discover Creators
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {watchlist.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                {item.trend && (
                  <>
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ff0050]/20 to-[#ff4080]/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-[#ff0050]" />
                    </div>
                    <div>
                      <Link
                        href={`/trend/${item.trend.slug}`}
                        className="font-medium text-white hover:text-[#ff0050] transition-colors"
                      >
                        {item.trend.title}
                      </Link>
                      <p className="text-sm text-zinc-500">{item.trend.views} views</p>
                    </div>
                  </>
                )}
                {item.hashtag && (
                  <>
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                      <Hash className="w-5 h-5 text-[#00f2ea]" />
                    </div>
                    <div>
                      <Link
                        href={`/hashtag/${item.hashtag.name}`}
                        className="font-medium text-white hover:text-[#00f2ea] transition-colors"
                      >
                        #{item.hashtag.name}
                      </Link>
                      <p className="text-sm text-zinc-500">{item.hashtag.views} views</p>
                    </div>
                  </>
                )}
                {item.creator && (
                  <>
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                      <User className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                      <Link
                        href={`/creator/${item.creator.username}`}
                        className="font-medium text-white hover:text-zinc-300 transition-colors"
                      >
                        @{item.creator.username}
                      </Link>
                      <p className="text-sm text-zinc-500">
                        {item.creator.followers.toLocaleString()} followers
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  className={`p-2 rounded-lg transition-colors ${
                    item.alertEnabled ? "text-[#ff0050]" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  title={item.alertEnabled ? "Alerts enabled" : "Alerts disabled"}
                >
                  {item.alertEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => removeFromWatchlist(item.id)}
                  className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Remove from watchlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
