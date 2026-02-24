"use client";

import Link from "next/link";

export default function AuthError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h2 className="font-display text-2xl font-semibold text-forge-500">
        Authentication Error
      </h2>
      <p className="mt-2 text-sm text-void-200">
        Something went wrong during authentication.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-forge-500 px-4 py-2 text-sm font-medium text-void-950 transition-colors hover:bg-forge-300"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="rounded-md border border-forge-500 px-4 py-2 text-sm font-medium text-forge-500 transition-colors hover:bg-forge-500/10"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
