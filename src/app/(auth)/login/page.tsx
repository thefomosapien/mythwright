"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_onboarded")
        .eq("id", user.id)
        .single();

      if (!profile || !profile.is_onboarded) {
        router.push("/onboarding");
      } else {
        router.push("/");
      }
    }

    router.refresh();
  }

  async function handleGoogleLogin() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8">
        <h1 className="mb-2 text-center text-2xl font-bold text-gold">
          Welcome Back
        </h1>
        <p className="mb-8 text-center text-sm text-foreground-muted">
          Sign in to Mythwright
        </p>

        {error && (
          <div className="mb-4 rounded border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-foreground-muted"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded border border-border bg-background-secondary px-3 py-2 text-foreground placeholder-foreground-subtle focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-foreground-muted"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded border border-border bg-background-secondary px-3 py-2 text-foreground placeholder-foreground-subtle focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-gold px-4 py-2 font-medium text-background transition-colors hover:bg-gold-light disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Log In"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-foreground-subtle">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full rounded border border-border bg-background-secondary px-4 py-2 font-medium text-foreground transition-colors hover:bg-surface-hover"
        >
          Sign in with Google
        </button>

        <p className="mt-6 text-center text-sm text-foreground-muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-gold hover:text-gold-light">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
