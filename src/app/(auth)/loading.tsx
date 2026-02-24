export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-8 w-32 animate-pulse rounded bg-surface-hover" />
        <div className="mx-auto h-64 w-80 animate-pulse rounded-lg bg-surface-hover" />
      </div>
    </div>
  );
}
