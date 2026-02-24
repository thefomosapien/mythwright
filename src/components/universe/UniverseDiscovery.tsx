"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import UniverseCard from "./UniverseCard";
import type { UniverseCardData } from "./UniverseCard";

type SortOption = "newest" | "most_followed" | "recently_updated";

interface UniverseDiscoveryProps {
  initialUniverses: UniverseCardData[];
  genres: string[];
}

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  most_followed: "Most Followed",
  recently_updated: "Recently Updated",
};

const PAGE_SIZE = 20;

export default function UniverseDiscovery({
  initialUniverses,
  genres,
}: UniverseDiscoveryProps) {
  const [universes, setUniverses] = useState<UniverseCardData[]>(initialUniverses);
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("newest");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(initialUniverses.length);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = useMemo(() => createClient(), []);
  const genreScrollRef = useRef<HTMLDivElement>(null);

  const fetchUniverses = useCallback(
    async (searchTerm: string, genre: string | null, sortBy: SortOption, pageNum: number) => {
      setLoading(true);

      let query = supabase
        .from("universes")
        .select(
          "id, slug, title, tagline, content_rating, genre, cover_image_url, follower_count, created_at, updated_at, creator_id, profiles!universes_creator_id_fkey(username, display_name, avatar_url)",
          { count: "exact" }
        )
        .eq("status", "published");

      if (searchTerm.trim()) {
        query = query.or(
          `title.ilike.%${searchTerm.trim()}%,tagline.ilike.%${searchTerm.trim()}%`
        );
      }

      if (genre) {
        query = query.contains("genre", [genre]);
      }

      switch (sortBy) {
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "most_followed":
          query = query.order("follower_count", { ascending: false });
          break;
        case "recently_updated":
          query = query.order("updated_at", { ascending: false });
          break;
      }

      query = query.range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      const { data, count } = await query;

      if (data) {
        const mapped: UniverseCardData[] = data.map((u) => {
          const profile = u.profiles as unknown as {
            username: string;
            display_name: string;
            avatar_url: string | null;
          } | null;
          return {
            id: u.id,
            slug: u.slug,
            title: u.title,
            tagline: u.tagline,
            content_rating: u.content_rating as UniverseCardData["content_rating"],
            genre: u.genre || [],
            cover_image_url: u.cover_image_url,
            follower_count: u.follower_count,
            creator: profile
              ? {
                  username: profile.username,
                  display_name: profile.display_name,
                  avatar_url: profile.avatar_url,
                }
              : null,
          };
        });
        setUniverses(mapped);
        setTotalCount(count ?? mapped.length);
      }

      setLoading(false);
    },
    [supabase]
  );

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      fetchUniverses(search, selectedGenre, sort, 0);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, selectedGenre, sort, fetchUniverses]);

  // Page changes
  useEffect(() => {
    if (page > 0) {
      fetchUniverses(search, selectedGenre, sort, page);
    }
    // Only trigger on page change, not on search/genre/sort (those reset page to 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleClearSearch = () => {
    setSearch("");
  };

  return (
    <div>
      {/* Search bar */}
      <div className="relative mx-auto mb-6 max-w-xl">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg
            className="h-5 w-5 text-void-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search universes by title or tagline..."
          className="w-full rounded-lg border border-void-700 bg-void-900 py-3 pl-10 pr-10 text-void-50 placeholder-void-400 focus:border-forge-500 focus:outline-none focus:ring-1 focus:ring-forge-500"
        />
        {search && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-void-400 hover:text-void-200"
            aria-label="Clear search"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Genre filter pills */}
      <div
        ref={genreScrollRef}
        className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-thin"
      >
        <button
          onClick={() => setSelectedGenre(null)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            selectedGenre === null
              ? "bg-forge-500 text-void-950"
              : "border border-void-600 text-void-200 hover:border-void-500 hover:text-void-100"
          }`}
        >
          All
        </button>
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedGenre === genre
                ? "bg-forge-500 text-void-950"
                : "border border-void-600 text-void-200 hover:border-void-500 hover:text-void-100"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Sort options */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-void-300">
          {totalCount} {totalCount === 1 ? "universe" : "universes"}
          {search && ` matching "${search}"`}
          {selectedGenre && ` in ${selectedGenre}`}
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-sm text-void-400">
            Sort:
          </label>
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-md border border-void-700 bg-void-900 px-3 py-1.5 text-sm text-void-100 focus:border-forge-500 focus:outline-none focus:ring-1 focus:ring-forge-500"
          >
            {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Universe grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-void-700 bg-void-800">
              <div className="aspect-[16/9] rounded-t-lg bg-void-700" />
              <div className="space-y-3 p-4">
                <div className="h-5 w-3/4 rounded bg-void-700" />
                <div className="h-4 w-full rounded bg-void-700" />
                <div className="h-4 w-1/2 rounded bg-void-700" />
              </div>
            </div>
          ))}
        </div>
      ) : universes.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {universes.map((universe) => (
            <UniverseCard
              key={universe.id}
              universe={universe}
              showCreator
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-void-700 bg-void-800 px-8 py-16 text-center">
          {search ? (
            <p className="font-prose text-void-200">
              No worlds match your search. Try different keywords.
            </p>
          ) : selectedGenre ? (
            <p className="font-prose text-void-200">
              No {selectedGenre} universes yet. Check back soon.
            </p>
          ) : (
            <div>
              <p className="mb-4 font-prose text-lg text-void-200">
                No worlds have been forged yet. Be the first.
              </p>
              <a
                href="/signup"
                className="inline-flex items-center justify-center rounded-md bg-forge-500 px-6 py-3 text-base font-medium text-void-950 transition-colors hover:bg-forge-300"
              >
                Start Creating
              </a>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="rounded-md border border-void-700 px-3 py-2 text-sm text-void-200 transition-colors hover:border-void-500 hover:text-void-100 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Previous
          </button>
          <span className="px-4 text-sm text-void-300">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-md border border-void-700 px-3 py-2 text-sm text-void-200 transition-colors hover:border-void-500 hover:text-void-100 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
