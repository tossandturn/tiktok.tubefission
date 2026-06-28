import { PageLoader, CardSkeleton } from "@/components/loading";

export default function Loading() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-10 bg-white/20 rounded animate-pulse w-48" />
        <div className="h-5 bg-white/10 rounded animate-pulse max-w-xl" />
      </div>

      {/* Search bar */}
      <div className="h-14 bg-white/10 rounded-xl animate-pulse" />

      {/* Category tabs */}
      <div className="flex gap-3 flex-wrap">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-10 bg-white/5 rounded-lg animate-pulse w-28"
          />
        ))}
      </div>

      {/* Results grid */}
      <CardSkeleton count={12} />

      <PageLoader />
    </div>
  );
}
