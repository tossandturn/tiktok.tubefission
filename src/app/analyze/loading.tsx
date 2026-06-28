import { PageLoader } from "@/components/loading";

export default function Loading() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-10 bg-white/20 rounded animate-pulse w-64" />
        <div className="h-5 bg-white/10 rounded animate-pulse max-w-xl" />
      </div>

      {/* Input area */}
      <div className="h-20 bg-white/5 rounded-xl animate-pulse" />

      {/* Results area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
      </div>

      <PageLoader />
    </div>
  );
}
