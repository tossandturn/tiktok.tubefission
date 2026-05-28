"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface FloatingTagsProps {
  tags: string[];
  className?: string;
}

export function FloatingTags({ tags, className }: FloatingTagsProps) {
  const router = useRouter();

  const handleClick = (tag: string) => {
    router.push(`/explore?category=${encodeURIComponent(tag)}`);
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag, i) => (
        <motion.div
          key={tag}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            delay: i * 0.08,
            duration: 0.4,
            type: "spring",
            stiffness: 300,
          }}
        >
          <Badge
            variant="secondary"
            onClick={() => handleClick(tag)}
            className="bg-white/10 hover:bg-white/15 text-white/90 backdrop-blur-md border-0 px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer"
          >
            {tag}
          </Badge>
        </motion.div>
      ))}
    </div>
  );
}
