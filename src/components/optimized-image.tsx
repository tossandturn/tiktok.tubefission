"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  onLoad?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  containerClassName,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 85,
  onLoad,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={cn(
          "bg-zinc-900 flex items-center justify-center",
          fill ? "absolute inset-0" : "",
          containerClassName
        )}
        style={!fill && width && height ? { width, height } : undefined}
      >
        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
          <span className="text-zinc-600 text-xs">?</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        fill ? "absolute inset-0" : "",
        containerClassName
      )}
      style={!fill && width && height ? { width, height } : undefined}
    >
      {/* Skeleton placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-zinc-900 animate-pulse" />
      )}

      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={cn(
          "object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        sizes={sizes}
        quality={quality}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => {
          setIsLoaded(true);
          onLoad?.();
        }}
        onError={() => setHasError(true)}
      />
    </div>
  );
}

// Avatar component optimized for profile pictures
export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className,
}: {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={cn(
          "bg-zinc-800 rounded-full flex items-center justify-center",
          className
        )}
        style={{ width: size, height: size }}
      >
        <span className="text-zinc-600 text-sm font-medium">
          {alt.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("rounded-full object-cover", className)}
      quality={80}
      sizes={`${size}px`}
    />
  );
}

// Thumbnail component for video/content cards
export function OptimizedThumbnail({
  src,
  alt,
  aspectRatio = "3/4",
  className,
  containerClassName,
  priority = false,
}: {
  src: string;
  alt: string;
  aspectRatio?: "3/4" | "1/1" | "16/9";
  className?: string;
  containerClassName?: string;
  priority?: boolean;
}) {
  const aspectClass = {
    "3/4": "aspect-[3/4]",
    "1/1": "aspect-square",
    "16/9": "aspect-video",
  }[aspectRatio];

  return (
    <div className={cn("relative overflow-hidden bg-zinc-900", aspectClass, containerClassName)}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        className={className}
        priority={priority}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        quality={85}
      />
    </div>
  );
}
