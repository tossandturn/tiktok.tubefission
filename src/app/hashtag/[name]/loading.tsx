import { PageLoader, CardSkeleton, StatsSkeleton } from "@/components/loading";

export default function Loading() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Hashtag Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-pink-500/20 animate-pulse" />
          <div className="h-10 bg-white/20 rounded animate-pulse w-64" />
        </div>
        <div className="h-5 bg-white/10 rounded animate-pulse max-w-xl" />
      </div>

      {/* Stats */}
      <StatsSkeleton />

      {/* Charts */}
      <div className="h-72 bg-white/5 rounded-xl animate-pulse" />

      {/* Top videos */}
      <div className="space-y-4">
        <div className="h-8 bg-white/20 rounded animate-pulse w-48" />
        <CardSkeleton count={6} />
      </div>

      <PageLoader />
    </div>
  );
}
