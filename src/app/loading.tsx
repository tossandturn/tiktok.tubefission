import { PageLoader, CardSkeleton, StatsSkeleton } from "@/components/loading";

export default function Loading() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Hero Section Skeleton */}
      <div className="text-center py-12 space-y-4">
        <div className="h-12 bg-white/20 rounded animate-pulse max-w-2xl mx-auto" />
        <div className="h-6 bg-white/10 rounded animate-pulse max-w-xl mx-auto" />
        <div className="h-4 bg-white/5 rounded animate-pulse max-w-lg mx-auto" />
      </div>

      {/* Stats Section */}
      <StatsSkeleton />

      {/* Trending Section */}
      <div className="space-y-4">
        <div className="h-8 bg-white/20 rounded animate-pulse w-48" />
        <CardSkeleton count={6} />
      </div>

      {/* Loading indicator */}
      <PageLoader />
    </div>
  );
}
