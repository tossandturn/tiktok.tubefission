"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Play, Heart } from "lucide-react";

interface VideoSectionProps {
  title: string;
  videos: Array<{
    id: string;
    thumbnail: string;
    views: string;
    likes: string;
    duration: string;
  }>;
}

export function VideoSection({ title, videos }: VideoSectionProps) {
  return (
    <section className="py-6">
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="text-lg font-bold text-white mb-4 px-4"
      >
        {title}
      </motion.h2>

      <div className="flex gap-3 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scrollbar-hide">
        {videos.map((video, i) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="flex-shrink-0 w-[160px] snap-start"
          >
            <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-white/5 group cursor-pointer">
              <Image
                src={video.thumbnail}
                alt="Video thumbnail"
                fill
                className="object-cover"
                sizes="160px"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-5 h-5 text-white fill-white" />
                </div>
              </div>

              {/* Duration */}
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                {video.duration}
              </div>

              {/* Stats overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-2 text-[10px] text-white/80">
                  <span className="flex items-center gap-0.5">
                    <Play className="w-3 h-3" />
                    {video.views}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Heart className="w-3 h-3" />
                    {video.likes}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
