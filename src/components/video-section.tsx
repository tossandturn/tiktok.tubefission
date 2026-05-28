"use client";

import { motion } from "framer-motion";
import { TikTokEmbed } from "./tiktok-embed";

interface Video {
  id: string;
  videoId?: string;
  thumbnail: string;
  views: string;
  likes: string;
  duration: string;
}

interface VideoSectionProps {
  title: string;
  videos: Video[];
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
        {videos.map((video) => (
          <TikTokEmbed
            key={video.id}
            videoId={video.videoId}
            thumbnail={video.thumbnail}
            views={video.views}
            likes={video.likes}
            duration={video.duration}
          />
        ))}
      </div>
    </section>
  );
}
