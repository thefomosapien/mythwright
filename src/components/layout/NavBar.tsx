"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Profile } from "@/lib/types/database";
import Button from "@/components/ui/Button";

export interface NavBarProps {
  user: { id: string } | null;
  profile: Pick<Profile, "username" | "display_name" | "avatar_url" | "role"> | null;
}

export default function NavBar({ user, profile }: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="font-display text-lg font-bold tracking-[0.2em] text-forge-500 uppercase">
          Mythwright
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-4 sm:flex">
          {user && profile ? (
            <>
              {profile.role === "creator" && (
                <Link
                  href="/create"
                  className="text-sm text-foreground-muted hover:text-foreground transition-colors"
                >
                  Create
                </Link>
              )}
              <Link
                href={`/profile/${profile.username}`}
                className="flex items-center gap-2 rounded-full p-1 hover:bg-surface-hover transition-colors"
              >
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/20 text-sm font-medium text-gold">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="inline-flex">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link href="/signup" className="inline-flex">
                <Button variant="primary" size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded p-1.5 text-foreground-muted hover:text-foreground sm:hidden"
          aria-label="Toggle menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-border bg-background px-4 py-3 sm:hidden">
          {user && profile ? (
            <div className="space-y-2">
              {profile.role === "creator" && (
                <Link
                  href="/create"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded px-3 py-2 text-sm text-foreground-muted hover:bg-surface-hover"
                >
                  Create
                </Link>
              )}
              <Link
                href={`/profile/${profile.username}`}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded px-3 py-2 text-sm text-foreground-muted hover:bg-surface-hover"
              >
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-xs font-medium text-gold">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span>{profile.display_name}</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block rounded px-3 py-2 text-sm text-foreground-muted hover:bg-surface-hover"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="block rounded px-3 py-2 text-sm text-gold hover:bg-surface-hover"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
