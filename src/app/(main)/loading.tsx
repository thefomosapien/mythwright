export default function MainLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Hero skeleton */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <div className="h-10 w-64 animate-pulse rounded bg-surface-hover" />
        <div className="h-5 w-96 animate-pulse rounded bg-surface-hover" />
      </div>

      {/* Grid skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg border border-border bg-surface"
          >
            <div className="aspect-[16/9] animate-pulse bg-surface-hover" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-3/4 animate-pulse rounded bg-surface-hover" />
              <div className="h-4 w-full animate-pulse rounded bg-surface-hover" />
              <div className="flex gap-2">
                <div className="h-5 w-16 animate-pulse rounded-full bg-surface-hover" />
                <div className="h-5 w-16 animate-pulse rounded-full bg-surface-hover" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
