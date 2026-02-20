"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function OnboardingPage() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_onboarded")
        .eq("id", user.id)
        .single();

      if (profile?.is_onboarded) {
        router.push("/");
        return;
      }

      setCheckingAuth(false);
    }

    checkAuth();
  }, [supabase, router]);

  const usernameRegex = /^[a-z0-9_]{3,30}$/;

  async function validateUsername(value: string) {
    if (!value) {
      setUsernameError(null);
      return;
    }

    if (!usernameRegex.test(value)) {
      setUsernameError(
        "3-30 characters, lowercase letters, numbers, and underscores only."
      );
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", value)
      .maybeSingle();

    if (data) {
      setUsernameError("This username is already taken.");
    } else {
      setUsernameError(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!usernameRegex.test(username)) {
      setError(
        "Username must be 3-30 characters, lowercase letters, numbers, and underscores only."
      );
      return;
    }

    if (!displayName.trim() || displayName.length > 60) {
      setError("Display name is required (max 60 characters).");
      return;
    }

    if (!birthYear || !birthMonth || !birthDay) {
      setError("Date of birth is required.");
      return;
    }

    const birthDate = `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`;
    const dateObj = new Date(birthDate);
    if (isNaN(dateObj.getTime())) {
      setError("Please enter a valid date of birth.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in to complete onboarding.");
      setLoading(false);
      return;
    }

    let finalAvatarUrl: string | null = avatarUrl || null;

    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) {
        setError(`Avatar upload failed: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);
      finalAvatarUrl = publicUrl;
    }

    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      username,
      display_name: displayName.trim(),
      birth_date: birthDate,
      avatar_url: finalAvatarUrl,
      role: "reader",
      is_onboarded: true,
    });

    if (insertError) {
      if (insertError.message.includes("duplicate key")) {
        if (insertError.message.includes("username")) {
          setError("This username is already taken.");
        } else {
          setError(
            "A profile already exists for this account. Redirecting..."
          );
          setTimeout(() => router.push("/"), 2000);
        }
      } else {
        setError(insertError.message);
      }
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 120 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-foreground-muted">Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8">
        <h1 className="mb-2 text-center text-2xl font-bold text-gold">
          Complete Your Profile
        </h1>
        <p className="mb-8 text-center text-sm text-foreground-muted">
          Tell us a bit about yourself to get started.
        </p>

        {error && (
          <div className="mb-4 rounded border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="mb-1 block text-sm font-medium text-foreground-muted"
            >
              Username *
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                const val = e.target.value.toLowerCase();
                setUsername(val);
                validateUsername(val);
              }}
              required
              maxLength={30}
              className="w-full rounded border border-border bg-background-secondary px-3 py-2 text-foreground placeholder-foreground-subtle focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              placeholder="your_username"
            />
            {usernameError && (
              <p className="mt-1 text-xs text-error">{usernameError}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="displayName"
              className="mb-1 block text-sm font-medium text-foreground-muted"
            >
              Display Name *
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              maxLength={60}
              className="w-full rounded border border-border bg-background-secondary px-3 py-2 text-foreground placeholder-foreground-subtle focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              placeholder="How you want to be known"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground-muted">
              Date of Birth *
            </label>
            <div className="flex gap-2">
              <select
                value={birthMonth}
                onChange={(e) => setBirthMonth(e.target.value)}
                required
                className="flex-1 rounded border border-border bg-background-secondary px-3 py-2 text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              >
                <option value="">Month</option>
                {months.map((m) => (
                  <option key={m} value={String(m)}>
                    {new Date(2000, m - 1).toLocaleString("default", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>
              <select
                value={birthDay}
                onChange={(e) => setBirthDay(e.target.value)}
                required
                className="w-20 rounded border border-border bg-background-secondary px-3 py-2 text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              >
                <option value="">Day</option>
                {days.map((d) => (
                  <option key={d} value={String(d)}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                required
                className="w-24 rounded border border-border bg-background-secondary px-3 py-2 text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              >
                <option value="">Year</option>
                {years.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-2 text-xs text-foreground-subtle">
              Your date of birth is used to determine which content you can
              access. It is never displayed on your profile.
            </p>
          </div>

          <div>
            <label
              htmlFor="avatar"
              className="mb-1 block text-sm font-medium text-foreground-muted"
            >
              Avatar (optional)
            </label>
            <input
              id="avatarUrl"
              type="url"
              value={avatarUrl}
              onChange={(e) => {
                setAvatarUrl(e.target.value);
                setAvatarFile(null);
              }}
              className="w-full rounded border border-border bg-background-secondary px-3 py-2 text-foreground placeholder-foreground-subtle focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              placeholder="https://example.com/avatar.png"
            />
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-foreground-subtle">or</span>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setAvatarFile(file);
                  if (file) setAvatarUrl("");
                }}
                className="text-sm text-foreground-muted file:mr-2 file:rounded file:border-0 file:bg-background-tertiary file:px-3 file:py-1 file:text-sm file:text-foreground-muted hover:file:bg-surface-hover"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !!usernameError}
            className="w-full rounded bg-gold px-4 py-2 font-medium text-background transition-colors hover:bg-gold-light disabled:opacity-50"
          >
            {loading ? "Setting up your profile..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </main>
  );
}
