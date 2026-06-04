"use client";

import Link from "next/link";
import Image from "next/image";
import { Users, Hash, Video, TrendingUp } from "lucide-react";

interface Creator {
  id: string;
  username: string;
  displayName: string;
  avatar?: string | null;
  followers: number;
  niche?: string | null;
}

interface Hashtag {
  id: string;
  name: string;
  views: string;
  viralScore?: number | null;
}

interface Video {
  id: string;
  title?: string;
  thumbnail?: string | null;
  views: string;
}

interface RelatedContentProps {
  creators?: Creator[];
  hashtags?: Hashtag[];
  videos?: Video[];
  currentType: "creator" | "video" | "hashtag" | "trend";
  currentName: string;
}

export function RelatedContent({
  creators = [],
  hashtags = [],
  videos = [],
  currentType,
  currentName,
}: RelatedContentProps) {
  const hasContent = creators.length > 0 || hashtags.length > 0 || videos.length > 0;

  if (!hasContent) return null;

  return (
    <section className="py-16 px-4 bg-zinc-950 border-t border-zinc-900">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#00f2ea]" />
          Related to {currentName}
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Related Creators */}
          {creators.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Similar Creators
              </h3>
              <div className="space-y-3">
                {creators.map((creator) => (
                  <Link
                    key={creator.id}
                    href={`/creator/${creator.username}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-[#00f2ea]/50 hover:bg-zinc-800/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden">
                      {creator.avatar ? (
                        <Image
                          src={creator.avatar}
                          alt={creator.displayName}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                          {creator.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white group-hover:text-[#00f2ea] transition-colors truncate">
                        {creator.displayName}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {creator.followers.toLocaleString()} followers
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related Hashtags */}
          {hashtags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-4 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Related Hashtags
              </h3>
              <div className="flex flex-wrap gap-2">
                {hashtags.map((hashtag) => (
                  <Link
                    key={hashtag.id}
                    href={`/hashtag/${encodeURIComponent(hashtag.name)}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 hover:bg-zinc-800 hover:border-[#ff0050]/50 hover:text-white transition-colors"
                  >
                    #{hashtag.name}
                    {hashtag.viralScore && hashtag.viralScore > 80 && (
                      <span className="ml-1.5 text-[10px] text-[#ff0050]">●</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related Videos */}
          {videos.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-4 flex items-center gap-2">
                <Video className="w-4 h-4" />
                Related Videos
              </h3>
              <div className="space-y-3">
                {videos.map((video) => (
                  <Link
                    key={video.id}
                    href={`/video/${video.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-[#00f2ea]/50 hover:bg-zinc-800/50 transition-colors group"
                  >
                    <div className="w-16 h-9 rounded bg-zinc-800 overflow-hidden flex-shrink-0">
                      {video.thumbnail ? (
                        <Image
                          src={video.thumbnail}
                          alt={video.title || "Video"}
                          width={64}
                          height={36}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-4 h-4 text-zinc-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-300 truncate group-hover:text-[#00f2ea] transition-colors">
                        {video.title || "TikTok Video"}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        {video.views} views
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
