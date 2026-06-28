import { PageLoader, CardSkeleton, StatsSkeleton, TableSkeleton } from "@/components/loading";

export default function Loading() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Trend Header */}
      <div className="flex items-start gap-6">
        <div className="w-20 h-20 rounded-xl bg-white/10 animate-pulse" />
        <div className="flex-1 space-y-3">
          <div className="h-8 bg-white/20 rounded animate-pulse w-64" />
          <div className="h-5 bg-white/10 rounded animate-pulse w-96" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-6 bg-white/5 rounded-full animate-pulse w-20" />
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <StatsSkeleton />

      {/* Chart area */}
      <div className="h-64 bg-white/5 rounded-xl animate-pulse" />

      {/* Videos section */}
      <div className="space-y-4">
        <div className="h-8 bg-white/20 rounded animate-pulse w-48" />
        <TableSkeleton rows={5} />
      </div>

      <PageLoader />
    </div>
  );
}
