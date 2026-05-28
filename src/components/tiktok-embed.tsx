"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, ExternalLink } from "lucide-react";
import Image from "next/image";

interface TikTokEmbedProps {
  videoId?: string;
  thumbnail: string;
  views: string;
  likes: string;
  duration: string;
  searchQuery?: string;
}

export function TikTokEmbed({ videoId, thumbnail, views, likes, duration, searchQuery }: TikTokEmbedProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenTikTok = useCallback(() => {
    const query = searchQuery || (videoId ? `video ${videoId}` : "trending");
    window.open(`https://www.tiktok.com/search?q=${encodeURIComponent(query)}`, "_blank", "noopener,noreferrer");
  }, [searchQuery, videoId]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="flex-shrink-0 w-[160px] snap-start"
      >
        <div
          className="relative aspect-[9/16] rounded-xl overflow-hidden bg-white/5 group cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <Image
            src={thumbnail}
            alt="Video thumbnail"
            fill
            className="object-cover"
            sizes="160px"
          />
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

          {/* Stats overlay at bottom */}
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
        </div>
      </motion.div>

      {/* Video Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute -top-12 right-0 p-2 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Thumbnail with CTA */}
              <div className="relative aspect-[9/16] w-full max-h-[70vh] rounded-xl overflow-hidden bg-black">
                <Image
                  src={thumbnail}
                  alt="Video thumbnail"
                  fill
                  className="object-cover"
                  sizes="400px"
                />
                <div className="absolute inset-0 bg-black/60" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  </div>
                  <p className="text-sm text-white/70 text-center">
                    Preview not available — watch the full trend on TikTok
                  </p>
                  <button
                    onClick={handleOpenTikTok}
                    className="inline-flex items-center gap-2 bg-white text-tiktok-black px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors"
                  >
                    Search on TikTok
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Open in TikTok button */}
              <div className="mt-3 text-center">
                <button
                  onClick={handleOpenTikTok}
                  className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-tiktok-cyan transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open original on TikTok
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
