export default function CreatorLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-surface-hover" />
        <div className="h-4 w-72 animate-pulse rounded bg-surface-hover" />
        <div className="space-y-4 pt-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="h-20 w-full animate-pulse rounded-lg bg-surface-hover"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
