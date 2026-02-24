"use client";

export default function MainError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="font-display text-2xl font-semibold text-forge-500">
        Something went wrong
      </h2>
      <p className="mt-2 text-sm text-void-200">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-md bg-forge-500 px-4 py-2 text-sm font-medium text-void-950 transition-colors hover:bg-forge-300"
      >
        Try Again
      </button>
    </div>
  );
}
