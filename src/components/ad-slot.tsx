"use client";

import { cn } from "@/lib/utils";

interface AdSlotProps {
  position: "below-hero" | "between-sections" | "in-content";
  className?: string;
}

export function AdSlot({ position, className }: AdSlotProps) {
  const positionStyles = {
    "below-hero": "my-8 py-6 border-y border-white/5",
    "between-sections": "my-6 py-4",
    "in-content": "my-4 py-3",
  };

  return (
    <div
      className={cn(
        "w-full flex flex-col items-center justify-center",
        positionStyles[position],
        className
      )}
    >
      <span className="text-[10px] uppercase tracking-widest text-white/20 mb-2 font-mono">
        Sponsored
      </span>
      <div
        className={cn(
          "bg-white/5 rounded-lg flex items-center justify-center border border-white/5",
          position === "below-hero" && "w-full max-w-[728px] h-[90px]",
          position === "between-sections" && "w-full max-w-[468px] h-[60px]",
          position === "in-content" && "w-full max-w-[336px] h-[280px]"
        )}
      >
        <span className="text-xs text-white/15 font-mono">
          AdSense • {position.replace("-", " ")}
        </span>
      </div>
    </div>
  );
}
