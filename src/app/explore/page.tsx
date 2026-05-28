import { Suspense } from "react";
import ExploreContent from "./explore-content";

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="max-w-lg mx-auto px-4 pt-6 pb-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded w-1/3" />
          <div className="h-10 bg-white/5 rounded w-full" />
          <div className="h-6 bg-white/5 rounded w-2/3" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
