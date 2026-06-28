import { PageLoader, CardSkeleton, StatsSkeleton } from "@/components/loading";

export default function Loading() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Creator Header */}
      <div className="flex items-start gap-6">
        <div className="w-24 h-24 rounded-full bg-white/10 animate-pulse" />
        <div className="flex-1 space-y-3">
          <div className="h-8 bg-white/20 rounded animate-pulse w-48" />
          <div className="h-5 bg-white/10 rounded animate-pulse w-64" />
          <div className="flex gap-2 mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 bg-white/5 rounded-full animate-pulse w-24" />
            ))}
          </div>
        </div>
        <div className="w-32 h-10 bg-white/10 rounded-lg animate-pulse" />
      </div>

      {/* Stats */}
      <StatsSkeleton />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
      </div>

      {/* Videos */}
      <div className="space-y-4">
        <div className="h-8 bg-white/20 rounded animate-pulse w-48" />
        <CardSkeleton count={6} />
      </div>

      <PageLoader />
    </div>
  );
}
