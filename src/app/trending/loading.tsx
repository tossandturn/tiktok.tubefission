import { PageLoader, CardSkeleton } from "@/components/loading";

export default function Loading() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-10 bg-white/20 rounded animate-pulse w-64" />
        <div className="h-5 bg-white/10 rounded animate-pulse w-96" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-10 bg-white/10 rounded-full animate-pulse w-24"
          />
        ))}
      </div>

      {/* Trend cards */}
      <CardSkeleton count={9} />

      <PageLoader />
    </div>
  );
}
