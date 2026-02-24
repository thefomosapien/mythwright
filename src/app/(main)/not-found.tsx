import Link from "next/link";

export default function MainNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-5xl font-bold text-forge-500">404</h1>
      <p className="mt-4 font-prose text-lg text-void-200">
        This page has been lost to the void.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md bg-forge-500 px-4 py-2 text-sm font-medium text-void-950 transition-colors hover:bg-forge-300"
      >
        Back to Discovery
      </Link>
    </div>
  );
}
