"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, ExternalLink, Loader2 } from "lucide-react";
import Image from "next/image";

interface TikTokEmbedProps {
  videoId?: string;
  username?: string;
  thumbnail: string | null;
  views?: string;
  likes?: string;
  duration?: string;
  searchQuery?: string;
  embedUrl?: string;
}

export function TikTokEmbed({
  videoId,
  username,
  thumbnail,
  views,
  likes,
  duration,
  searchQuery,
  embedUrl
}: TikTokEmbedProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [embedHtml, setEmbedHtml] = useState<string | null>(null);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setIsLoading(true);

    // If we have an embed URL, fetch the oEmbed data
    if (embedUrl) {
      fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(embedUrl)}`)
        .then(res => res.json())
        .then(data => {
          setEmbedHtml(data.html || null);
          setIsLoading(false);
        })
        .catch(() => {
          setEmbedHtml(null);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [embedUrl]);

  const handleOpenTikTok = useCallback(() => {
    const query = searchQuery || (videoId ? `video ${videoId}` : "trending");
    const url = username && videoId
      ? `https://www.tiktok.com/@${username}/video/${videoId}`
      : `https://www.tiktok.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [searchQuery, videoId, username]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="flex-shrink-0 w-[160px] snap-start cursor-pointer group"
        onClick={handleOpen}
      >
        <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-white/5">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt="Video thumbnail"
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="160px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
              <Play className="w-10 h-10 text-zinc-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>

          {/* Duration */}
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
            {duration}
          </div>

          {/* Stats overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-2 text-[10px] text-white/80">
              <span className="flex items-center gap-0.5">
                <Play className="w-3 h-3" />
                {views}
              </span>
              <span className="flex items-center gap-0.5">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                {likes}
              </span>
            </div>
          </div>

          {/* Hover overlay with watch text */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-tiktok-cyan text-black text-xs font-bold px-3 py-1 rounded-full">
              Click to Watch
            </span>
          </div>
        </div>
      </motion.div>

      {/* Video Modal with Embed */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute -top-12 right-0 p-2 text-white/60 hover:text-white transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="bg-black rounded-xl overflow-hidden border border-white/10">
                {isLoading ? (
                  <div className="aspect-[9/16] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-tiktok-cyan animate-spin" />
                  </div>
                ) : embedHtml ? (
                  <div
                    className="tiktok-embed-wrapper"
                    dangerouslySetInnerHTML={{
                      __html: embedHtml.replace(/width="\d+"/, 'width="100%"').replace(/height="\d+"/, 'height="600"')
                    }}
                  />
                ) : (
                  <div className="aspect-[9/16] relative">
                    {thumbnail ? (
                      <Image
                        src={thumbnail}
                        alt="Video thumbnail"
                        fill
                        className="object-cover"
                        sizes="400px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                        <Play className="w-16 h-16 text-zinc-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/70" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
                      <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                      </div>
                      <p className="text-sm text-white/70 text-center">
                        {username && videoId
                          ? "Watch this video on TikTok"
                          : "Preview available on TikTok"}
                      </p>
                      <button
                        onClick={handleOpenTikTok}
                        className="inline-flex items-center gap-2 bg-tiktok-cyan text-black px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-tiktok-cyan/90 transition-colors"
                      >
                        Watch on TikTok
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={handleOpenTikTok}
                  className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors px-4 py-2 bg-white/5 rounded-full"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in TikTok App
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Full-width embed variant for detail pages
interface TikTokFullEmbedProps {
  embedUrl?: string;
  fallbackImage?: string;
}

export function TikTokFullEmbed({ embedUrl, fallbackImage }: TikTokFullEmbedProps) {
  const [embedHtml, setEmbedHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (embedUrl) {
      fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(embedUrl)}`)
        .then(res => res.json())
        .then(data => {
          setEmbedHtml(data.html || null);
          setIsLoading(false);
        })
        .catch(() => {
          setEmbedHtml(null);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [embedUrl]);

  if (isLoading) {
    return (
      <div className="aspect-[9/16] max-h-[70vh] flex items-center justify-center bg-white/5 rounded-xl border border-white/10">
        <Loader2 className="w-8 h-8 text-tiktok-cyan animate-spin" />
      </div>
    );
  }

  if (!embedHtml) {
    return (
      <div className="aspect-[9/16] max-h-[70vh] relative bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        {fallbackImage && (
          <Image src={fallbackImage} alt="Video" fill className="object-cover" />
        )}
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <p className="text-white/50 text-sm">Video preview unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="tiktok-embed-full"
      dangerouslySetInnerHTML={{
        __html: embedHtml
          .replace(/width="\d+"/, 'width="100%"')
          .replace(/height="\d+"/, 'height="700"')
      }}
    />
  );
}
