"use client";

import { useState } from "react";
import { useSession } from "@/components/session-provider";
import { AuthModal } from "@/components/auth-modal";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";

interface WatchlistButtonProps {
  type: "trend" | "hashtag" | "creator";
  id: string;
  variant?: "icon" | "button";
  className?: string;
}

export function WatchlistButton({ type, id, variant = "icon", className = "" }: WatchlistButtonProps) {
  const { user } = useSession();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const handleClick = async () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("session_token");

      if (isInWatchlist) {
        // Remove from watchlist
        const response = await fetch("/api/watchlist", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id }),
        });

        if (response.ok) {
          setIsInWatchlist(false);
        }
      } else {
        // Add to watchlist
        const response = await fetch("/api/watchlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ type, id }),
        });

        if (response.ok) {
          setIsInWatchlist(true);
        }
      }
    } catch (error) {
      console.error("Watchlist action failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "button") {
    return (
      <>
        <button
          onClick={handleClick}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 ${
            isInWatchlist
              ? "bg-[#ff0050]/20 text-[#ff0050] border border-[#ff0050]/30"
              : "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700"
          } ${className}`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isInWatchlist ? (
            <>
              <BookmarkCheck className="w-4 h-4" />
              Saved
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4" />
              Watch
            </>
          )}
        </button>
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`p-2 rounded-lg transition-all disabled:opacity-50 ${
          isInWatchlist
            ? "bg-[#ff0050]/20 text-[#ff0050]"
            : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
        } ${className}`}
        title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isInWatchlist ? (
          <BookmarkCheck className="w-4 h-4" />
        ) : (
          <Bookmark className="w-4 h-4" />
        )}
      </button>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
