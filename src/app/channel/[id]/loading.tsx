import { PageLoader, CardSkeleton, StatsSkeleton } from "@/components/loading";

export default function Loading() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Channel Header */}
      <div className="flex items-start gap-6">
        <div className="w-20 h-20 rounded-full bg-white/10 animate-pulse" />
        <div className="flex-1 space-y-3">
          <div className="h-8 bg-white/20 rounded animate-pulse w-48" />
          <div className="h-5 bg-white/10 rounded animate-pulse w-80" />
          <div className="flex gap-4 mt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-5 bg-white/5 rounded animate-pulse w-24" />
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <StatsSkeleton />

      {/* Performance chart */}
      <div className="h-80 bg-white/5 rounded-xl animate-pulse" />

      {/* Recent content */}
      <div className="space-y-4">
        <div className="h-8 bg-white/20 rounded animate-pulse w-48" />
        <CardSkeleton count={6} />
      </div>

      <PageLoader />
    </div>
  );
}
