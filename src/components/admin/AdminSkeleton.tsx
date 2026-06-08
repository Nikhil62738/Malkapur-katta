// Reusable shimmer skeletons for the admin panel loading states.
// Uses the global `.skeleton` shimmer class (same one as the public site).

export function AdminGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-950/40 border border-slate-850 rounded-2xl overflow-hidden shadow-lg"
        >
          <div className="skeleton h-44 w-full" />
          <div className="p-5 space-y-3">
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-5 w-3/4 rounded" />
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-2/3 rounded" />
            <div className="flex gap-2 pt-2">
              <div className="skeleton h-8 w-8 rounded-lg" />
              <div className="skeleton h-8 w-8 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="bg-slate-950/40 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
      <div className="border-b border-slate-850 bg-slate-950/60 p-4 flex gap-4">
        <div className="skeleton h-3 w-32 rounded" />
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-3 w-20 rounded ml-auto" />
      </div>
      <div className="divide-y divide-slate-850/80">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <div className="skeleton h-10 w-10 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3 w-1/2 rounded" />
              <div className="skeleton h-3 w-1/3 rounded" />
            </div>
            <div className="skeleton h-8 w-16 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminPanelSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="space-y-2">
          <div className="skeleton h-8 w-64 rounded" />
          <div className="skeleton h-3 w-80 rounded" />
        </div>
        <div className="skeleton h-10 w-32 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-slate-950/40 border border-slate-850 rounded-2xl p-6 space-y-4"
          >
            <div className="skeleton h-3 w-24 rounded" />
            <div className="skeleton h-10 w-full rounded-lg" />
            <div className="skeleton h-3 w-32 rounded" />
            <div className="skeleton h-24 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminStatsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 space-y-3"
        >
          <div className="skeleton h-3 w-20 rounded" />
          <div className="skeleton h-8 w-12 rounded" />
        </div>
      ))}
    </div>
  );
}
