import { PageLoader, CardSkeleton, StatsSkeleton, TableSkeleton } from "@/components/loading";

export default function Loading() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-10 bg-white/20 rounded animate-pulse w-64" />
        <div className="h-5 bg-white/10 rounded animate-pulse max-w-2xl" />
      </div>

      {/* Stats */}
      <StatsSkeleton />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-72 bg-white/5 rounded-xl animate-pulse" />
      </div>

      {/* Trend analysis */}
      <div className="space-y-4">
        <div className="h-8 bg-white/20 rounded animate-pulse w-48" />
        <div className="h-48 bg-white/5 rounded-xl animate-pulse" />
      </div>

      {/* Top performers */}
      <div className="space-y-4">
        <div className="h-8 bg-white/20 rounded animate-pulse w-48" />
        <TableSkeleton rows={8} />
      </div>

      <PageLoader />
    </div>
  );
}
